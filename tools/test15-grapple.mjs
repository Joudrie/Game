// Buildings: collision, grapple onto a roof, fall off the edge.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
const st = () => ev(() => JSON.stringify({ pos: __game.pos, mode: __game.mode, grapple: __game.grapple, r: __game.lastReport && __game.lastReport.kind }));
console.log('blocks', (await ev(() => __game.blocks.length)), 'first three', JSON.stringify((await ev(() => __game.blocks)).slice(0, 3)));
await ev(() => { __game.setGear('none', true); __game.place(4, -7.5); __game.look(Math.PI, 0.2); }); await p.waitForTimeout(400);
// run into the 6 m block (x 0..8, z -16..-10)
await p.keyboard.down('KeyW'); await p.waitForTimeout(4000); await p.keyboard.up('KeyW'); await p.waitForTimeout(300);
console.log('after running into the wall (face at z = -10, radius 0.35)', await st()); await p.screenshot({ path: `${OUT}/v15-wall.png` });
// step back and grapple the top edge
await ev(() => { __game.place(4, -2); __game.look(Math.PI, -0.36); }); await p.waitForTimeout(500);
console.log('crosshair on target:', await ev(() => document.getElementById('xhair').classList.contains('on')));
await ev(() => __game.grapplePress()); await p.waitForTimeout(250); console.log('just fired', await st()); await p.screenshot({ path: `${OUT}/v15-fire.png` });
await p.waitForTimeout(350); console.log('pulling', await st()); await p.screenshot({ path: `${OUT}/v15-pull.png` });
let done = false; for (let i = 0; i < 40 && !done; i++) { await p.waitForTimeout(100); done = (await ev(() => __game.grapple)) === 'idle'; }
await p.waitForTimeout(600); console.log('arrived', await st()); await p.screenshot({ path: `${OUT}/v15-roof.png` });
// walk off the roof edge
await ev(() => __game.look(Math.PI, 0.3)); await p.keyboard.down('KeyW'); await p.waitForTimeout(6000); await p.keyboard.up('KeyW'); await p.waitForTimeout(1500);
console.log('walked off the roof', await st());
await b.close();
