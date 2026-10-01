// Audit 3a: every control in every state, by real keyboard and mouse input.
// For each state: set it up (real input where possible, hooks to place things), press one input, then release
// everything and check the character recovers (no T-pose, no stuck mode, no watchdog report, can walk again).
// Usage: node tools/audit/controls.mjs [firstState] [lastState]   → audit/controls-<a>-<b>.json
import fs from 'fs';
import { open, park, SHOTS } from './lib.mjs';

const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space', 'KeyC', 'KeyV', 'KeyE', 'KeyR', 'KeyT', 'KeyX', 'KeyG', 'KeyQ', 'KeyF', 'KeyZ', 'KeyB', 'KeyH', 'KeyI', 'KeyM', 'KeyY', 'Tab', 'Escape', 'Enter',
  'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'wheel+', 'wheel-', 'shift+wheel', 'lmb-tap', 'lmb-hold', 'rmb-tap', 'rmb-hold', 'mmb'];

const { b, p, ev, log, alert, closeAlert } = await open();
const held = new Set(); const btns = new Set();
const down = async (k) => { await p.keyboard.down(k); held.add(k); };
const up = async (k) => { await p.keyboard.up(k); held.delete(k); };
const adv = (s) => ev((s) => __game.advance(s), s);
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const snap = () => ev(() => {
  const g = __game, hid = (id) => !document.getElementById(id)?.hidden;
  const fs = g.forceState();
  return { mode: g.mode, gear: g.gear, gait: g.gait, atk: g.atk, blocking: g.blocking, grapple: g.grappleState, cover: !!g.cover, reload: !!g.reload, looting: !!g.looting, takedown: g.takedown, dash: g.dash,
    dead: !!g.dead, speed: +g.speed.toFixed(2), pos: g.pos, pose: { dev: +g.pose.dev.toFixed(2), leg: +g.pose.leg.toFixed(2), arm: +g.pose.arm.toFixed(2) }, ovr: g.overrides, slot: g.inv.active,
    gun: g.gunKind, choke: fs.choke, zap: fs.zap, thrown: fs.thrown, crouch: g.crouch, sneak: g.sneak, jumps: g.jumps, inv: hid('inv'), weapon: hid('weapon'), moves: hid('moves'), missions: hid('missions'),
    mission: g.mission && g.mission.state, shoulder: g.shoulder, fov: +g.fov.toFixed(1), grenades: g.countItem('grenade'), nadesOut: g.grenadesOut.length, mags: g.ammoMags(), hp: g.hp,
    locked: document.pointerLockElement === document.querySelector('canvas'), camPos: g.camPos.map((v) => +v.toFixed(2)), y: +g.y.toFixed(2) };
});
async function press(k, hold = 0.3) {
  if (k.startsWith('wheel')) { await p.mouse.move(640, 300); await p.mouse.wheel(0, k === 'wheel+' ? 120 : -120); await adv(hold); return; }
  if (k === 'shift+wheel') { await down('ShiftLeft'); await p.mouse.wheel(0, 300); await up('ShiftLeft'); await adv(hold); return; }
  const m = { 'lmb-tap': ['left', 0.05], 'lmb-hold': ['left', 1.2], 'rmb-tap': ['right', 0.05], 'rmb-hold': ['right', 1.2], mmb: ['middle', 0.6] }[k];
  if (m) { await p.mouse.down({ button: m[0] }); btns.add(m[0]); await adv(m[1]); await p.mouse.up({ button: m[0] }); btns.delete(m[0]); await adv(hold); return; }
  await down(k); await adv(k === 'Space' || k === 'KeyC' ? 0.5 : hold); await up(k); await adv(0.1);
}
async function releaseAll() { for (const k of [...held]) await up(k); for (const m of [...btns]) { await p.mouse.up({ button: m }); btns.delete(m); } }
async function reset() {
  await releaseAll();
  await ev(() => {
    const g = __game; if (g.dead) g.respawn(); g.closeMoves(); g.toggleInv(false);
    for (const id of ['weapon', 'missions']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    if (g.mission) g.endMission('quit'); for (const id of ['mdone', 'deathpanel']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    g.leaveCover('audit'); if (g.grappleState === 'pull' || g.grappleState === 'fire') g.grapplePress();
    g.setGadget('jetpack', false); g.setGadget('swing', false); g.setSneak(false); g.setDifficulty('sandbox'); g.setRmb(false); g.setAim(false); g.blockRelease(); g.attackRelease(); g.zapEnd(); g.chokeEnd?.(false);
    g.setClass('light'); g.setMode('ground', 0); g.place(0, -2); g.look(Math.PI, 0.28); g.selectSlot(0, true); g.setGear('lit'); g.advance(2.5);
  });
  await closeAlert(); await lock();
}
// The Force and the saber + blaster sit in the backpack: swap one into hotbar slot 5 (the AK's) when a state needs it.
const toSlot5 = (id) => ev((id) => { const I = __game.inv, bi = I.bag.findIndex((x) => x && x.id === id); if (bi < 0) return; const t = I.hot[4]; I.hot[4] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(4, true); __game.advance(1.2); }, id);
const enemyAhead = (d = 6, facingAway = false, mind = 'patrol') => ev(([d, fa, mind]) => { __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, 0, -2 - d, fa ? Math.PI : 0); __game.setMind(0, mind, 999); __game.faceEnemy(0, fa ? Math.PI : 0); __game.advance(0.2); }, [d, facingAway, mind]);
const grappleAim = async () => { await ev(() => { __game.place(0, -2); __game.look(Math.atan2(4, -11), -0.05); __game.advance(0.3); }); };

// Each state: name, setup (leaves the state live), check that it took (from a snap)
const STATES = [
  ['standing', async () => {}, (s) => s.mode === 'ground'],
  ['sneaking', async () => { await down('KeyV'); await up('KeyV'); await down('KeyW'); await adv(0.8); }, (s) => s.sneak && s.speed > 0.5 && s.speed < 1.8],
  ['jogging', async () => { await down('KeyW'); await adv(0.8); }, (s) => s.speed > 2.5],
  ['sprinting', async () => { await down('KeyW'); await down('ShiftLeft'); await adv(1.2); }, (s) => s.speed > 5],
  ['crouching', async () => { await ev(() => __game.setGear('none')); await adv(0.6); await down('KeyC'); await adv(0.1); await up('KeyC'); await adv(0.4); }, (s) => s.crouch],
  ['sliding', async () => { await down('KeyW'); await down('ShiftLeft'); await adv(1.2); await down('KeyC'); await adv(0.12); }, (s) => s.mode === 'slide'],
  ['jump-1', async () => { await down('Space'); await adv(0.05); await up('Space'); await adv(0.2); }, (s) => s.mode === 'air' && s.jumps >= 1],
  ['jump-2', async () => { await down('Space'); await adv(0.05); await up('Space'); await adv(0.3); await down('Space'); await adv(0.05); await up('Space'); await adv(0.15); }, (s) => s.mode === 'air' && s.jumps >= 2],
  ['jump-3', async () => { await ev(() => __game.setClass('force')); for (let i = 0; i < 3; i++) { await down('Space'); await adv(0.05); await up('Space'); await adv(0.3); } }, (s) => s.mode === 'air' && s.jumps >= 3],
  ['falling-high', async () => { await ev(() => { __game.setMode('air', 30); __game.advance(0.3); }); }, (s) => s.mode === 'air' && s.y > 20],
  ['jetpack', async () => { await ev(() => __game.setGadget('jetpack', true)); await down('Space'); await adv(0.1); await up('Space'); await adv(0.1); await down('Space'); await adv(0.8); }, (s) => s.mode === 'jet'],
  ['jet-hover', async () => { await ev(() => __game.setGadget('jetpack', true)); await down('Space'); await adv(0.1); await up('Space'); await adv(0.1); await down('Space'); await adv(0.8); await down('KeyC'); await adv(0.3); }, (s) => s.mode === 'jet'],
  ['grapple-pull', async () => { await grappleAim(); await down('KeyR'); await up('KeyR'); await adv(0.35); }, (s) => s.grapple === 'pull' || s.grapple === 'fire'],
  ['grapple-swing', async () => { await ev(() => { __game.setGadget('swing', true); }); await grappleAim(); await down('KeyR'); await up('KeyR'); await adv(0.5); }, (s) => s.grapple === 'pull'],
  ['cover-low', async () => { await ev(() => { __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(0.3); }); await down('KeyQ'); await up('KeyQ'); await adv(0.4); }, (s) => s.cover],
  ['cover-peek-pistol', async () => { await ev(() => { __game.selectSlot(1, true); __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(1.2); }); await down('KeyQ'); await up('KeyQ'); await adv(0.4); await p.mouse.down({ button: 'right' }); btns.add('right'); await adv(0.4); }, (s) => s.cover],
  ['saber-swing', async () => { await enemyAhead(12); await p.mouse.down(); btns.add('left'); await adv(0.05); await p.mouse.up(); btns.delete('left'); await adv(0.15); }, (s) => s.atk !== null],
  ['saber-block', async () => { await p.mouse.down({ button: 'right' }); btns.add('right'); await adv(0.4); }, (s) => s.blocking],
  ['dash-strike', async () => { await enemyAhead(9); await down('KeyW'); await down('ShiftLeft'); await adv(0.9); await p.mouse.down(); btns.add('left'); await adv(0.05); await p.mouse.up(); btns.delete('left'); await adv(0.1); }, (s) => s.dash],
  ['reloading', async () => { await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); }); for (let i = 0; i < 3; i++) { await p.mouse.down(); await adv(0.05); await p.mouse.up(); await adv(0.3); } await down('KeyZ'); await up('KeyZ'); await adv(0.2); }, (s) => s.reload],
  ['aiming-pistol', async () => { await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); }); await p.mouse.down({ button: 'right' }); btns.add('right'); await adv(0.5); }, (s) => s.gear === 'pistol' && s.fov < 55],
  ['scoped-sniper', async () => { await ev(() => { __game.selectSlot(5, true); __game.advance(1.5); }); await p.mouse.down({ button: 'right' }); btns.add('right'); await adv(0.6); }, (s) => s.gun === 'sniper' && s.fov < 40],
  ['auto-fire-ak', async () => { await ev(() => { __game.selectSlot(3, true); __game.advance(1.5); }); await p.mouse.down(); btns.add('left'); await adv(0.4); }, (s) => s.gun === 'ak'],
  ['throw-windup', async () => { await ev(() => { __game.selectSlot(2, true); __game.advance(0.8); }); await p.mouse.down(); btns.add('left'); await adv(0.12); }, (s) => s.gear === 'none'],
  ['takedown', async () => { await enemyAhead(1.0, true); await adv(0.2); await down('KeyF'); await up('KeyF'); await adv(0.25); }, (s) => s.takedown],
  ['force-choke', async () => { await toSlot5('force'); await enemyAhead(6); await p.mouse.down({ button: 'right' }); btns.add('right'); await adv(0.6); }, (s) => s.choke],
  ['force-zap', async () => { await toSlot5('force'); await enemyAhead(6); await down('KeyH'); await adv(0.5); }, (s) => s.zap],
  ['force-pull', async () => { await toSlot5('force'); await enemyAhead(8); await p.mouse.down(); btns.add('left'); await adv(0.05); await p.mouse.up(); btns.delete('left'); await adv(0.15); }, (s) => true],
  ['saber-throw', async () => { await enemyAhead(8); await down('KeyY'); await up('KeyY'); await adv(0.2); }, (s) => s.thrown],
  ['saber-blaster', async () => { await toSlot5('saberblaster'); await p.mouse.down(); await adv(0.05); await p.mouse.up(); await adv(0.1); }, (s) => s.gear === 'lit'],
  ['inventory-open', async () => { await down('KeyI'); await up('KeyI'); await adv(0.2); await lock(); }, (s) => s.inv],
  ['menu-open', async () => { await down('KeyM'); await up('KeyM'); await adv(0.2); }, (s) => s.moves],
  ['weapon-panel', async () => { await down('Tab'); await up('Tab'); await adv(0.2); }, (s) => s.weapon],
  ['dead', async () => { await ev(() => { __game.setDifficulty('extreme'); __game.hurt(1.5); __game.advance(1.5); }); }, (s) => s.dead],
  ['in-mission', async () => { await ev(() => { __game.startMission('m1'); __game.advance(2); }); }, (s) => !!s.mission],
];

const [a0, a1] = [+(process.argv[2] ?? 0), +(process.argv[3] ?? STATES.length - 1)];
const out = [];
let shots = 0;
await lock();
await ev(() => { __game.setGore?.(true); });
for (const [name, setup, took] of STATES.slice(a0, a1 + 1)) {
  for (const k of KEYS) {
    const errBefore = log.errors.length, repBefore = log.reports.length;
    let rec = { state: name, key: k };
    try {
      await reset();
      await park(ev);
      const clean = await snap();
      rec.cleanStart = clean.mode === 'ground' && !clean.atk && clean.grapple === 'idle';
      await setup();
      const s0 = await snap(); rec.stateTook = !!took(s0); rec.before = s0;
      await press(k);
      rec.during = await snap();
      await releaseAll();
      await adv(3);
      rec.after = await snap();
      // can you still walk?
      await closeAlert();
      await down('KeyW'); await adv(1); rec.walk = (await snap()).speed; await up('KeyW'); await adv(0.3);
      rec.alert = await alert();
    } catch (e) { rec.exception = String(e.message || e).slice(0, 300); }
    rec.errors = log.errors.slice(errBefore); rec.reports = log.reports.slice(repBefore).map((r) => r.slice(0, 300));
    const A = rec.after || {};
    const panels = A.inv || A.weapon || A.moves || A.missions;
    rec.flags = [];
    if (rec.errors.length || rec.exception) rec.flags.push('error');
    if (rec.reports.some((r) => !/kind: freeze/.test(r))) rec.flags.push('watchdog');
    if (A.pose && A.pose.dev < 0.35) rec.flags.push('tpose');
    if (A.pose && (A.pose.leg < 0.9 || A.pose.arm < 0.9) && !A.dead) rec.flags.push('pose-gap');
    if (A.atk !== null && A.atk !== undefined) rec.flags.push('stuck-attack');
    if (A.takedown || A.dash || A.looting) rec.flags.push('stuck-action');
    if (A.grapple && A.grapple !== 'idle') rec.flags.push('stuck-grapple');
    if (A.mode && !['ground'].includes(A.mode) && !A.dead) rec.flags.push('stuck-mode:' + A.mode);
    if (A.blocking || A.choke || A.zap) rec.flags.push('stuck-hold');
    if (!panels && !A.dead && !A.cover && rec.walk !== undefined && rec.walk < 1) rec.flags.push('cannot-walk');
    if (rec.flags.length && shots < 60) { shots++; const f = `ctl-${name}-${k}`.replace(/[^a-z0-9+-]/gi, '_'); rec.shot = f + '.png'; await p.screenshot({ path: SHOTS + f + '.png' }); }
    out.push(rec);
    process.stdout.write(`${name} ${k} took=${rec.stateTook} ${rec.flags.join(',')}\n`);
  }
}
fs.writeFileSync(new URL(`../../audit/controls-${a0}-${a1}.json`, import.meta.url), JSON.stringify(out, null, 1));
await b.close();
