// Dual sabers held in fists through every kind of animation; freeze/stuck detection.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 402, height: 812 }, hasTouch: true, isMobile: true });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const st = async (label) => console.log(label, JSON.stringify(await p.evaluate(() => ({ gear: __game.gear, armed: __game.armed, fingerOff: __game.fingers, mode: __game.mode, g: __game.gait, r: __game.lastReport && __game.lastReport.kind }))));
await p.waitForTimeout(800); await st('start'); await p.screenshot({ path: `${OUT}/v12-idle.png` });
await p.evaluate(() => __game.setClass('force'));
await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await p.waitForTimeout(1500); await st('sprint'); await p.screenshot({ path: `${OUT}/v12-sprint.png` });
await p.keyboard.press('KeyC'); await p.waitForTimeout(300); await st('slide'); await p.screenshot({ path: `${OUT}/v12-slide.png` });
await p.waitForTimeout(1200); await p.keyboard.press('Space'); await p.waitForTimeout(250); await p.keyboard.press('Space'); await p.waitForTimeout(250); await st('double jump'); await p.screenshot({ path: `${OUT}/v12-djump.png` });
await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW'); await p.waitForTimeout(2500);
await p.tap('#movesbtn'); await p.waitForTimeout(300);
await p.evaluate(() => document.querySelector('[data-lib="M2M_Levitate_Idle"]').click()); await p.waitForTimeout(600); await st('preview levitate'); await p.screenshot({ path: `${OUT}/v12-preview.png` });
await p.evaluate(() => document.getElementById('movesclose').click()); await p.waitForTimeout(400);
// stuck: push the stick while the character ignores input
await p.evaluate(() => __game.forceStuck()); await p.keyboard.down('KeyW'); await p.waitForTimeout(1200); await p.keyboard.up('KeyW');
const r = await p.evaluate(() => __game.lastReport);
console.log('stuck report:', r && r.kind, '|', r && r.detail, '| input', r && JSON.stringify(r.input), '| events tail', r && JSON.stringify(r.events.slice(-4)));
await b.close();
