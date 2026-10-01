// Audit: performance. Load time, game-logic cost per frame by soldier count (CPU side: comparable between runs even
// on the software GPU), draw calls and triangles, first-use hitches, a 10-minute combat soak for leaks, build size.
// Usage: node tools/audit/perf.mjs   → audit/perf.json
import fs from 'fs';
import { open, park } from './lib.mjs';

const out = {};
out.buildBytes = { index: fs.statSync(new URL('../../dist/index.html', import.meta.url)).size, cap: 16 * 1024 * 1024 };
const { b, p, ev, log, shot } = await open();
out.loadMs = log.loadMs;
out.loadFreezeReports = log.reports.map((r) => r.slice(0, 200));
const cdp = await p.context().newCDPSession(p); await cdp.send('Performance.enable');
const heap = async () => { await cdp.send('HeapProfiler.collectGarbage').catch(() => {}); const m = (await cdp.send('Performance.getMetrics')).metrics; const g = (n) => m.find((x) => x.name === n)?.value; return { heapMB: +(g('JSHeapUsedSize') / 1048576).toFixed(1), nodes: g('Nodes') }; };
await p.mouse.click(640, 300);
// game-logic ms per 1/30 s step, and render stats, at 5 / 10 / 20 soldiers in combat
out.bySoldiers = {};
for (const n of [5, 10, 20, 30]) {
  await ev((n) => { __game.setEnemyCount(n); __game.fillEnemies(); __game.advance(0.5); const L = __game.enemies().filter((e) => e.state !== 'dead'); for (let i = 0; i < L.length; i++) { __game.moveEnemy(i, -12 + (i % 6) * 5, -14 - Math.floor(i / 6) * 4, 0); __game.setMind(i, 'combat', 0); } __game.advance(1); }, n);
  const stepMs = await ev(() => { const t = performance.now(); __game.advance(3); return (performance.now() - t) / 90; });
  await p.waitForTimeout(2500); const pf = await ev(() => ({ fps: +__game.perf.fps.toFixed(1), cpu: +__game.perf.cpu.toFixed(2), soldiers: +__game.perf.enemies.toFixed(2), render: +__game.perf.render.toFixed(2), calls: __game.perf.calls, tris: __game.perf.tris }));
  out.bySoldiers[n] = { stepMs: +stepMs.toFixed(2), ...pf };
  await shot('pf-soldiers-' + n);
}
await ev(() => { __game.setEnemyCount(10); });
// first-use hitches: wall time of the first and the second use of each effect (shader compiles show up the first time)
out.firstUse = {};
const timeIt = (f) => ev((src) => { const t = performance.now(); (0, eval)(src)(); __game.advance(0.05); return +(performance.now() - t).toFixed(0); }, f);
for (const [k, f] of Object.entries({
  frag: '() => __game.explodeAt(0, 0.3, -12)', fire: '() => __game.firePatch(4, -12)', sticky: '() => __game.throwKind("sticky")', orb: '() => __game.throwKind("orb")',
  blood: '() => { __game.fillEnemies(); __game.cutEnemy(0, "head"); }', sparks: '() => { __game.selectSlot(1, true); __game.shootPoint(4, 1, -13); }',
  jugg: '() => __game.spawnSpecial("jugg", 0, -10)', shield: '() => __game.spawnSpecial("shield", 2, -10)', duel: '() => __game.spawnSpecial("duel", -2, -10)',
})) {
  const first = await timeIt(f); await ev(() => __game.advance(1)); const second = await timeIt(f); await ev(() => __game.advance(1));
  // real frames: render after the effect, timed
  const frame = await p.evaluate(() => new Promise((res) => { const t = performance.now(); requestAnimationFrame(() => requestAnimationFrame(() => res(+(performance.now() - t).toFixed(0)))); }));
  out.firstUse[k] = { firstMs: first, secondMs: second, twoFramesMs: frame };
}
out.reportsDuringFirstUse = log.reports.slice(-5).map((r) => r.slice(0, 200));
// 10-minute soak with constant combat
await park(ev);
const soak = []; const t0 = Date.now();
soak.push({ min: 0, ...(await heap()), ...(await ev(() => ({ enemies: __game.enemies().length, blood: __game.blood(), debris: __game.debris, fires: __game.fires, particles: __game.particles, programs: __game.programs, scorches: __game.forceState().scorches, mags: __game.mags }))) });
for (let m = 1; m <= 10; m++) {
  await ev(() => {
    for (let s = 0; s < 12; s++) { // 12 bursts of 5 s each
      __game.fillEnemies(); __game.advance(0.1);
      const L = __game.enemies().filter((e) => e.state !== 'dead');
      for (let i = 0; i < L.length; i++) { __game.moveEnemy(i, -6 + (i % 5) * 3, -8 - Math.floor(i / 5) * 3, 0); __game.setMind(i, 'combat', 0); }
      __game.selectSlot(1, true); for (let k = 0; k < 6; k++) { __game.shootAt(0, k % 2 ? 'head' : 'torso'); __game.advance(0.2); }
      __game.throwKind(['frag', 'sticky', 'fire'][s % 3]); __game.cutEnemy(1, 'head'); __game.cutEnemy(2, 'upperarm_r');
      __game.startReload(); __game.advance(3.5);
    }
  });
  soak.push({ min: m, ...(await heap()), ...(await ev(() => ({ enemies: __game.enemies().length, blood: __game.blood(), debris: __game.debris, fires: __game.fires, particles: __game.particles, programs: __game.programs, scorches: __game.forceState().scorches, mags: __game.mags }))) });
}
out.soak = soak; out.soakWallSeconds = Math.round((Date.now() - t0) / 1000);
out.rendererInfo = await ev(() => __game.perf);
out.errors = log.errors;
fs.writeFileSync(new URL('../../audit/perf.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
await b.close();
