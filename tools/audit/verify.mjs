// Audit follow-ups: re-check each suspected bug by real input, several tries each, so every BUG entry has a repro count.
// Usage: node tools/audit/verify.mjs [only]   → audit/verify.json + audit/shots/vf-*.png
import fs from 'fs';
import { open, park } from './lib.mjs';

const { b, p, ev, log, alert, closeAlert, shot } = await open();
const adv = (s) => ev((s) => __game.advance(s), s);
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
async function reset() {
  for (const m of ['left', 'right', 'middle']) await p.mouse.up({ button: m }).catch(() => {});
  for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space', 'KeyC', 'KeyH']) await p.keyboard.up(k).catch(() => {});
  await ev(() => { const g = __game; if (g.dead) g.respawn(); g.closeMoves(); g.toggleInv(false); for (const id of ['weapon', 'missions', 'mdone', 'deathpanel']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    if (g.mission) g.endMission('quit'); g.leaveCover('audit'); if (g.grappleState === 'pull' || g.grappleState === 'fire') g.grapplePress(); g.setGadget('jetpack', false); g.setGadget('swing', false);
    g.setSneak(false); g.setDifficulty('sandbox'); g.setRmb(false); g.setAim(false); g.blockRelease(); g.attackRelease(); g.zapEnd(); g.holdFire(false); g.setClass('light'); g.setMode('ground', 0); g.place(0, -2); g.look(Math.PI, 0.28);
    g.selectSlot(0, true); g.setGear('lit'); g.setDebugCam(null); g.advance(2); });
  await park(ev); await closeAlert(); await lock();
}
const res = {}; let cur; const note = (k, v) => { cur[k] = v; };
const S = {};
const N = 5;

// R (grapple) during a saber swing: does the attack state get stuck, and do clicks still work?
S.swingThenGrapple = async () => {
  const tries = [];
  for (let i = 0; i < N; i++) {
    await reset(); await click(); await adv(0.12 + i * 0.05); await key('KeyR'); await adv(3);
    const a = await ev(() => [__game.atk, __game.overrides]);
    await click(); await adv(0.3); const c = await ev(() => [__game.atk, __game.overrides]);
    await click(); await adv(0.3); await click(); await adv(2); const d = await ev(() => [__game.atk, __game.overrides]);
    tries.push({ atk3sLater: a, afterClick: c, after3Clicks: d });
    if (i === 0) await shot('vf-swing-grapple-stuck');
  }
  note('tries', tries); note('reproduces', tries.filter((t) => t.atk3sLater[0] !== null && t.afterClick[1].length === 0).length + '/' + N);
};
// Other actions that call stopOvr mid-swing: X (throw), T (push), slide C, E holster, item switch
S.swingThenOthers = async () => {
  const out = {};
  for (const [k, f] of Object.entries({ X: () => key('KeyX'), T: () => key('KeyT'), E: () => key('KeyE'), Y: () => key('KeyY'), Q: () => key('KeyQ'), G: () => key('KeyG'), Digit3: () => key('Digit3') })) {
    await reset(); await click(); await adv(0.15); await f(); await adv(3); const a = await ev(() => [__game.atk, __game.overrides, __game.gear]);
    if (k === 'E' || k === 'Digit3') { await ev(() => { __game.selectSlot(0, true); __game.setGear('lit'); __game.advance(1.5); }); }
    await click(); await adv(0.3); out[k] = { after3s: a, clickThenAtk: await ev(() => [__game.atk, __game.overrides]) };
  }
  note('cases', out);
};
// Watchdog false alarm in cover when pushing toward the wall
S.coverWatchdog = async () => {
  const tries = [];
  for (let i = 0; i < N; i++) {
    await reset(); await ev(() => { __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(0.3); }); await key('KeyQ'); await adv(0.4);
    await p.keyboard.down('KeyW'); await adv(1.2); await p.keyboard.up('KeyW'); tries.push(await alert());
    if (i === 0) await shot('vf-cover-watchdog');
    await ev(() => { __game.report && 0; }); await closeAlert(); await p.waitForTimeout(15500 / N); // the watchdog sends one report per kind per 15 s
  }
  note('alert each try', tries);
};
// Watchdog "stuck" while walking into any wall? (the same rule, outside cover)
S.wallWatchdog = async () => {
  await reset(); await p.waitForTimeout(15000); await ev(() => { __game.place(4, -9.4); __game.look(Math.PI, 0.28); __game.advance(0.3); });
  await p.keyboard.down('KeyW'); await adv(1.5); await p.keyboard.up('KeyW'); note('walking straight into the 6 m block: alert', await alert()); await shot('vf-wall-watchdog'); await closeAlert();
};
// Jetpack descent after letting go, while blocking
S.jetDescent = async () => {
  for (const hold of ['none', 'block', 'mmb']) {
    await reset(); await ev(() => __game.setGadget('jetpack', true)); await key('Space', 0.05); await adv(0.1); await p.keyboard.down('Space'); await adv(1.5); await p.keyboard.up('Space');
    if (hold === 'block') await p.mouse.down({ button: 'right' }); if (hold === 'mmb') await p.mouse.down({ button: 'middle' });
    const ys = []; for (let i = 0; i < 12; i++) { await adv(0.5); ys.push(await ev(() => [+__game.y.toFixed(1), __game.mode[0]].join(''))); }
    await p.mouse.up({ button: 'right' }); await p.mouse.up({ button: 'middle' });
    note('released Space, then ' + hold + ': y/mode each 0.5 s', ys.join(' '));
  }
};
// Alt-tab: repeat the auto-fire and stuck-block cases N times and check what clears them
S.altTab = async () => {
  const t = [];
  for (let i = 0; i < N; i++) {
    await reset(); await ev(() => { __game.selectSlot(3, true); __game.advance(1.5); }); await p.mouse.down(); await adv(0.2);
    await ev(() => { dispatchEvent(new Event('blur')); document.exitPointerLock(); }); const m1 = (await ev(() => __game.ammoMags())).ak; await adv(1); const m2 = (await ev(() => __game.ammoMags())).ak;
    // back to the game: the first click only locks the pointer again
    await p.mouse.up(); await p.mouse.click(640, 300); await p.waitForTimeout(200); await adv(0.5); const m3 = (await ev(() => __game.ammoMags())).ak; await adv(0.5); const m4 = (await ev(() => __game.ammoMags())).ak;
    t.push({ atBlur: m1, after1s: m2, afterRefocusClick: m3, half_s_later: m4 });
  }
  note('AK rounds', t); note('reproduces', t.filter((x) => x.after1s < x.atBlur).length + '/' + N);
  // headless: blur without the mouseup at all
};
// Crouch with a weapon out
S.crouchArmed = async () => {
  const out = {};
  for (const [nm, slot] of [['saber', 0], ['pistol', 1], ['ak', 3], ['grenade', 2]]) { await reset(); await ev((s) => { __game.selectSlot(s, true); __game.advance(1.5); }, slot); await key('KeyC'); await adv(0.5); out[nm] = await ev(() => __game.crouch); }
  await reset(); await key('KeyE'); await adv(1.5); await key('KeyC'); await adv(0.5); out['saber off (E)'] = await ev(() => __game.crouch);
  note('C standing still → crouch?', out);
};
// Infinite jumps on by default, and what the class limits do when off
S.defaults = async () => { note('testCfg', await ev(() => ({ ...__game.testCfg }))); note('difficulty', await ev(() => __game.difficulty)); note('enemyCount', await ev(() => __game.enemies().filter((e) => e.state !== 'dead').length)); };
// Load-time freeze alert: is the alert panel showing right after load?
S.loadAlert = async () => { note('alert visible right after load (this session)', log.reports.slice(0, 2).map((r) => r.slice(0, 160))); };

const only = process.argv[2];
await lock();
for (const [name, f] of Object.entries(S)) {
  if (only && name !== only) continue;
  cur = res[name] = {}; const e0 = log.errors.length;
  try { await f(); } catch (e) { cur.exception = String(e.stack || e).slice(0, 600); }
  cur.errors = log.errors.slice(e0);
  console.log(name, JSON.stringify(cur).slice(0, 2500));
}
fs.writeFileSync(new URL(`../../audit/verify${only ? '-' + only : ''}.json`, import.meta.url), JSON.stringify(res, null, 1));
await b.close();
