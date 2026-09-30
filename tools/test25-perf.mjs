// v21: what the soldiers cost. For 0/5/10/20/40 soldiers: game-logic time per step (all of it, and the soldiers' share),
// draw calls and triangles per frame. Headless Chromium renders on the CPU (SwiftShader), so only the game-logic
// numbers and the call/triangle counts carry over to a real device; frame rates here mean nothing.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
await ev(() => { __game.setGear('lit', true); __game.place(0, 0); __game.look(0.3, 0.25); });
const rows = [];
for (const n of [0, 5, 10, 20, 40]) {
  const r = await ev(async (n) => {
    __game.setEnemyCount(n);
    if (n === 0) for (const e of __game.enemies()) {} // leave the rest to the count
    __game.advance(n * 0.12 + 2); // spawns one soldier every 0.1 s until the squad is full
    const alive = __game.enemies().filter((e) => e.state !== 'dead').length;
    // game logic only: 90 steps, timed
    const t0 = performance.now(); __game.perf.enemyAcc = 0; __game.advance(3); const ms = (performance.now() - t0) / 90, en = __game.perf.enemyAcc / 90;
    await new Promise((res) => setTimeout(res, 1500)); // let a few real frames render for the call and triangle counts
    return { soldiers: alive, stepMs: +ms.toFixed(2), soldiersMs: +en.toFixed(2), calls: __game.perf.calls, tris: __game.perf.tris };
  }, n);
  if (n === 0) { await ev(() => { __game.setEnemyCount(0); }); }
  rows.push(r); console.log(JSON.stringify(r));
  if (n === 20) await p.screenshot({ path: `${OUT}/v21-swat-20.png` });
}
const per = rows.length > 2 ? (rows[rows.length - 1].stepMs - rows[1].stepMs) / (rows[rows.length - 1].soldiers - rows[1].soldiers) : 0;
console.log('game logic per extra soldier ≈', per.toFixed(3), 'ms; draw calls per soldier ≈', ((rows[rows.length - 1].calls - rows[1].calls) / (rows[rows.length - 1].soldiers - rows[1].soldiers)).toFixed(1),
  '; triangles per soldier ≈', Math.round((rows[rows.length - 1].tris - rows[1].tris) / (rows[rows.length - 1].soldiers - rows[1].soldiers)));
console.log(errs.length ? 'FAILED' : 'PASS');
await b.close(); process.exit(errs.length ? 1 : 0);
