import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.goto('http://127.0.0.1:8766/preview2.html');
await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
await p.evaluate(() => __game.setGear('lit', true)); await p.waitForTimeout(300);
const seq = []; let last = null; const t0 = Date.now();
while (Date.now() - t0 < 16000 && seq.length < 8) { await p.evaluate(() => { __game.attackPress(); __game.attackRelease(); }); await p.waitForTimeout(100); const a = await p.evaluate(() => __game.atk); if (a !== last && a !== null) seq.push(a + 1); last = a; }
console.log('sequence', seq.join(' → '));
await b.close();
