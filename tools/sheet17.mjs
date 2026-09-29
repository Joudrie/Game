import { chromium } from 'playwright';
import sharp from 'sharp';
const CLIPS = (process.env.CLIPS || 'Death01,SW_Death,M2M_Death_A,M2M_Death_B,M2M_Death_C,Hit_Knockback,Hit_Chest,Hit_Head,SW_HitRecieve,SW_HitRecieve_2').split(',');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 640, height: 480 } });
await p.goto('http://127.0.0.1:8766/preview2.html'); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
await ev(() => { __game.fillEnemies(); __game.setGear('none', true); });
const rows = [];
for (const c of CLIPS) {
  const dur = await ev(() => 0);
  // player 5 m to the side, looking at the enemy side-on; enemy faces +x
  await ev(() => { __game.place(-50, -6); for (let i = 1; i < 5; i++) __game.moveEnemy(i, -200 - i * 5, 200); __game.moveEnemy(0, -53, 0, Math.PI / 2); __game.look(0, 0.1); __game.advance(0.2); });
  await ev((c) => __game.playOnEnemy(0, c, 0, 1), c);
  const shots = [];
  for (let k = 0; k < 6; k++) {
    await ev(() => { __game.moveEnemy(0, -53, 0, Math.PI / 2); for (let i = 1; i < 5; i++) __game.moveEnemy(i, -200 - i * 5, 200); });
    await p.waitForTimeout(80);
    shots.push(await p.screenshot({ clip: { x: 340, y: 80, width: 300, height: 400 } }));
    await ev((s) => __game.advance(s), +(process.env.STEP || 0.45));
  }
  const row = await sharp({ create: { width: 1800, height: 400, channels: 3, background: '#fff' } }).composite(shots.map((s, i) => ({ input: s, left: i * 300, top: 0 }))).png().toBuffer();
  rows.push(row);
  console.log(c, 'done');
}
for (const [i, r] of rows.entries()) await sharp(r).toFile(`sheet/row${i}.png`);
// rows are joined with PIL (tools: sheet/row*.png)
await b.close();
