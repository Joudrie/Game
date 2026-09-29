import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('http://localhost:8766/preview2.html');
await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const cal = await p.evaluate(() => window.__cal);
console.log('angles', JSON.stringify(Object.fromEntries(Object.entries(cal).filter(([k]) => /Strafe|Back|Run_L|Run_R|Walk_Loop|Jog_Fwd/.test(k)))));
const st = () => p.evaluate(() => JSON.stringify({ g: __game.gait, s: +__game.speed.toFixed(1), strafe: __game.strafe, pose: Object.fromEntries(Object.entries(__game.pose).map(([k, v]) => [k, +v.toFixed(2)])), r: __game.lastReport && __game.lastReport.kind }));
for (const [gear, aimFn] of [['pistol', 'setAim'], ['lit', 'blockPress']]) {
  await p.evaluate(([g, f]) => { __game.setGear(g, true); f === 'setAim' ? __game.setAim(true) : __game.blockPress(); }, [gear, aimFn]);
  await p.waitForTimeout(300);
  for (const k of ['KeyA', 'KeyD', 'KeyS', 'KeyW']) {
    await p.keyboard.down(k); await p.waitForTimeout(900);
    console.log(gear, k, await st()); await p.screenshot({ path: `/home/user/game/v10-${gear}-${k}.png` });
    await p.keyboard.up(k); await p.waitForTimeout(300);
  }
  await p.keyboard.press('Space'); await p.waitForTimeout(200); console.log(gear, 'jump while guarding?', await p.evaluate(() => __game.mode)); await p.waitForTimeout(2500);
  await p.evaluate(([g, f]) => { f === 'setAim' ? __game.setAim(false) : __game.blockRelease(); }, [gear, aimFn]);
  await p.waitForTimeout(400);
}
await b.close();
