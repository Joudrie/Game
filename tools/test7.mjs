// Regression for the T-pose report: preview in Moves, switch class, close, then move in every gear.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:8766/preview2.html';
const OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
p.on('console', m => { if (/\[report\]|error/i.test(m.text()) && !/404|CERT/.test(m.text())) console.log('console', m.type(), m.text().slice(0, 200)); });
await p.goto(URL);
await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const st = () => p.evaluate(() => ({ gear: __game.gear, gait: __game.gait, s: +__game.speed.toFixed(1), pose: Object.fromEntries(Object.entries(__game.pose).map(([k, v]) => [k, +v.toFixed(2)])), report: __game.lastReport && __game.lastReport.kind }));
await p.click('#movesbtn'); await p.waitForTimeout(300);
for (const [slot, id] of [['walk', 'Walk_Loop'], ['sprint', 'Sprint_Loop'], ['idle', 'Idle_Loop'], ['jog', 'Jog_Fwd_Loop']]) { await p.click(`.pv[data-slot="${slot}"][data-id="${id}"]`); await p.waitForTimeout(250); }
for (const k of ['heavy', 'force', 'light']) { await p.click(`[data-class="${k}"]`); await p.waitForTimeout(150); }
await p.click('#movesclose'); await p.waitForTimeout(400);
console.log('after moves', JSON.stringify(await st()));
for (const g of ['none', 'hilt', 'lit', 'pistol']) {
  await p.evaluate((g) => __game.setGear(g, true), g); await p.waitForTimeout(200);
  await p.keyboard.down('KeyV'); await p.keyboard.up('KeyV');           // walk
  await p.keyboard.down('KeyW'); await p.waitForTimeout(900); console.log(g, 'walk', JSON.stringify(await st())); await p.screenshot({ path: `${OUT}/v7-${g}-walk.png` });
  await p.keyboard.down('KeyV'); await p.keyboard.up('KeyV');           // run
  await p.waitForTimeout(900); console.log(g, 'run', JSON.stringify(await st())); await p.screenshot({ path: `${OUT}/v7-${g}-run.png` });
  await p.keyboard.down('ShiftLeft'); await p.waitForTimeout(1000); console.log(g, 'sprint', JSON.stringify(await st()));
  await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW'); await p.waitForTimeout(900); console.log(g, 'stop', JSON.stringify(await st())); await p.screenshot({ path: `${OUT}/v7-${g}-idle.png` });
}
console.log('final report', await p.evaluate(() => __game.lastReport && JSON.stringify(__game.lastReport).slice(0, 600)));
await b.close();
