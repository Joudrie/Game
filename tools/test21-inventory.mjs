// inventory: hotbar render, scroll/keys select, loot fills the backpack, drag and tap moves, grenades from the slot
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
const hot = () => ev(() => __game.inv.hot.map((x) => x ? x.id + (x.qty > 1 ? 'x' + x.qty : '') : '-').join(' '));
console.log('hotbar', await hot(), '| slots drawn', await ev(() => document.querySelectorAll('#hotbar .slot').length), '| gear', await ev(() => __game.gear));
await p.mouse.move(640, 300);
const seen = [];
for (let i = 0; i < 5; i++) { await p.mouse.wheel(0, 100); await p.waitForTimeout(250); seen.push(await ev(() => __game.inv.active + ':' + __game.gear)); }
console.log('scroll through slots', seen.join(' '));
await p.keyboard.press('Digit2'); await p.waitForTimeout(200); console.log('key 2 →', await ev(() => __game.inv.active + ':' + __game.gear));
// loot into the backpack
await ev(() => { __game.addItem('credits', 40); __game.addItem('ammo', 12); __game.addItem('grenade', 7); });
console.log('after loot: hot', await hot(), '| bag', await ev(() => __game.inv.bag.filter(Boolean).map((x) => x.id + 'x' + x.qty).join(' ')));
// open the inventory, drag credits (bag 0) onto hotbar slot 4
await p.keyboard.press('KeyI'); await p.waitForTimeout(300);
const box = async (sel) => { const r = await p.locator(sel).boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2]; };
const [ax, ay] = await box('#inv .slot[data-where="bag"][data-i="0"]'), [bx, by] = await box('#inv .slot[data-where="hot"][data-i="3"]');
await p.mouse.move(ax, ay); await p.mouse.down(); await p.mouse.move(ax + 20, ay - 10, { steps: 3 }); await p.mouse.move(bx, by, { steps: 8 });
await p.screenshot({ path: 'inv-drag.png' });
await p.mouse.up(); await p.waitForTimeout(200);
console.log('after drag bag0 → hot3:', await hot());
// tap-to-move: saber (hot0) to bag slot 5
await p.click('#inv .slot[data-where="hot"][data-i="0"]'); await p.click('#inv .slot[data-where="bag"][data-i="5"]'); await p.waitForTimeout(200);
console.log('after tap hot0 → bag5:', await hot(), '| bag5', await ev(() => JSON.stringify(__game.inv.bag[5])));
await p.screenshot({ path: 'inv-open.png' });
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
// grenade slot: infinite off, attack throws and uses one
await ev(() => { __game.testCfg.infiniteNades = false; __game.selectSlot(2, true); __game.advance(0.8); });
const before = await ev(() => __game.countItem('grenade'));
await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.2); });
console.log('grenade slot attack:', before, '→', await ev(() => __game.countItem('grenade')), 'gear', await ev(() => __game.gear));
await p.screenshot({ path: 'inv-hotbar.png' });
console.log('report', await ev(() => __game.lastReport && __game.lastReport.kind));
await b.close();
