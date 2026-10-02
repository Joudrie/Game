// v38: hills, grass and the sea. Sprinting anywhere (up and down hills, into and off every building, to the water's
// edge) the hero stands on the ground: never under it, never sunk into it. Buildings and roads stay flat; soldiers
// and bodies sit on the hills; you can wade in to your knees, no deeper.
import { chromium } from 'playwright';
const URL = (process.env.URL || 'http://127.0.0.1:8766/preview2.html') + '?hills=1', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 960, height: 540 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
const adv = (s) => ev((s) => __game.advance(s), s);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
check(await ev(() => __game.hills), 'hills on (?hills=1)');
const prof = await ev(() => { let lo = 99, hi = -99; for (let x = -400; x <= 400; x += 8) for (let z = -400; z <= 400; z += 8) { const h = __game.terrainH(x, z); lo = Math.min(lo, h); hi = Math.max(hi, h); } return [lo, hi]; });
check(prof[1] > 8, `real hills: ground from ${prof[0].toFixed(1)} to ${prof[1].toFixed(1)} m`);
const flat = await ev(() => { const cells = __game.roadCells.map((c) => c.split(',').map(Number)); const roads = cells.map(([i, j]) => Math.abs(__game.terrainH(i * 10, j * 10))); const bl = __game.blocks.filter((b) => b.max[1] > 3 && b.max[0] - b.min[0] > 3 && b.max[2] - b.min[2] > 3).map((b) => Math.abs(__game.terrainH((b.min[0] + b.max[0]) / 2, (b.min[2] + b.max[2]) / 2))); return [Math.max(...roads), Math.max(...bl), Math.abs(__game.terrainH(0, 0)), Math.abs(__game.terrainH(0, 175))]; });
check(flat.every((v) => v < 0.05), `roads, buildings, the start and the courtyard stay flat (${flat.map((v) => v.toFixed(2)).join(', ')})`);
await ev(() => { __game.setEnemyCount(0); for (let i = 0; i < 12; i++) __game.moveEnemy(i, 900 + i * 5, 900); });
await p.mouse.click(480, 270);
const bad = []; let n = 0;
const sample = async (tag) => { const r = await ev(() => __game.bodyProbe()); n++; const sunk = r.mode === 'ground' && (Math.abs(r.y - r.ground) > 0.06 || r.head < 1.1 || r.pelvis < 0.55 || Math.min(r.footL, r.footR) < -0.12); const under = r.y < r.ground - 0.06; if (sunk || under) bad.push({ tag, ...r, pos: await ev(() => __game.pos) }); };
// sprint across the hills from the highest ground, in 16 directions, all three classes
const top = await ev(() => { let best = null; for (let x = -300; x <= 300; x += 8) for (let z = -300; z <= 300; z += 8) { const h = __game.terrainH(x, z); if (!best || h > best[2]) best = [x, z, h]; } return best; });
for (const klass of ['light', 'force', 'heavy']) {
  await ev((k) => __game.setClass(k), klass);
  for (let a = 0; a < 16; a += klass === 'light' ? 1 : 4) {
    await ev(([x, z, a]) => { __game.place(x, z); __game.look(a * Math.PI / 8, 0.2); __game.advance(0.2); }, [top[0], top[1], a]);
    await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft');
    for (let t = 0; t < 8; t++) { await adv(0.5); await sample(`${klass} dir ${a}`); }
    await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW');
  }
}
await ev(() => __game.setClass('light'));
// jumps on a slope land on it
for (let j = 0; j < 4; j++) { await ev(([x, z, j]) => { __game.place(x + j * 7, z + 9); __game.look(j, 0.2); __game.advance(0.3); }, [...top, j]); await p.keyboard.down('KeyW'); await p.keyboard.down('Space'); await adv(0.1); await p.keyboard.up('Space'); await adv(1.6); await p.keyboard.up('KeyW'); await adv(0.3); await sample(`jump ${j}`); }
// every building: sprint into each side, then off the roof
const blds = await ev(() => __game.blocks.filter((b) => b.max[1] > 3 && b.max[0] - b.min[0] > 3).map((b) => ({ c: [(b.min[0] + b.max[0]) / 2, (b.min[2] + b.max[2]) / 2], h: b.max[1], w: b.max[0] - b.min[0], d: b.max[2] - b.min[2] })));
for (const [bi, B] of blds.entries()) {
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    await ev(([x, z, a]) => { __game.place(x, z); __game.look(a, 0.2); __game.advance(0.2); }, [B.c[0] + dx * (B.w / 2 + 12), B.c[1] + dz * (B.d / 2 + 12), Math.atan2(-dx, -dz)]);
    await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft');
    for (let t = 0; t < 5; t++) { await adv(0.4); await sample(`building ${bi} side`); }
    await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW');
  }
  await ev(([x, z, h]) => { __game.setMode('air', h + 0.5); __game.place(x, z); __game.advance(0.5); __game.look(0.7, 0.2); }, [B.c[0], B.c[1], B.h]);
  await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft');
  for (let t = 0; t < 8; t++) { await adv(0.4); await sample(`building ${bi} off roof`); }
  await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW'); await adv(2); await sample(`building ${bi} landed`);
}
check(bad.length === 0, `sprinting over hills, jumping on slopes, into ${blds.length} buildings and off their roofs: on the ground every time (${n} samples, ${bad.length} bad)`);
for (const x of bad.slice(0, 8)) console.log('   ', JSON.stringify(x));
// the sea: sprint toward it from the beach; knee deep at most
const beach = await ev(() => { for (let a = 0; a < 6.28; a += 0.1) for (let r = 520; r > 300; r -= 4) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.terrainH(x, z) > 0.5) return [x, z, a]; } return null; });
await ev(([x, z, a]) => { __game.place(x, z); __game.look(Math.atan2(Math.cos(a), Math.sin(a)), 0.2); __game.advance(0.3); }, beach);
await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); let deepest = 99;
for (let t = 0; t < 12; t++) { await adv(0.5); const P = await ev(() => __game.pos); deepest = Math.min(deepest, await ev(([x, z]) => __game.terrainH(x, z), [P[0], P[2]])); }
await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW');
check(deepest >= -1.1 - 0.6, `running into the sea stops at the shallows (lowest ground ${deepest.toFixed(2)} m, sea at -1.1)`);
await ev(() => { const P = __game.pos; __game.setDebugCam([P[0] - 8, P[1] + 4, P[2] - 8], [P[0], P[1], P[2]]); __game.advance(0.05); }); await p.screenshot({ path: `${OUT}/v37-shore.png` }); await ev(() => __game.setDebugCam(null));
// soldiers on a hillside stand on it; a body comes to rest on it
await ev(([x, z]) => { __game.place(x - 6, z - 6); __game.setEnemyCount(3); __game.fillEnemies(); __game.advance(0.1); for (let i = 0; i < 3; i++) { __game.moveEnemy(i, x + 3 * i - 3, z + 4, Math.PI); __game.setMind(i, 'patrol', 999); } __game.advance(1); }, top);
const feet = await ev(() => __game.enemies().filter((e) => e.state !== 'dead').slice(0, 3).map((e) => +(e.pos[1] - __game.terrainH(e.pos[0], e.pos[2])).toFixed(3)));
check(feet.length === 3 && feet.every((d) => Math.abs(d) < 0.05), `soldiers on the hillside stand on it (${feet.join(', ')})`);
await ev(() => { const e = __game.enemies().filter((x) => x.state !== 'dead')[0]; __game.explodeAt(e.pos[0] + 0.8, e.pos[1] + 0.3, e.pos[2]); __game.advance(5); });
const rag = await ev(() => { const all = __game.minds(); const i = all.findIndex((x) => x.state === 'dead' && x.rag); const pp = i >= 0 ? __game.ragPelvis(i) : null; return pp ? +(pp[1] - __game.terrainH(pp[0], pp[2])).toFixed(2) : null; });
check(rag !== null && rag > 0 && rag < 0.6, `a body lies on the hill, not under it (pelvis ${rag} m above the ground)`);
await ev(([x, z]) => { __game.place(x - 6, z - 6); __game.look(0.8, 0.25); __game.advance(0.5); }, top); await p.screenshot({ path: `${OUT}/v37-hills.png` });
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
