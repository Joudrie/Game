import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 900, height: 700 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('http://127.0.0.1:8766/preview2.html'); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
await p.evaluate(() => { __game.setEnemyCount(0); __game.place(-3, 3); __game.advance(0.5); });
for (const [g, slot] of [['none', 2], ['lit', 0], ['pistol', 1], ['ak', 3], ['shotgun', 4]]) {
  await p.evaluate(([g, slot]) => { __game.selectSlot(slot); __game.advance(2); }, [g, slot]);
  for (const [n, cam] of [['front', [-3, 1.4, 5.4]], ['side', [-0.6, 1.4, 3]], ['back', [-2.4, 1.7, 0.4]]]) {
    await p.evaluate((cam) => { __game.setDebugCam(cam, [-3, 1.1, 3]); __game.advance(0.05); }, cam);
    await p.screenshot({ path: `${OUT}/pose-${g}-${n}.png` });
  }
}
await b.close();
