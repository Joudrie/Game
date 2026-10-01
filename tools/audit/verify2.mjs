// Audit re-measurements in open ground (no block within 40 m), soldiers tracked by id.
// Usage: node tools/audit/verify2.mjs [only]   → audit/verify2.json + audit/shots/v2-*.png
import fs from 'fs';
import { open, park } from './lib.mjs';

const { b, p, ev, log, alert, closeAlert, shot } = await open();
const adv = (s) => ev((s) => __game.advance(s), s);
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
// an open spot: no block within 40 m of it (searched once)
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return null; });
console.log('open spot', O);
async function reset() {
  for (const m of ['left', 'right', 'middle']) await p.mouse.up({ button: m }).catch(() => {});
  for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space', 'KeyC', 'KeyH']) await p.keyboard.up(k).catch(() => {});
  await ev(([x, z]) => { const g = __game; if (g.dead) g.respawn(); g.closeMoves(); g.toggleInv(false); for (const id of ['weapon', 'missions', 'mdone', 'deathpanel']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    if (g.mission) g.endMission('quit'); g.leaveCover('audit'); if (g.grappleState === 'pull' || g.grappleState === 'fire') g.grapplePress(); g.setGadget('jetpack', false); g.setGadget('swing', false);
    g.setSneak(false); g.setDifficulty('sandbox'); g.setRmb(false); g.setAim(false); g.blockRelease(); g.attackRelease(); g.zapEnd(); g.holdFire(false); g.setClass('light'); g.setMode('ground', 0); g.place(x, z); g.look(Math.PI, 0.28);
    g.selectSlot(0, true); g.setGear('lit'); g.setDebugCam(null); g.advance(2); }, O);
  await park(ev); await closeAlert(); await lock();
}
const aimAt = (x, y, z) => ev(([x, y, z]) => { for (let i = 0; i < 3; i++) { const c = __game.camPos, dx = x - c[0], dy = y - c[1], dz = z - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.05); } }, [x, y, z]);
const swapIn = (id, slot = 4) => ev(([id, slot]) => { const I = __game.inv; let bi = I.bag.findIndex((x) => x && x.id === id); if (bi < 0) { const hi = I.hot.findIndex((x) => x && x.id === id); if (hi >= 0) { __game.selectSlot(hi, true); __game.advance(1.3); return; } __game.addItem(id, 3); bi = I.bag.findIndex((x) => x && x.id === id); } const t = I.hot[slot]; I.hot[slot] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(slot, true); __game.advance(1.3); }, [id, slot]);
const restoreHot = () => ev(() => { const want = ['saber', 'pistol', 'grenade', 'ak', 'shotgun', 'sniper'], I = __game.inv; want.forEach((id, s) => { if (I.hot[s]?.id === id) return; const bi = I.bag.findIndex((x) => x && x.id === id); if (bi >= 0) { const t = I.hot[s]; I.hot[s] = I.bag[bi]; I.bag[bi] = t; } }); __game.selectSlot(0, true); });
// one soldier d metres ahead (−z from the open spot), facing yw; returns his id
const one = (d, yw = 0, mind = 'patrol', dx = 0) => ev(([x, z, d, yw, mind, dx]) => { __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, x + dx, z - d, yw); __game.faceEnemy(0, yw); __game.setMind(0, mind, mind === 'patrol' ? 999 : 0); __game.advance(0.2); return __game.enemies().filter((e) => e.state !== 'dead')[0].id; }, [O[0], O[1], d, yw, mind, dx]);
const him = (id) => ev((id) => __game.enemies().find((e) => e.id === id) || { state: 'removed' }, id);
const res = {}; let cur; const note = (k, v) => { cur[k] = v; };
const S = {};

S.jumps = async () => {
  const out = {};
  for (const k of ['light', 'force', 'heavy']) {
    const r = {};
    for (const inf of [false, true]) {
      await reset(); await ev(([k, inf]) => { __game.setClass(k); __game.testCfg.infiniteJumps = inf; }, [k, inf]);
      const peaks = []; let top = 0;
      for (let j = 0; j < 4; j++) { await key('Space', 0.03); for (let t = 0; t < 7; t++) { await adv(0.04); top = Math.max(top, await ev(() => __game.y)); } peaks.push(+top.toFixed(2)); }
      for (let t = 0; t < 40; t++) { await adv(0.05); top = Math.max(top, await ev(() => __game.y)); }
      r[inf ? 'infiniteOn' : 'classLimits'] = { peakAfterEachPress: peaks, highest: +top.toFixed(2) };
    }
    out[k] = r;
  }
  await ev(() => { __game.testCfg.infiniteJumps = true; });
  note('jump peaks (Space every 0.31 s)', out);
};
S.slide = async () => {
  const out = {};
  for (const k of ['light', 'force', 'heavy']) {
    await reset(); await ev((k) => __game.setClass(k), k); await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(3);
    const a = await ev(() => __game.pos); await key('KeyC', 0.05); await adv(1); const c = await ev(() => __game.pos); await adv(1); const d = await ev(() => [__game.pos, __game.mode]);
    await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft');
    out[k] = { m1s: +Math.hypot(c[0] - a[0], c[2] - a[2]).toFixed(1), m2s: +Math.hypot(d[0][0] - a[0], d[0][2] - a[2]).toFixed(1), modeAt2s: d[1] };
    // slide-cancel chain: slide, jump, slide…
    await reset(); await ev((k) => __game.setClass(k), k); await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(3);
    const sp = []; for (let i = 0; i < 6; i++) { await key('KeyC', 0.05); await adv(0.3); await key('Space', 0.05); await adv(0.6); sp.push(+(await ev(() => __game.speed)).toFixed(1)); }
    await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft'); out[k].chainSpeeds = sp;
  }
  note('slides', out);
};
S.mapEdge = async () => {
  await reset(); await ev(() => { __game.place(1985, 0); __game.look(Math.PI / 2, 0.2); __game.advance(0.3); });
  await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(5); await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft');
  note('sprint east from x=1985 for 5 s: pos, mode', await ev(() => [__game.pos, __game.mode])); await shot('v2-map-edge');
  await ev(() => { __game.setDebugCam([__game.pos[0] - 8, 6, __game.pos[2] + 8], [__game.pos[0], 0, __game.pos[2]]); __game.advance(0.1); }); await shot('v2-map-edge-side'); await ev(() => __game.setDebugCam(null));
};
S.guns = async () => {
  const out = {};
  for (const [slot, kind] of [[1, 'pistol'], [3, 'ak'], [4, 'shotgun'], [5, 'sniper'], ['ar', 'ar']]) {
    const r = {};
    for (const [zone, zy] of [['torso', 1.2], ['head', 1.62], ['legs', 0.55]]) for (const dist of [8, 20]) {
      await reset(); if (slot === 'ar') await swapIn('ar'); else await ev((s) => { __game.selectSlot(s, true); __game.advance(1.5); }, slot);
      const id = await one(dist, 0); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.faceEnemy(i, 0); }, id);
      let n = 0, e;
      for (; n < 30; n++) { e = await him(id); if (e.state === 'dead' || e.state === 'removed') break; await aimAt(e.pos[0], zy, e.pos[2]); await click(); await adv(kind === 'sniper' ? 1.4 : kind === 'shotgun' ? 1.0 : 0.22); }
      r[`${zone}@${dist}m`] = e.state === 'dead' ? n : '>30'; if (zone === 'torso' && dist === 8) await shot(`v2-gun-${kind}`);
      r[`death ${zone}@${dist}m`] = e.death;
    }
    // AK/M4 hold-to-fire: time to empty, spread growth
    if (kind === 'ak' || kind === 'ar') { await reset(); await swapIn(kind === 'ar' ? 'ar' : 'ak'); await ev(() => __game.look(Math.PI, 0.1)); const m0 = (await ev(() => __game.ammoMags()))[kind]; await p.mouse.down(); await adv(1); await p.mouse.up(); r.roundsIn1sHeld = m0 - (await ev(() => __game.ammoMags()))[kind]; }
    // recoil: view climb over 5 shots, and the barrel against the view
    await reset(); if (slot === 'ar') await swapIn('ar'); else await ev((s) => { __game.selectSlot(s, true); __game.advance(1.5); }, slot);
    await ev(() => { __game.look(Math.PI, 0.05); __game.advance(0.4); }); const pa = await ev(() => __game.aimProbe());
    for (let i = 0; i < 5; i++) { await click(); await adv(0.03); } const pb = await ev(() => __game.aimProbe()); await adv(1); const pc = await ev(() => __game.aimProbe());
    r.recoil = { pitchJumpRad: +(pa.camPitch - pb.camPitch).toFixed(3), back1s: +(pa.camPitch - pc.camPitch).toFixed(3), barrelVsViewDeg: pa.off };
    await p.mouse.down({ button: 'right' }); await adv(0.6); r.aimed = await ev(() => __game.aimProbe()); await shot(`v2-gun-${kind}-aim`); await p.mouse.up({ button: 'right' });
    out[kind] = r;
  }
  note('shots to kill (crosshair on the zone, real clicks)', out);
};
S.suppressor = async () => {
  const out = {};
  for (const sup of [true, false]) {
    await reset(); await ev((s) => { __game.setAtt('pistol', 'suppressor', s); __game.selectSlot(1, true); __game.advance(1.3); }, sup);
    const ids = await ev(([x, z]) => { __game.fillEnemies(); const L = __game.enemies().filter((e) => e.state !== 'dead'); const D = [4, 7, 12, 20, 30]; for (let i = 0; i < 5; i++) { __game.moveEnemy(i, x + 3, z + D[i], 0); __game.faceEnemy(i, 0); __game.setMind(i, 'patrol', 999); } __game.advance(0.2); return L.slice(0, 5).map((e) => e.id); }, O);
    await ev(() => __game.look(Math.PI, 0.1)); await click(); await adv(0.6);
    out[sup ? 'suppressed' : 'loud'] = await ev((ids) => ids.map((id) => __game.minds().find((m) => m.id === id)?.mind), ids);
  }
  await ev(() => __game.setAtt('pistol', 'suppressor', false));
  note('soldiers 4, 7, 12, 20, 30 m behind you, facing away; one shot fired the other way → minds', out);
};
S.force = async () => {
  const r = {};
  await reset(); await swapIn('force'); let id = await one(7, 0); let e = await him(id); await aimAt(e.pos[0], 1.2, e.pos[2]);
  await p.mouse.down({ button: 'right' }); const ch = []; for (let i = 0; i < 12; i++) { await adv(0.5); const h = await him(id); ch.push(`${h.state}${(await ev(() => __game.forceState().choke)) ? '*' : ''}`); if (i === 2) await shot('v2-choke'); } await p.mouse.up({ button: 'right' });
  r['choke held: his state every 0.5 s (* = still choking)'] = ch.join(' '); r.chokeDeath = (await him(id)).death;
  await reset(); await swapIn('force'); id = await one(7, 0); e = await him(id); await aimAt(e.pos[0], 1.2, e.pos[2]);
  await p.mouse.down({ button: 'right' }); await adv(0.8); await p.keyboard.down('KeyW'); await adv(1.1); await p.keyboard.up('KeyW'); await click(); await adv(0.8); await p.mouse.up({ button: 'right' }); await adv(0.5);
  e = await him(id); r['choke, walk up, click'] = [e.state, e.death, await ev((id) => __game.cuts().find((c) => c.id === id)?.label, id)];
  await reset(); await swapIn('force'); id = await one(7, 0); e = await him(id); await aimAt(e.pos[0], 1.2, e.pos[2]);
  await p.keyboard.down('KeyH'); let t = 0; for (; t < 5; t += 0.1) { await adv(0.1); if ((await him(id)).state === 'dead') break; if (Math.abs(t - 0.5) < 0.05) await shot('v2-zap'); } await p.keyboard.up('KeyH');
  r.zapSecondsToKill = +t.toFixed(1); r.zapDeath = (await him(id)).death;
  await reset(); await swapIn('force'); id = await one(9, 0); e = await him(id); await aimAt(e.pos[0], 1.2, e.pos[2]); await ev(() => __game.setGear('none')); await adv(1.3);
  await click(); await adv(1.5); e = await him(id); r['pull with the saber OFF: his state, distance'] = [e.state, +Math.hypot(e.pos[0] - O[0], e.pos[2] - O[1]).toFixed(1)];
  await restoreHot();
  await reset(); const ids = await ev(([x, z]) => { __game.fillEnemies(); const L = __game.enemies().filter((e) => e.state !== 'dead'); for (let i = 0; i < 3; i++) { __game.moveEnemy(i, x - 1 + i, z - 4, 0); __game.setMind(i, 'patrol', 999); } __game.advance(0.2); return L.slice(0, 3).map((e) => e.id); }, O);
  await aimAt(O[0], 1, O[1] - 4); await key('KeyT'); await adv(0.5); await shot('v2-push'); await adv(2);
  r['push 3 soldiers 2 m away: states, distance'] = await ev(([ids, O]) => ids.map((id) => { const e = __game.enemies().find((x) => x.id === id); return [e.state, e.death, +Math.hypot(e.pos[0] - O[0], e.pos[2] - O[1]).toFixed(1)]; }), [ids, O]);
  await reset(); const ids2 = await ev(([x, z]) => { __game.fillEnemies(); const L = __game.enemies().filter((e) => e.state !== 'dead'); for (let i = 0; i < 3; i++) { __game.moveEnemy(i, x - 1 + i, z - 9, 0); __game.setMind(i, 'patrol', 999); } __game.advance(0.2); return L.slice(0, 3).map((e) => e.id); }, O);
  await aimAt(O[0], 1, O[1] - 9); await key('KeyT'); await adv(2.5);
  r['push 3 soldiers 7 m away'] = await ev(([ids, O]) => ids.map((id) => { const e = __game.enemies().find((x) => x.id === id); return [e.state, e.death]; }), [ids2, O]);
  note('force', r);
};
S.dash = async () => {
  const tries = [];
  for (const d of [6, 9, 12, 15]) {
    await reset(); const id = await one(d, 0); await ev(() => __game.look(Math.PI, 0.25));
    await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); const d0 = await ev(() => __game.dashes);
    let at = null; for (let i = 0; i < 30; i++) { await adv(0.05); const s = await ev(() => [__game.speed, __game.dashTarget()]); if (s[1]) { at = s; break; } }
    await click(); await adv(0.1); const mid = await ev(() => __game.dash); await adv(1); await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft');
    tries.push({ startDist: d, dashTargetSeenAt: at, dashing: mid, dashes: (await ev(() => __game.dashes)) - d0, his: (await him(id)).state, how: await ev((id) => __game.cuts().find((c) => c.id === id)?.label, id) });
    if (d === 9) await shot('v2-dash');
  }
  note('sprint at a soldier and click', tries);
};
S.parry = async () => {
  const out = [];
  for (const delay of [0, 0.1, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]) {
    await reset(); const id = await one(10, 0, 'combat'); const p0 = await ev(() => __game.parries);
    await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.enemyBolt(i); }, id);
    await adv(delay); await p.mouse.down({ button: 'right' }); await adv(1); await p.mouse.up({ button: 'right' });
    out.push([delay, (await ev(() => __game.parries)) - p0, (await ev(() => __game.blockedShots)), (await him(id)).state]);
  }
  note('[block pressed s after a bolt from 10 m, parries, total blocked, shooter]', out);
};
S.groundPound = async () => {
  await reset(); const ids = await ev(([x, z]) => { __game.fillEnemies(); const L = __game.enemies().filter((e) => e.state !== 'dead'); for (let i = 0; i < 3; i++) { __game.moveEnemy(i, x - 2 + i * 2, z - 3, 0); __game.setMind(i, 'patrol', 999); } __game.advance(0.2); return L.slice(0, 3).map((e) => e.id); }, O);
  await key('Space', 0.03); await adv(0.25); await key('Space', 0.03); await adv(0.25); await click(); await adv(0.2); const pd = await ev(() => __game.pound); await adv(0.8); await shot('v2-pound'); await adv(1);
  note('double jump + click: pounding, soldiers 3 m away', { pounding: pd, them: await ev((ids) => ids.map((id) => { const e = __game.enemies().find((x) => x.id === id); return [e.state, e.death]; }), ids) });
};
S.swingSwitchPose = async () => {
  await reset(); await click(); await adv(0.12); await key('Digit3'); await adv(0.2); await p.keyboard.down('KeyW'); await adv(1); await shot('v2-swing-then-grenade-walk');
  note('swing, then 3 (grenade), walking 1 s: overrides', await ev(() => [__game.overrides, __game.gear, __game.gait]));
  await p.keyboard.up('KeyW'); await adv(3); note('3 s later', await ev(() => [__game.overrides, __game.atk]));
  await reset(); await p.mouse.down(); await adv(0.5); await p.mouse.up(); await key('Digit2'); await adv(1.5); await shot('v2-heavy-then-pistol');
  note('heavy, then 2 (pistol): overrides', await ev(() => [__game.overrides, __game.pistolInHand]));
};
S.emptyPistolBack = async () => {
  await reset(); await ev(() => { __game.selectSlot(1, true); __game.advance(1.3); });
  for (let i = 0; i < 12; i++) { await click(); await adv(0.2); } await adv(0.1); const m = await ev(() => [__game.ammoMags().pistol, __game.reload]);
  await key('Digit4'); await adv(1.5); await key('Digit2'); await adv(3); const m2 = await ev(() => [__game.ammoMags().pistol, __game.reload]);
  await click(); await adv(0.3); const m3 = await ev(() => [__game.ammoMags().pistol, __game.reload]); await adv(2.5);
  note('empty the pistol (12 clicks), switch to AK and back, wait, click: [mag, reload]', { afterEmptying: m, backAfter3s: m2, afterAClick: m3, later: await ev(() => __game.ammoMags().pistol) });
};

const only = process.argv[2];
await lock();
for (const [name, f] of Object.entries(S)) {
  if (only && name !== only) continue;
  cur = res[name] = {}; const e0 = log.errors.length;
  try { await f(); } catch (e) { cur.exception = String(e.stack || e).slice(0, 600); }
  cur.errors = log.errors.slice(e0);
  console.log(name, JSON.stringify(cur).slice(0, 2500));
}
fs.writeFileSync(new URL(`../../audit/verify2${only ? '-' + only : ''}.json`, import.meta.url), JSON.stringify(res, null, 1));
await b.close();
