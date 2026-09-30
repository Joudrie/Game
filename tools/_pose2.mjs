import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 900, height: 600 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('http://127.0.0.1:8766/preview2.html'); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
await p.evaluate(() => { __game.setEnemyCount(0); __game.place(-3, 3); __game.look(0, 0.12); __game.advance(0.5); });
for (const [g, slot] of [['none', 2], ['lit', 0], ['pistol', 1], ['ak', 3]]) {
  await p.evaluate((slot) => { __game.selectSlot(slot); __game.advance(2); }, slot);
  await p.screenshot({ path: `${OUT}/cam-${g}-idle.png` });
  await p.evaluate(() => { __game.setKey('KeyW', true); __game.advance(1.2); });
  await p.screenshot({ path: `${OUT}/cam-${g}-run.png` });
  await p.evaluate(() => { __game.setKey('KeyW', false); __game.advance(1); __game.place(-3, 3); __game.advance(0.3); });
}
await b.close();
