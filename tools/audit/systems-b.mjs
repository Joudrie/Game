// Audit 3c, part B: throwables, gadgets and items, enemies, special enemies, stealth, the world, missions, UI, persistence.
// Usage: node tools/audit/systems-b.mjs [only]   → audit/systems-b.json + audit/shots/sb-*.png
import fs from 'fs';
import { open, park } from './lib.mjs';

let { b, p, ev, log, alert, closeAlert, shot } = await open();
const adv = (s) => ev((s) => __game.advance(s), s);
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
async function reset() {
  for (const m of ['left', 'right', 'middle']) await p.mouse.up({ button: m }).catch(() => {});
  for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space', 'KeyC', 'KeyH', 'KeyG']) await p.keyboard.up(k).catch(() => {});
  await ev(() => { const g = __game; if (g.dead) g.respawn(); g.closeMoves(); g.toggleInv(false); for (const id of ['weapon', 'missions', 'mdone', 'deathpanel']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    if (g.mission) g.endMission('quit'); g.leaveCover('audit'); if (g.grappleState === 'pull' || g.grappleState === 'fire') g.grapplePress(); g.setGadget('jetpack', false); g.setGadget('swing', false);
    g.setSneak(false); g.setDifficulty('sandbox'); g.setRmb(false); g.setAim(false); g.blockRelease(); g.attackRelease(); g.zapEnd(); g.holdFire(false); g.setClass('light'); g.setMode('ground', 0); g.place(0, -2); g.look(Math.PI, 0.28);
    g.selectSlot(0, true); g.setGear('lit'); g.setDebugCam(null); g.advance(2); });
  await park(ev); await closeAlert(); await lock();
}
const aimAt = (x, y, z) => ev(([x, y, z]) => { for (let i = 0; i < 3; i++) { const c = __game.camPos, dx = x - c[0], dy = y - c[1], dz = z - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.05); } }, [x, y, z]);
const swapIn = (id, slot = 4) => ev(([id, slot]) => { const I = __game.inv; let bi = I.bag.findIndex((x) => x && x.id === id); if (bi < 0) { const hi = I.hot.findIndex((x) => x && x.id === id); if (hi >= 0) { __game.selectSlot(hi, true); __game.advance(1.3); return; } __game.addItem(id, 3); bi = I.bag.findIndex((x) => x && x.id === id); } const t = I.hot[slot]; I.hot[slot] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(slot, true); __game.advance(1.3); }, [id, slot]);
const restoreHot = () => ev(() => { const want = ['saber', 'pistol', 'grenade', 'ak', 'shotgun', 'sniper'], I = __game.inv; want.forEach((id, s) => { if (I.hot[s]?.id === id) return; const bi = I.bag.findIndex((x) => x && x.id === id); if (bi >= 0) { const t = I.hot[s]; I.hot[s] = I.bag[bi]; I.bag[bi] = t; } }); __game.selectSlot(0, true); });
const one = (x, z, yw = 0, mind = 'patrol') => ev(([x, z, yw, mind]) => { __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, x, z, yw); __game.faceEnemy(0, yw); __game.setMind(0, mind, mind === 'patrol' ? 999 : 0); __game.advance(0.2); return __game.enemies().filter((e) => e.state !== 'dead')[0].id; }, [x, z, yw, mind]);
const byId = (id) => ev((id) => __game.enemies().find((e) => e.id === id) || { state: 'removed' }, id);
const res = {}; let cur; const note = (k, v) => { cur[k] = v; };
const S = {};

S.throwables = async () => {
  // frag by real input: select slot 3, click (wind-up), at a soldier 10 m ahead
  let id = await one(0, -12, 0); await ev(() => { __game.selectSlot(2, true); __game.advance(0.8); }); await aimAt(0, 3, -12); await shot('sb-throw-arc');
  await click(); await adv(3); note('frag thrown at a soldier 10 m ahead (aimed above him)', (await byId(id)).state); await shot('sb-frag');
  // sticky on a soldier
  id = await one(0, -8, 0); const sid = await ev(() => __game.stickOn(0)); await adv(0.8); note('sticky on him: out', await ev(() => __game.grenadesOut)); await adv(1.5); note('sticky: his state, cut', [(await byId(id)).state, await ev((id) => __game.cuts().find((c) => c.id === id)?.severed, id)]);
  // fire: first-ignition hitch, programs, particles
  const prog0 = await ev(() => __game.programs); const t0 = Date.now(); await ev(() => { __game.firePatch(0, -9); __game.advance(0.05); }); const t1 = Date.now() - t0;
  await adv(1); await shot('sb-fire'); note('fire patch: ms to create (first), shader programs before/after, particles', [t1, prog0, await ev(() => __game.programs), await ev(() => __game.particles)]);
  id = await one(0, -12, 0, 'combat'); await ev(() => __game.firePatch(0, -11)); await adv(5); note('soldier stood by fire, combat: burning count, his state', [await ev(() => __game.burning()), (await byId(id)).state]);
  // teleport orb by real input
  await reset(); await swapIn('orb'); await ev(() => __game.look(Math.PI, 0.1)); await adv(0.2); const pa = await ev(() => __game.pos); await click(); await adv(2.5); const pb = await ev(() => __game.pos);
  note('teleport orb thrown ahead: moved (m)', +Math.hypot(pb[0] - pa[0], pb[2] - pa[2]).toFixed(1)); await restoreHot();
  // X quick-throw: count with finite grenades
  await reset(); await ev(() => { __game.testCfg.infiniteNades = false; }); const c0 = await ev(() => __game.countItem('grenade')); await key('KeyX'); await adv(0.7); const c1 = await ev(() => __game.countItem('grenade'));
  note('X throws a frag (count before/after, finite)', [c0, c1]); await ev(() => { __game.testCfg.infiniteNades = true; });
  // 50 grenades at once
  await reset(); await ev(() => { __game.fillEnemies(); for (let i = 0; i < 10; i++) { __game.moveEnemy(i, -4 + i, -12, 0); } __game.advance(0.2); });
  const tt = Date.now(); await ev(() => { for (let i = 0; i < 50; i++) { __game.throwKind(['frag', 'sticky', 'fire'][i % 3]); __game.advance(0.02); } }); await adv(4); note('50 mixed grenades: wall-clock ms for 5 s game time', Date.now() - tt);
  note('after: fires, particles, debris, pieces, programs', await ev(() => [__game.fires, __game.particles, __game.debris, __game.pieces, __game.programs])); await shot('sb-50-grenades');
  // shoot your own sticky in mid-air (can you?)
};

S.gadgets = async () => {
  // grapple onto a building, the ground, a soldier, yank, swing
  await ev(() => { __game.look(Math.atan2(4, -11), -0.05); __game.advance(0.3); }); const xh = await ev(() => document.getElementById('xhair').className);
  await key('KeyR'); const g = []; for (let i = 0; i < 30; i++) { await adv(0.1); g.push(await ev(() => __game.grappleState[0])); if (i === 6) await shot('sb-grapple-pull'); }
  note('grapple at the 6 m block: crosshair class, states each 0.1 s, end y', [xh, g.join(''), await ev(() => __game.y)]);
  await reset(); const id = await one(0, -14, 0); await aimAt(0, 1.2, -14); await key('KeyR'); await adv(2); note('grapple a soldier 12 m away: his state, my pos', [(await byId(id)).state, await ev(() => __game.pos)]); await shot('sb-grapple-soldier');
  await reset(); const id2 = await one(0, -14, 0); await aimAt(0, 1.2, -14); await p.mouse.down({ button: 'right' }); await key('KeyR'); await adv(2); await p.mouse.up({ button: 'right' });
  note('yank (right-click held): his state, distance', [(await byId(id2)).state, await ev((id) => { const e = __game.enemies().find((x) => x.id === id), P = __game.pos; return e ? +Math.hypot(e.pos[0] - P[0], e.pos[2] - P[2]).toFixed(1) : null; }, id2), await ev(() => __game.yanks)]);
  await reset(); await ev(() => { __game.setGadget('swing', true); }); const tall = await ev(() => __game.blocks.filter((b) => b.max[1] >= 14 && Math.hypot((b.min[0] + b.max[0]) / 2, (b.min[2] + b.max[2]) / 2) < 70)[0]);
  if (tall) { const cx = (tall.min[0] + tall.max[0]) / 2, cz = (tall.min[2] + tall.max[2]) / 2; await ev(([x, z]) => { __game.place(x, z - 25 > 0 ? z - 25 : z + 25); }, [cx, cz]); await aimAt(cx, tall.max[1] - 2, cz); await key('KeyR'); const sw = []; for (let i = 0; i < 30; i++) { await adv(0.1); sw.push(await ev(() => [__game.grappleState[0], __game.swing ? 'S' : '-', +__game.y.toFixed(1)].join(''))); if (i === 12) await shot('sb-swing'); } note('swing on a tall building: state/swing/y each 0.1 s', sw.join(' ')); }
  // grapple to the sky: aim straight up
  await reset(); await ev(() => __game.look(Math.PI, -0.45)); await key('KeyR'); await adv(1.5); note('grapple straight up (nothing to hit): state', await ev(() => __game.grappleState));
  // holocloak
  await reset(); await swapIn('holocloak'); await click(); await adv(0.5); const c0 = await ev(() => __game.cloakT); await shot('sb-cloak'); await adv(8); const c1 = await ev(() => __game.cloakT); await click(); await adv(0.3);
  note('holocloak: time left at start, after 8 s, re-use toast', [c0, c1, await ev(() => document.getElementById('toast').textContent)]);
  note('effect timer HUD visible text', await ev(() => [...document.querySelectorAll('#effects')].map((e) => e.textContent).join(' | ')));
  // stim, ration, kyber
  await reset(); await ev(() => { __game.setDifficulty('normal'); __game.setHp(0.3); }); await swapIn('stim'); await click(); await adv(0.3); const hs = await ev(() => __game.hp);
  await swapIn('ration'); await click(); await adv(0.3); const hr = await ev(() => __game.hp); note('hp 0.30 → stim → ration', [hs, hr]);
  await swapIn('kyber'); await click(); await adv(0.3); note('kyber toast', await ev(() => document.getElementById('toast').textContent)); await restoreHot(); await ev(() => __game.selectSlot(0, true)); await adv(1.5); await shot('sb-kyber-colour');
  // energy shield, by real input
  await reset(); await swapIn('shieldpistol'); await shot('sb-shield'); const sid = await one(0, -8, 0, 'combat');
  await ev(() => { __game.enemyBolt(0); __game.advance(1.2); }); const s1 = await ev(() => __game.shield());
  await ev(() => { __game.moveEnemy(0, 0, 8, Math.PI); __game.advance(0.2); __game.enemyBolt(0); __game.advance(1.2); }); const s2 = await ev(() => __game.shield());
  note('shield: front bolt blocked, then from behind blocked? (blocked count)', [s1.blocked, s2.blocked, s2.yaw]);
  // items that do nothing: held?
  await reset(); await swapIn('chip'); note('data chip in hand: gear', await ev(() => __game.gear)); await restoreHot();
};

S.enemies = async () => {
  // patrol: positions over 20 s
  await ev(() => { __game.fillEnemies(); for (let i = 0; i < 10; i++) __game.setMind(i, 'patrol', 0); __game.place(0, -2); }); const p0 = await ev(() => __game.enemies().filter((e) => e.state !== 'dead').map((e) => e.pos));
  await adv(20); const p1 = await ev(() => __game.enemies().filter((e) => e.state !== 'dead').map((e) => e.pos));
  note('patrol: metres moved in 20 s per soldier', p0.map((a, i) => p1[i] ? +Math.hypot(p1[i][0] - a[0], p1[i][2] - a[2]).toFixed(1) : null));
  // noticing: stand 12 m in front of a calm soldier, how long until ? and !
  await reset(); let id = await one(0, -14, 0); const seq = []; for (let i = 0; i < 40; i++) { await adv(0.1); const m = await ev((id) => __game.minds().find((x) => x.id === id), id); seq.push((m.mark || '.') + (m.mind[0])); if (m.mind === 'combat') break; if (i === 8) await shot('sb-notice-q'); }
  note('standing 12 m in front of him in plain view: marks each 0.1 s (? then !, p=patrol s=spot c=combat)', seq.join(' '));
  await shot('sb-notice-alarm');
  // sneaking up behind: does he notice at 6, 3, 1 m?
  await reset(); id = await one(0, -14, 0); await ev(() => __game.setSneak(true)); await p.keyboard.down('KeyW'); let noticed = null; for (let i = 0; i < 80; i++) { await adv(0.1); const m = await ev((id) => __game.minds().find((x) => x.id === id), id); if (m.mind !== 'patrol') { noticed = await ev(() => __game.pos); break; } }
  await p.keyboard.up('KeyW'); note('sneaking straight at his FRONT: noticed at my pos (he is at z=-14)', noticed);
  await reset(); id = await one(0, -14, 0); await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); noticed = null; for (let i = 0; i < 40; i++) { await adv(0.1); const m = await ev((id) => __game.minds().find((x) => x.id === id), id); if (m.mind !== 'patrol') { noticed = await ev(() => __game.pos); break; } }
  await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft'); note('sprinting at his front: noticed at my pos', noticed);
  // panic at a witnessed death
  await reset(); await ev(() => { __game.fillEnemies(); __game.moveEnemy(0, 0, -30, 0); __game.moveEnemy(1, 0, -24, Math.PI); __game.setMind(0, 'patrol', 999); __game.setMind(1, 'patrol', 999); __game.faceEnemy(1, Math.PI); __game.advance(0.2); __game.damageEnemy(0, 999, 'torso', 'stealth'); __game.advance(0.3); });
  note('witness of a death 6 m away: his mind', await ev(() => __game.minds().filter((m) => m.state !== 'dead')[0]?.mind));
  // noise: pistol shot heard at 30 m but not 40 m
  await reset(); await ev(() => { __game.fillEnemies(); __game.moveEnemy(0, 0, 30, 0); __game.moveEnemy(1, 0, 42, 0); __game.setMind(0, 'patrol', 999); __game.setMind(1, 'patrol', 999); __game.faceEnemy(0, 0); __game.faceEnemy(1, 0); __game.selectSlot(1, true); __game.advance(1.5); __game.look(Math.PI, 0.2); });
  await click(); await adv(0.5); note('pistol shot: soldier at 32 m and 44 m behind you (minds)', await ev(() => __game.minds().filter((m) => m.state !== 'dead').slice(0, 2).map((m) => m.mind)));
  // aiming and accuracy in combat, Normal: hits on you in 20 s from 4 soldiers at 15–25 m
  await reset(); await ev(() => { __game.setDifficulty('normal'); __game.setHp(1); __game.fillEnemies(); for (let i = 0; i < 4; i++) { __game.moveEnemy(i, -6 + i * 4, -18 - i * 2, 0); __game.setMind(i, 'combat', 0); } __game.advance(0.1); });
  const hp = []; for (let i = 0; i < 20; i++) { await adv(1); hp.push(await ev(() => __game.hp)); if (await ev(() => !!__game.dead)) break; } await shot('sb-enemy-combat');
  note('Normal: your health each second, 4 soldiers in combat 15–25 m away, you standing still', hp);
  note('loadouts and uniforms', await ev(() => __game.looks()));
  // a close look at a soldier
  await reset(); await ev(() => { __game.moveEnemy(0, 0, -5, 0); __game.faceEnemy(0, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.5); __game.setDebugCam([0.8, 1.6, -3.2], [0, 1.2, -5]); __game.advance(0.1); }); await shot('sb-soldier-close'); await ev(() => __game.setDebugCam(null));
  // deaths by cause, ragdoll, shoving and looting bodies, corpse fade
  await reset(); await ev(() => { __game.fillEnemies(); for (let i = 0; i < 4; i++) { __game.moveEnemy(i, -3 + i * 2, -6, 0); __game.setMind(i, 'patrol', 999); } __game.advance(0.2); __game.damageEnemy(0, 999, 'head'); __game.damageEnemy(0, 999, 'torso'); __game.damageEnemy(0, 999, 'legs'); __game.explodeAt(3, 0, -6); __game.advance(3); });
  await shot('sb-deaths'); note('death types', await ev(() => __game.enemies().filter((e) => e.state === 'dead').map((e) => e.death)));
  await ev(() => { __game.place(-3, -4.5); __game.advance(0.3); }); await key('KeyG'); await adv(3); note('loot a body by G: log', await ev(() => __game.lootLog.slice(-5)));
  const n0 = await ev(() => __game.enemies().length); await adv(95); note('bodies: count before/after 95 s (CORPSE_TIME 90)', [n0, await ev(() => __game.enemies().filter((e) => e.state === 'dead').length)]);
  // stack 20 on one spot
  await reset(); await ev(() => { __game.setEnemyCount(20); __game.fillEnemies(); __game.advance(0.5); for (let i = 0; i < 20; i++) { __game.moveEnemy(i, 0, -8, 0); __game.setMind(i, 'combat', 0); } __game.advance(3); });
  await shot('sb-stack-20'); note('20 stacked at one spot, 3 s later: spread (max distance from centre)', await ev(() => Math.max(...__game.enemies().filter((e) => e.state !== 'dead').map((e) => Math.hypot(e.pos[0], e.pos[2] + 8))).toFixed(1)));
  await ev(() => { __game.setEnemyCount(10); });
};

S.specials = async () => {
  const out = {};
  for (const t of ['jugg', 'shield', 'duel']) {
    await reset(); const id = await ev((t) => __game.spawnSpecial(t, 0, -6), t);
    await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'combat', 0); __game.faceEnemy(i, 0); __game.advance(1); }, id);
    await ev(() => { __game.setDebugCam([2.2, 1.8, -2.5], [0, 1.1, -6]); __game.advance(0.05); }); await shot('sb-special-' + t); await ev(() => __game.setDebugCam(null));
    const r = {};
    // saber swings from the front: how many until he dies
    let n = 0; for (; n < 12; n++) { const st = await ev((id) => __game.enemies().find((e) => e.id === id)?.state, id); if (!st || st === 'dead') break; await ev((id) => { const e = __game.enemies().find((x) => x.id === id); __game.place(e.pos[0], e.pos[2] + 2.2); __game.look(Math.PI, 0.25); }, id); await click(); await adv(0.7); }
    r.frontSwingsToKill = n; r.after = await ev((id) => __game.special().find((s) => s.id === id) || 'dead/removed', id);
    // pistol from the front at 12 m
    await reset(); const id2 = await ev((t) => __game.spawnSpecial(t, 0, -14), t); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, 0); __game.advance(0.5); }, id2);
    await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); }); let k = 0; for (; k < 40; k++) { await aimAt(0, 1.3, -14); await click(); await adv(0.25); const st = await ev((id) => __game.enemies().find((e) => e.id === id)?.state, id2); if (!st || st === 'dead') break; }
    r.pistolShotsFront = k + 1;
    // grapple onto him
    await reset(); const id3 = await ev((t) => __game.spawnSpecial(t, 0, -12), t); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, 0); __game.advance(0.5); }, id3);
    await aimAt(0, 1.2, -12); await key('KeyR'); await adv(2); r.grappleOnto = { his: await ev((id) => __game.enemies().find((e) => e.id === id)?.state, id3), me: await ev(() => [__game.pos, __game.mode, __game.grappleState]) };
    // a sticky on him
    await reset(); const id4 = await ev((t) => __game.spawnSpecial(t, 0, -6), t); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, 0); __game.advance(0.3); __game.stickOn(i); __game.advance(2.5); }, id4);
    r.sticky = await ev((id) => [__game.enemies().find((e) => e.id === id)?.state, __game.special().find((s) => s.id === id)], id4);
    // choke a juggernaut
    if (t === 'jugg') { await reset(); await swapIn('force'); const id5 = await ev(() => __game.spawnSpecial('jugg', 0, -7)); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'patrol', 999); __game.advance(0.3); }, id5); await aimAt(0, 1.2, -7); await p.mouse.down({ button: 'right' }); await adv(5); await p.mouse.up({ button: 'right' }); r.choke5s = await ev((id) => __game.enemies().find((e) => e.id === id)?.state, id5); await restoreHot(); }
    out[t] = r;
  }
  note('specials', out);
};

S.stealth = async () => {
  // takedown from behind by real F
  let id = await one(0, -3.5, Math.PI); await adv(0.2); note('prompt shown behind an unaware soldier', await ev(() => [!document.getElementById('tdprompt').hidden, __game.tdLabel]));
  await key('KeyF'); await adv(0.3); await shot('sb-takedown'); await adv(3); note('takedown: his state, takedowns', [(await byId(id)).state, await ev(() => __game.takedowns)]);
  // from the front: no takedown
  await reset(); id = await one(0, -3.5, 0); await adv(0.2); note('prompt from the front', await ev(() => !document.getElementById('tdprompt').hidden));
  // cover: peek, blind fire
  await reset(); await ev(() => { __game.selectSlot(1, true); __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(1.3); }); await key('KeyQ'); await adv(0.5); const cv = await ev(() => __game.cover); await shot('sb-cover-low');
  await p.keyboard.down('KeyD'); await adv(1); await p.keyboard.up('KeyD'); const cv2 = await ev(() => __game.cover); await p.mouse.down({ button: 'right' }); await adv(0.5); const cv3 = await ev(() => __game.cover); await shot('sb-cover-peek'); await p.mouse.up({ button: 'right' });
  note('cover low: enter, after D 1 s, peeking', [cv, cv2, cv3]);
  await reset(); await ev(() => { __game.place(4, -9.5); __game.look(Math.PI, 0.28); __game.advance(0.3); }); await key('KeyQ'); await adv(0.5); note('cover tall (6 m block)', await ev(() => __game.cover)); await shot('sb-cover-tall');
  await p.keyboard.down('KeyA'); await adv(3); await p.keyboard.up('KeyA'); await ev(() => { __game.selectSlot(1, true); __game.advance(1.3); }); await p.mouse.down({ button: 'right' }); await adv(0.5); note('tall cover at the edge, peeking', await ev(() => __game.cover)); await shot('sb-cover-tall-edge-peek'); await p.mouse.up({ button: 'right' });
  // crouch with a weapon? (C)
  await reset(); await key('KeyC'); await adv(0.3); const c1 = await ev(() => __game.crouch); await ev(() => { __game.selectSlot(1, true); __game.advance(1.3); }); await key('KeyC'); await adv(0.3); const c2 = await ev(() => __game.crouch);
  await ev(() => { __game.setGear('none'); __game.advance(1); }); await key('KeyC'); await adv(0.3); const c3 = await ev(() => __game.crouch); note('C standing still: crouch with saber / pistol / fists', [c1, c2, c3]);
};

S.world = async () => {
  note('world stats', await ev(() => __game.world()));
  // aerial views
  await ev(() => { __game.setDebugCam([0, 60, 40], [0, 0, -30]); __game.advance(0.2); }); await shot('sb-world-aerial');
  await ev(() => { __game.setDebugCam([0, 3, -5], [0, 2, -40]); __game.advance(0.2); }); await shot('sb-world-street');
  await ev(() => { __game.setDebugCam([25, 30, 140], [0, 0, 175]); __game.advance(0.2); }); await shot('sb-courtyard-aerial'); await ev(() => __game.setDebugCam(null));
  // walk into every nearby city building from 4 sides and photograph how far the body is from the visible wall
  const near = await ev(() => __game.blocks.map((b, i) => ({ i, ...b })).filter((b) => { const cx = (b.min[0] + b.max[0]) / 2, cz = (b.min[2] + b.max[2]) / 2; return Math.hypot(cx, cz) < 70 && Math.hypot(cx, cz) > 15 && b.max[1] > 3; }).slice(0, 6));
  const out = [];
  for (const B of near) {
    const cx = (B.min[0] + B.max[0]) / 2, cz = (B.min[2] + B.max[2]) / 2;
    for (const [side, x, z, yaw] of [['south', cx, B.min[2] - 3, 0], ['east', B.max[0] + 3, cz, -Math.PI / 2]]) {
      await reset(); await ev(([x, z, yaw]) => { __game.place(x, z); __game.look(yaw, 0.2); __game.advance(0.3); }, [x, z, yaw]);
      await p.keyboard.down('KeyW'); await adv(2.5); await p.keyboard.up('KeyW'); await adv(0.3);
      const at = await ev(() => __game.pos);
      const camX = side === 'south' ? [at[0] + 4, 1.6, at[2] - 2] : [at[0] + 2, 1.6, at[2] + 4];
      await ev(([c, a]) => { __game.setDebugCam(c, [a[0], 1, a[2]]); __game.advance(0.05); }, [camX, at]);
      const f = `sb-bldg-${B.i}-${side}`; await shot(f); await ev(() => __game.setDebugCam(null));
      out.push({ block: B.i, side, stoppedAt: at, boxFace: side === 'south' ? B.min[2] : B.max[0], gap: +(side === 'south' ? B.min[2] - at[2] : at[0] - B.max[0]).toFixed(2), shot: f });
    }
  }
  note('walk into buildings: where the body stops vs the collision box face (gap m) — compare with the screenshots', out);
  // standing on a roof
  const roof = near[0]; await reset(); await ev(([B]) => { __game.setMode('air', B.max[1] + 2); __game.place((B.min[0] + B.max[0]) / 2, (B.min[2] + B.max[2]) / 2); __game.setMode('air', B.max[1] + 2); __game.advance(2); }, [roof]); note('drop onto a roof: y vs roof height', [await ev(() => __game.y), roof.max[1]]); await shot('sb-roof');
  // trees: bump into a trunk
  // courtyard: glass, wood, crates, ledge
  await reset(); await ev(() => { __game.goCourt(10, -19); __game.look(0, 0.2); __game.selectSlot(1, true); __game.advance(1.5); });
  const gl = await ev(() => __game.matBlocks('glass')); await aimAt(gl[0].c[0], gl[0].c[1], gl[0].c[2]); await click(); await adv(0.5); note('glass panes before/after one shot', [gl.length, (await ev(() => __game.matBlocks('glass'))).length]); await shot('sb-court-glass');
  const wd = await ev(() => __game.matBlocks('wood')); const w0 = wd[0]; await ev(([c]) => { __game.goCourt(c[0] - 0, c[2] - 175 - 4); }, [w0.c]); await aimAt(...w0.c); let shots = 0; for (; shots < 10; shots++) { await click(); await adv(0.3); if ((await ev(() => __game.matBlocks('wood'))).length < wd.length) break; } note('pistol shots to break one board', shots + 1); await shot('sb-court-wood');
  await reset(); await ev(() => { __game.goCourt(0, -10); __game.advance(0.2); __game.explodeAt(0, 0.3, 175 - 3); __game.advance(2); }); note('debris pieces after a blast at the crates', await ev(() => [__game.debris, __game.broken])); await shot('sb-court-blast');
  await reset(); await ev(() => { __game.goCourt(0, -18); __game.advance(0.5); __game.setDebugCam([0, 12, 175 - 40], [0, 2, 175]); __game.advance(0.1); }); await shot('sb-court-gate'); await ev(() => __game.setDebugCam(null));
};

S.missions = async () => {
  const out = {};
  // mission 1: start by the UI
  await ev(() => document.getElementById('missionsbtn').click()); await adv(0.3); await shot('sb-missions-panel'); note('missions panel text', await ev(() => document.getElementById('missionsbody').innerText.slice(0, 600)));
  await ev(() => document.querySelector('[data-mission="m1"]').click()); await adv(3); out.m1start = await ev(() => [__game.mission, __game.inv.hot.map((x) => x && x.id)]); await shot('sb-m1-start');
  for (let w = 0; w < 6; w++) { await ev(() => { __game.killWave(); __game.advance(6); }); out['m1wave' + w] = await ev(() => __game.mission); if (!out['m1wave' + w] || out['m1wave' + w].state === 'done') break; }
  await adv(2); await shot('sb-m1-done'); out.m1done = { doneShown: await ev(() => !document.getElementById('mdone')?.hidden), kept: await ev(() => __game.kept) };
  await ev(() => document.getElementById('mdoneback')?.click()); await adv(1); out.m1back = await ev(() => [__game.mission, __game.inv.hot.map((x) => x && x.id)]);
  // mission 2: survival, run the clock
  await reset(); await ev(() => { __game.startMission('m2'); __game.advance(3); }); out.m2start = await ev(() => __game.mission); await shot('sb-m2');
  await ev(() => { __game.missionClock(5); __game.advance(7); }); out.m2end = { mission: await ev(() => __game.mission), kept: await ev(() => __game.kept) }; await ev(() => document.getElementById('mdoneback')?.click());
  // mission 3: stealth
  await reset(); await ev(() => { __game.startMission('m3'); __game.advance(3); }); out.m3start = { mission: await ev(() => __game.mission), terminal: await ev(() => __game.terminalPos()), pos: await ev(() => __game.pos) }; await shot('sb-m3-start');
  // get spotted on purpose: walk at a guard
  const g = await ev(() => __game.enemies().filter((e) => e.state !== 'dead')[0].pos); await ev(([x, z]) => { __game.place(x, z - 8); __game.look(0, 0.2); }, g); await adv(6); out.m3spotted = { mission: await ev(() => __game.mission), panel: await ev(() => !document.getElementById('deathpanel')?.hidden || !document.getElementById('mdone')?.hidden), text: await ev(() => (document.getElementById('mdone')?.innerText || '') + (document.getElementById('deathpanel')?.innerText || '')) };
  await shot('sb-m3-failed');
  // quit and replay
  await reset(); await ev(() => { __game.startMission('m1'); __game.advance(2); __game.endMission('quit'); __game.advance(1); }); out.quitThenInv = await ev(() => __game.inv.hot.map((x) => x && x.id));
  // die in a mission (Extreme) and use Retry
  await reset(); await ev(() => { __game.startMission('m1'); __game.advance(2); __game.setDifficulty('extreme'); __game.hurt(2); __game.advance(2); }); out.diedInMission = { dead: await ev(() => !!__game.dead), panel: await ev(() => document.getElementById('deathpanel')?.innerText) }; await shot('sb-mission-death');
  await ev(() => document.querySelector('#deathpanel button:not([hidden])')?.click()); await adv(2); out.retry = await ev(() => [__game.mission, !!__game.dead]);
  note('missions', out);
};

S.ui = async () => {
  await shot('sb-hud-default');
  await key('KeyI'); await adv(0.3); await shot('sb-inventory'); note('inventory text', await ev(() => document.getElementById('inv').innerText.slice(0, 500)));
  // drag a backpack item to the hotbar with the real mouse
  const r = await ev(() => { const a = document.querySelector('#invbag .slot[data-i="0"]').getBoundingClientRect(), c = document.querySelector('#invhot .slot[data-i="4"]').getBoundingClientRect(); return [a.x + a.width / 2, a.y + a.height / 2, c.x + c.width / 2, c.y + c.height / 2]; });
  const before = await ev(() => [__game.inv.bag[0]?.id, __game.inv.hot[4]?.id]); await p.mouse.move(r[0], r[1]); await p.mouse.down(); await p.mouse.move((r[0] + r[2]) / 2, (r[1] + r[3]) / 2, { steps: 5 }); await p.mouse.move(r[2], r[3], { steps: 5 }); await p.mouse.up(); await adv(0.3);
  note('drag bag 0 → hot 5', { before, after: await ev(() => [__game.inv.bag[0]?.id, __game.inv.hot[4]?.id]) });
  // tap a gun to see attachments
  await p.mouse.click(r[2], r[3]); await adv(0.3); await shot('sb-inventory-tap'); note('after tapping', await ev(() => document.getElementById('inv').innerText.slice(0, 300)));
  await key('Escape'); await adv(0.2); note('Escape closes the inventory', await ev(() => document.getElementById('inv').hidden)); await restoreHot();
  await lock(); await key('Tab'); await adv(0.3); await shot('sb-weapon-panel'); note('weapon panel text', await ev(() => document.getElementById('weapon').innerText.slice(0, 1500))); await key('Tab');
  await key('KeyM'); await adv(0.3); await shot('sb-menu'); note('menu tabs', await ev(() => [...document.querySelectorAll('#moves button')].map((b) => b.textContent.trim()).filter(Boolean).slice(0, 60)));
  await key('Escape'); await adv(0.2); note('Escape closes the menu', await ev(() => document.getElementById('moves').hidden));
  // the watchdog's Copy report
  await ev(() => __game.report('manual', 'audit check', true)); await adv(0.3); await shot('sb-alert'); await ev(() => document.getElementById('alertcopy').click()); await p.waitForTimeout(300); note('copy report button text', await ev(() => document.getElementById('alertcopy').textContent));
  await closeAlert();
  // kill feed, health bar, ammo counter
  await reset(); await ev(() => { __game.setDifficulty('normal'); __game.hurt(0.4); __game.selectSlot(1, true); __game.advance(1.3); __game.moveEnemy(0, 0, -6, 0); __game.damageEnemy(0, 999, 'head'); __game.advance(0.3); }); await shot('sb-hud-combat');
  note('hud', await ev(() => ({ ammo: document.getElementById('ammo')?.innerText, feed: document.getElementById('feed')?.innerText || document.getElementById('killfeed')?.innerText, health: document.getElementById('health')?.outerHTML?.slice(0, 200) })));
};

S.phone = async () => {
  await b.close(); ({ b, p, ev, log, alert, closeAlert, shot } = await open({ w: 375, h: 667 }));
  await adv(1); await shot('sb-phone-375'); note('phone layout', await ev(() => ({ scrollW: document.documentElement.scrollWidth, overflowing: [...document.querySelectorAll('.hud, .hud *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1 || r.bottom > innerHeight + 1); }).map((e) => e.id || e.className).slice(0, 12) })));
  await ev(() => document.getElementById('invbtn').click()); await adv(0.3); await shot('sb-phone-inventory'); await ev(() => __game.toggleInv(false));
  await ev(() => document.getElementById('gearbtn').click()); await adv(0.3); await shot('sb-phone-weapon'); await ev(() => document.getElementById('weaponclose').click());
  await ev(() => __game.openMoves()); await adv(0.3); await shot('sb-phone-menu'); await ev(() => __game.closeMoves());
  await b.close(); ({ b, p, ev, log, alert, closeAlert, shot } = await open());
};

S.persistence = async () => {
  // change things, reload, check
  await ev(() => { __game.setDifficulty('hard'); __game.setAtt('ak', 'scope', true); __game.moveItem({ where: 'hot', i: 1 }, { where: 'hot', i: 2 }); __game.setFavourite?.('jog', __game.pool('jog')[1]?.id || __game.pool('jog')[0]); __game.selectSlot(3, true); });
  await key('KeyB'); const before = await ev(() => ({ diff: __game.difficulty, att: __game.hasAtt('ak', 'scope'), hot: __game.inv.hot.map((x) => x && x.id), shoulder: __game.shoulder, slot: __game.inv.active, fav: __game.pool('jog')[0] }));
  await p.reload(); await p.waitForFunction(() => window.__game, null, { timeout: 180000 }); await adv(0.5);
  const after = await ev(() => ({ diff: __game.difficulty, att: __game.hasAtt('ak', 'scope'), hot: __game.inv.hot.map((x) => x && x.id), shoulder: __game.shoulder, slot: __game.inv.active, fav: __game.pool('jog')[0] }));
  note('after a page reload', { before, after });
  await ev(() => { __game.setDifficulty('sandbox'); __game.setAtt('ak', 'scope', false); __game.moveItem({ where: 'hot', i: 1 }, { where: 'hot', i: 2 }); });
  // first run: cleared storage
  await ev(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.__game, null, { timeout: 180000 }); await adv(1); await shot('sb-first-run');
  note('first run', await ev(() => ({ hot: __game.inv.hot.map((x) => x && x.id), bag: __game.inv.bag.filter(Boolean).map((x) => x.id), diff: __game.difficulty, count: __game.enemies().length, toast: document.getElementById('toast').innerText, help: !document.getElementById('help').hidden })));
  await lock();
};

const only = process.argv[2];
for (const [name, f] of Object.entries(S)) {
  if (only && name !== only) continue;
  cur = res[name] = {}; const e0 = log.errors.length, r0 = log.reports.length;
  try { await reset(); await f(); } catch (e) { cur.exception = String(e.stack || e).slice(0, 600); }
  cur.errors = log.errors.slice(e0); cur.reports = log.reports.slice(r0).map((r) => r.slice(0, 260)); cur.alert = await alert().catch(() => null);
  console.log(name, JSON.stringify(cur).slice(0, 3000));
}
fs.writeFileSync(new URL(`../../audit/systems-b${only ? '-' + only : ''}.json`, import.meta.url), JSON.stringify(res, null, 1));
await b.close();
