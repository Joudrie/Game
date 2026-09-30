// pistol: 12 rounds, auto reload on empty drops a magazine, tactical reload keeps it, reserve from inventory, icons
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
console.log('icons rendered:', await ev(() => __game.thumbs), 'img slots:', await ev(() => document.querySelectorAll('#hotbar img').length));
await ev(() => { __game.selectSlot(1, true); __game.place(40, -40); __game.look(Math.PI * 0.6, 0.35); __game.advance(1.5); __game.ammo.mag = 12; });
const st = () => ev(() => JSON.stringify({ mag: __game.ammo.mag, reload: __game.reload, mags: __game.mags, out: __game.magOut, hud: document.getElementById('ammo').textContent }));
for (let i = 0; i < 12; i++) await ev(() => { __game.firePistol(); __game.advance(0.2); });
console.log('after 12 shots:', await st());
await p.waitForTimeout(400); await ev(() => __game.advance(0.25));
console.log('auto reload started:', await st());
await ev(() => __game.advance(0.25)); await p.waitForTimeout(60); await p.screenshot({ path: 'reload-mid.png' });
await ev(() => __game.advance(1.2)); await p.waitForTimeout(60);
console.log('after empty reload:', await st());
await p.screenshot({ path: 'reload-done.png' });
// tactical reload keeps the magazine
await ev(() => { for (let i = 0; i < 5; i++) { __game.firePistol(); __game.advance(0.2); } __game.startReload(); __game.advance(1.3); });
console.log('after tactical reload:', await st());
// reserve from the inventory
await ev(() => { __game.testCfg.infiniteAmmo = false; for (const arr of [__game.inv.hot, __game.inv.bag]) for (let i = 0; i < arr.length; i++) if (arr[i] && arr[i].id === 'ammo') arr[i] = null; __game.addItem('ammo', 5); __game.ammo.mag = 0; });
await ev(() => { __game.startReload(); __game.advance(1.5); });
console.log('reserve 5 → mag', await ev(() => __game.ammo.mag), 'left', await ev(() => __game.countItem('ammo')));
await ev(() => { __game.ammo.mag = 0; __game.firePistol(); __game.advance(0.2); });
console.log('no reserve:', await st());
console.log('report', await ev(() => __game.lastReport && __game.lastReport.kind));
await b.close();
