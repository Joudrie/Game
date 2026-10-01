// Audit re-tests in open ground: patrols on a fresh page, noticing, sneaking up, special soldiers, grapple onto soldiers, yank, swing, loot.
// Usage: node tools/audit/verify6.mjs   → audit/verify6.json + audit/shots/v6-*.png
import fs from 'fs';
import { open, park } from './lib.mjs';
const { b, p, ev, log, alert, closeAlert, shot } = await open();
const adv = (s) => ev((s) => __game.advance(s), s);
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
const res = {}; let cur; const note = (k, v) => { cur[k] = v; console.log(k, JSON.stringify(v).slice(0, 900)); };
// 1. patrols on an untouched page: how far does each soldier walk in 30 s, and what is he doing?
cur = res.patrolFresh = {};
await lock();
const p0 = await ev(() => __game.enemies().map((e) => ({ id: e.id, pos: e.pos })));
await adv(30); const p1 = await ev(() => __game.minds());
note('fresh page, 30 s: metres walked per soldier, mind', p0.map((a) => { const e = p1.find((m) => m.id === a.id); const q = (__dummy) => 0; return a.id; }));
const moved = await ev((p0) => p0.map((a) => { const e = __game.enemies().find((x) => x.id === a.id); return e ? [+Math.hypot(e.pos[0] - a.pos[0], e.pos[2] - a.pos[2]).toFixed(1), e.clip] : null; }), p0);
note('moved, clip', moved); note('minds', p1.map((m) => m.mind));
await ev(() => { __game.setDebugCam([0, 40, 30], [0, 0, -10]); __game.advance(0.1); }); await shot('v6-patrol-fresh'); await ev(() => __game.setDebugCam(null));
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return null; });
async function reset() {
  for (const m of ['left', 'right', 'middle']) await p.mouse.up({ button: m }).catch(() => {});
  for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space', 'KeyC']) await p.keyboard.up(k).catch(() => {});
  await ev(([x, z]) => { const g = __game; if (g.dead) g.respawn(); g.setSneak(false); g.setDifficulty('sandbox'); g.blockRelease(); g.attackRelease(); g.setClass('light'); g.setMode('ground', 0); g.place(x, z); g.look(Math.PI, 0.28); g.selectSlot(0, true); g.setGear('lit'); g.setDebugCam(null); g.setGadget('swing', false); g.advance(2); }, O);
  await park(ev); await closeAlert(); await lock();
}
const one = (d, yw = 0, mind = 'patrol', dx = 0) => ev(([x, z, d, yw, mind, dx]) => { __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, x + dx, z - d, yw); __game.faceEnemy(0, yw); __game.setMind(0, mind, mind === 'patrol' ? 999 : 0); __game.advance(0.2); return __game.enemies().filter((e) => e.state !== 'dead')[0].id; }, [O[0], O[1], d, yw, mind, dx]);
const him = (id) => ev((id) => __game.enemies().find((e) => e.id === id) || { state: 'removed' }, id);
const mind = (id) => ev((id) => __game.minds().find((m) => m.id === id), id);
const aimAt = (x, y, z) => ev(([x, y, z]) => { for (let i = 0; i < 3; i++) { const c = __game.camPos, dx = x - c[0], dy = y - c[1], dz = z - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.05); } }, [x, y, z]);
// 2. noticing in plain view (he faces you: yaw 0 → +z, you are at +d)
cur = res.notice = {};
for (const d of [6, 12, 20, 30]) {
  await reset(); const id = await one(d, 0); const seq = []; let t = 0;
  for (; t < 6; t += 0.1) { await adv(0.1); const m = await mind(id); seq.push((m.mark || '.') + m.mind[0]); if (m.mind === 'combat') break; }
  note(`he faces you ${d} m away, you stand still: seconds to combat`, [+t.toFixed(1), seq.filter((s, i) => i === 0 || s !== seq[i - 1]).join(' ')]);
  if (d === 12) await shot('v6-notice-12m');
}
for (const [label, setup] of [['crouched (fists)', async () => { await ev(() => { __game.setGear('none'); __game.advance(1); }); await key('KeyC'); }], ['sneak (V)', async () => { await ev(() => __game.setSneak(true)); }]]) {
  await reset(); await setup(); const id = await one(12, 0); let t = 0; for (; t < 8; t += 0.1) { await adv(0.1); if ((await mind(id)).mind === 'combat') break; }
  note(`he faces you 12 m away, you are ${label}: seconds to combat`, +t.toFixed(1));
}
// 3. sneaking up from behind: does he notice before you reach takedown range?
cur = res.sneakBehind = {};
for (const [label, keys] of [['walk (sneak V)', ['KeyW']], ['jog', ['KeyW']], ['sprint', ['KeyW', 'ShiftLeft']]]) {
  await reset(); if (label.startsWith('walk')) await ev(() => __game.setSneak(true)); const id = await one(12, Math.PI); // facing away from you
  for (const k of keys) await p.keyboard.down(k); let res2 = null;
  for (let i = 0; i < 80; i++) { await adv(0.1); const m = await mind(id), e = await him(id); const dist = Math.hypot(e.pos[0] - (await ev(() => __game.pos))[0], e.pos[2] - (await ev(() => __game.pos))[2]); if (m.mind !== 'patrol') { res2 = ['noticed at', +dist.toFixed(1)]; break; } if (await ev(() => !document.getElementById('tdprompt').hidden)) { res2 = ['takedown prompt at', +dist.toFixed(1)]; break; } }
  for (const k of keys) await p.keyboard.up(k);
  note(`${label} straight at his back from 12 m`, res2);
}
// 4. special soldiers, by real input, open ground
cur = res.specials = {};
for (const t of ['jugg', 'shield', 'duel']) {
  const r = {};
  // saber, from the front, standing 1.4 m away, clicking
  await reset(); let id = await ev(([t, x, z]) => __game.spawnSpecial(t, x, z - 3), [t, O[0], O[1]]);
  await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'combat', 0); __game.faceEnemy(i, 0); __game.advance(0.5); }, id);
  let n = 0; for (; n < 16; n++) { const e = await him(id); if (e.state === 'dead' || e.state === 'removed') break; await ev(([x, z]) => { __game.place(x, z + 1.4); __game.look(Math.PI, 0.25); }, [e.pos[0], e.pos[2]]); await click(); await adv(0.7); if (n === 1) await shot(`v6-${t}-saber`); }
  r.saberClicksFront = n; r.after = await ev((id) => __game.special().find((s) => s.id === id) || 'gone', id); r.death = (await him(id)).death;
  // saber from behind
  await reset(); id = await ev(([t, x, z]) => __game.spawnSpecial(t, x, z - 3), [t, O[0], O[1]]); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, Math.PI); __game.advance(0.3); }, id);
  n = 0; for (; n < 16; n++) { const e = await him(id); if (e.state === 'dead' || e.state === 'removed') break; await ev(([x, z]) => { __game.place(x, z + 1.4); __game.look(Math.PI, 0.25); }, [e.pos[0], e.pos[2]]); await click(); await adv(0.7); }
  r.saberClicksBehind = n;
  // pistol from 12 m, front then back
  for (const [side, yw] of [['front', 0], ['back', Math.PI]]) {
    await reset(); id = await ev(([t, x, z]) => __game.spawnSpecial(t, x, z - 12), [t, O[0], O[1]]); await ev(([id, yw]) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, yw); __game.advance(0.3); }, [id, yw]);
    await ev(() => { __game.selectSlot(1, true); __game.advance(1.3); });
    let k = 0; for (; k < 40; k++) { const e = await him(id); if (e.state === 'dead' || e.state === 'removed') break; await aimAt(e.pos[0], 1.3, e.pos[2]); await click(); await adv(0.25); }
    r['pistolShots_' + side] = k >= 40 ? '>40' : k;
  }
  // grapple onto him
  await reset(); id = await ev(([t, x, z]) => __game.spawnSpecial(t, x, z - 12), [t, O[0], O[1]]); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, 0); __game.advance(0.3); }, id);
  let e = await him(id); await aimAt(e.pos[0], 1.2, e.pos[2]); await key('KeyR'); await adv(0.6); await shot(`v6-${t}-grapple`); await adv(1.5);
  e = await him(id); r.grappleOnto = { his: e.state, myDist: +Math.hypot(e.pos[0] - (await ev(() => __game.pos))[0], e.pos[2] - (await ev(() => __game.pos))[2]).toFixed(1), events: await ev(() => __game.events.filter((x) => /grapple|repel|rope|cut/i.test(x)).slice(-3)) };
  cur[t] = r; console.log(t, JSON.stringify(r));
}
// 5. grapple onto a plain soldier, and yank
cur = res.grappleSoldier = {};
await reset(); let id = await one(12, 0); let e = await him(id); await aimAt(e.pos[0], 1.2, e.pos[2]); await key('KeyR'); await adv(0.5); await shot('v6-grapple-soldier'); await adv(1.5); e = await him(id);
note('grapple a soldier 12 m away: his state, cut, distance', [e.state, e.death, +Math.hypot(e.pos[0] - O[0], e.pos[2] - O[1]).toFixed(1), await ev(() => __game.pos)]);
await reset(); id = await one(12, 0); e = await him(id); await aimAt(e.pos[0], 1.2, e.pos[2]); await p.mouse.down({ button: 'right' }); await adv(0.1); await key('KeyR'); await adv(1.6); await p.mouse.up({ button: 'right' }); e = await him(id);
note('yank (hold right-click, R): his state, distance from you, yanks', [e.state, e.death, +Math.hypot(e.pos[0] - O[0], e.pos[2] - O[1]).toFixed(1), await ev(() => __game.yanks)]); await shot('v6-yank');
// 6. swing: a 20 m+ building, hook high on its wall
cur = res.swing = {};
const tall = await ev(() => __game.blocks.filter((b) => b.max[1] >= 18).map((b) => ({ ...b, c: [(b.min[0] + b.max[0]) / 2, (b.min[2] + b.max[2]) / 2] })).sort((a, b) => Math.hypot(...a.c) - Math.hypot(...b.c))[0]);
await reset(); await ev(() => __game.setGadget('swing', true));
await ev(([B]) => { __game.place(B.c[0], B.min[2] - 14); __game.look(0, 0); __game.advance(0.3); }, [tall]); await aimAt(tall.c[0], tall.max[1] * 0.8, tall.min[2]);
await key('KeyR'); const sw = []; for (let i = 0; i < 40; i++) { await adv(0.1); sw.push(await ev(() => `${__game.grappleState[0]}${__game.swing ? 'S' : ''}${__game.y.toFixed(1)}`)); if (i === 15) await shot('v6-swing'); if (i === 10) await p.keyboard.down('KeyW'); }
await p.keyboard.up('KeyW'); note('swing on the nearest 18 m+ building: state/y every 0.1 s', sw.join(' ')); note('building', tall);
// 7. loot a body with G
cur = res.loot = {};
await reset(); id = await one(3, 0); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.damageEnemy(i, 999, 'head'); __game.advance(2); }, id);
e = await him(id); await ev(([x, z]) => { __game.place(x + 0.6, z + 0.6); __game.advance(0.3); }, [e.pos[0], e.pos[2]]);
note('prompt near the body', await ev(() => !document.getElementById('lootprompt').hidden)); await key('KeyG'); await adv(0.6); await shot('v6-loot'); await adv(3);
note('loot log', await ev(() => __game.lootLog.slice(-6).map((x) => x.name + ' ×' + x.qty)));
fs.writeFileSync(new URL('../../audit/verify6.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
