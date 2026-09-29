// v9 batch: slide momentum, infinite jumps, air block, air→slide, crouch blend, 5-hit flow, saber clipping sweep, menu tabs.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f) => p.evaluate(f);
await ev(() => { __game.setClass('force'); __game.setGear('none', true); });
// slide from jog vs sprint
await p.keyboard.down('KeyW'); await p.waitForTimeout(1500); await p.keyboard.press('KeyC'); await p.waitForTimeout(100);
console.log('slide from jog', JSON.stringify(await ev(() => __game.slide)));
await p.waitForTimeout(2500); await p.keyboard.down('ShiftLeft'); await p.waitForTimeout(2500); await p.keyboard.press('KeyC'); await p.waitForTimeout(100);
console.log('slide from sprint', JSON.stringify(await ev(() => __game.slide)));
await p.waitForTimeout(2500);
// jump then slide in the air
await p.keyboard.press('Space'); await p.waitForTimeout(150); await p.keyboard.press('KeyC');
let landedIn = null; for (let i = 0; i < 30 && !landedIn; i++) { await p.waitForTimeout(100); const m = await ev(() => __game.mode); if (m === 'slide') landedIn = m; }
console.log('jump → slide lands in', landedIn, JSON.stringify(await ev(() => __game.slide)));
await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW'); await p.waitForTimeout(2500);
// infinite jumps
for (let i = 0; i < 5; i++) { await p.keyboard.press('Space'); await p.waitForTimeout(220); }
console.log('jumps after 5 taps', await ev(() => __game.jumps), 'mode', await ev(() => __game.mode));
await p.screenshot({ path: `${OUT}/v13-airjumps.png` });
await p.waitForTimeout(4000);
// block in the air with sabers lit
await ev(() => __game.setGear('lit', true)); await p.waitForTimeout(300);
await p.keyboard.press('Space'); await p.waitForTimeout(150); await ev(() => __game.blockPress()); await p.waitForTimeout(250);
console.log('air block', JSON.stringify(await ev(() => ({ mode: __game.mode, blocking: __game.blocking, guard: +__game.guardBlend.toFixed(2) }))));
await p.screenshot({ path: `${OUT}/v13-airblock.png` });
await ev(() => __game.blockRelease()); await p.waitForTimeout(2500);
// crouch blend (no gear so crouch is allowed)
await ev(() => __game.setGear('none', true)); await p.waitForTimeout(300);
await p.keyboard.press('KeyC'); await p.waitForTimeout(90); const cb1 = await ev(() => __game.crouchBlend); await p.waitForTimeout(500); const cb2 = await ev(() => __game.crouchBlend);
console.log('crouch blend after ~0.1s', cb1.toFixed(2), 'after ~0.6s', cb2.toFixed(2));
await p.keyboard.press('KeyC'); await p.waitForTimeout(600);
// combo flow: tap repeatedly, record hit sequence
await ev(() => __game.setGear('lit', true)); await p.waitForTimeout(300);
const seq = []; let last = null;
for (let i = 0; i < 40; i++) { await ev(() => { __game.attackPress(); __game.attackRelease(); }); await p.waitForTimeout(120); const a = await ev(() => __game.atk); if (a !== last && a !== null) seq.push(a + 1); last = a; }
console.log('hit sequence from repeated taps', seq.join(' → '));
await p.waitForTimeout(3000);
// saber clipping sweep (dual)
const res = await ev(() => __game.sweepSaberClipping());
console.log('clipping:', res.cutting.length, 'of', res.checked, 'cut; top:', JSON.stringify(res.cutting.slice(0, 6)));
{ const fs = await import('fs'); fs.writeFileSync(`${OUT}/saber-clipping.json`, JSON.stringify(res, null, 1)); }
await b.close();
// phone: menu tabs
const b2 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const m = await b2.newPage({ viewport: { width: 402, height: 812 }, hasTouch: true, isMobile: true });
m.on('pageerror', e => console.log('m pageerror:', e.message));
await m.goto(URL); await m.waitForFunction(() => window.__game, null, { timeout: 90000 });
await m.tap('#movesbtn'); await m.waitForTimeout(600); await m.screenshot({ path: `${OUT}/v13-menu-setup.png` });
await m.tap('[data-tab="tests"]'); await m.waitForTimeout(300); await m.screenshot({ path: `${OUT}/v13-menu-tests.png` });
await m.tap('#movesexpand'); await m.tap('[data-tab="moves"]'); await m.waitForTimeout(300); await m.screenshot({ path: `${OUT}/v13-menu-moves-tall.png` });
await b2.close();
