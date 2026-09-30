// looting: prompt near a body, kneel + rummage, items appear, cancel by moving, looted bodies don't prompt again
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1000, height: 600 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
await ev(() => { __game.setGear('lit', true); __game.fillEnemies(); __game.place(40, -40); for (let i = 1; i < 5; i++) __game.moveEnemy(i, 120 + i * 3, 120); __game.moveEnemy(0, 40, -38.6, Math.PI); __game.damageEnemy(0, 999, 'torso', 'bullet'); __game.look(Math.PI * 0.9, 0.3); __game.advance(3); });
console.log('prompt near body:', await ev(() => ({ target: __game.lootTarget, shown: !document.getElementById('lootprompt').hidden })));
await ev(() => { __game.startLoot(); __game.advance(1.2); });
console.log('mid-loot:', JSON.stringify(await ev(() => ({ l: __game.looting, lit: __game.gear, items: [...document.querySelectorAll('#lootitems li')].map((x) => x.textContent) }))));
await p.waitForTimeout(80); await p.screenshot({ path: 'loot-mid.png' });
await ev(() => __game.advance(1.3));
console.log('done:', JSON.stringify(await ev(() => ({ l: __game.looting, log: __game.lootLog.map((x) => x.name + ' ' + x.qty), items: [...document.querySelectorAll('#lootitems li')].map((x) => x.textContent), title: document.querySelector('#lootlist b').textContent }))));
await p.waitForTimeout(80); await p.screenshot({ path: 'loot-done.png' });
await ev(() => __game.advance(0.5));
console.log('prompt again on the same body:', await ev(() => __game.lootTarget));
// second body: start, then move away to cancel
await ev(() => { __game.moveEnemy(0, 40, -38.6, Math.PI); __game.damageEnemy(0, 999, 'torso', 'bullet'); __game.advance(3); __game.startLoot(); __game.advance(0.3); });
await ev(() => { __game.setKey('KeyW', true); __game.advance(0.3); __game.setKey('KeyW', false); });
console.log('cancel by moving:', JSON.stringify(await ev(() => ({ l: __game.looting, speed: +__game.speed.toFixed(1), list: !document.getElementById('lootlist').hidden }))));
console.log('report', await ev(() => __game.lastReport && __game.lastReport.kind));
await b.close();
