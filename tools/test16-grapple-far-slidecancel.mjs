// Long-range fast grapple to a far tower; slide cancel keeps momentum.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
const blocks = await ev(() => __game.blocks);
// try far towers until one has a clear line from the start, then grapple to it
const towers = blocks.filter((b) => b.max[1] >= 40).map((b) => ({ b, cx: (b.min[0] + b.max[0]) / 2, cz: (b.min[2] + b.max[2]) / 2 })).map((o) => ({ ...o, d: Math.hypot(o.cx, o.cz) }));
let result = null;
for (const far of towers) {
  const yaw = Math.atan2(far.cx, far.cz), pitch = -Math.min(0.44, Math.atan2(far.b.max[1] * 0.5, far.d));
  await ev(({ yaw, pitch }) => { __game.setGear('none', true); __game.place(0, 0); __game.look(yaw, pitch); }, { yaw, pitch }); await p.waitForTimeout(500);
  await ev(() => __game.grapplePress());
  let state = 'fire', peak = 0;
  for (let i = 0; i < 300 && state !== 'idle'; i++) { await p.waitForTimeout(100); state = await ev(() => __game.grapple); const v = await ev(() => __game.pos); peak = Math.max(peak, Math.hypot(v[0], v[2])); }
  const pos = await ev(() => __game.pos);
  const travelled = Math.hypot(pos[0], pos[2]);
  console.log(`tower ${far.d.toFixed(0)} m, top ${far.b.max[1]} m → travelled ${travelled.toFixed(0)} m, now at height ${pos[1]}`);
  if (travelled > 150) { result = far; break; }
}
console.log(result ? 'long grapple OK' : 'no clear tower found from the start');
await p.screenshot({ path: `${OUT}/v16-far.png` });
// slide cancel: sprint, slide, cancel with slide, read speed
await ev(() => { __game.setClass('force'); __game.place(0, 0); __game.look(Math.PI / 2, 0.2); }); await p.waitForTimeout(3000);
await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await p.waitForTimeout(2500);
await p.keyboard.press('KeyC'); await p.waitForTimeout(250); const inSlide = await ev(() => __game.speed);
await p.keyboard.press('KeyC'); await p.waitForTimeout(200); const afterCancel = await ev(() => ({ s: __game.speed, m: __game.mode }));
await p.waitForTimeout(500); const later = await ev(() => __game.speed);
console.log('slide speed', inSlide.toFixed(1), '→ cancel', JSON.stringify(afterCancel), '→ 0.5 s later', later.toFixed(1));
await p.keyboard.press('KeyC'); await p.waitForTimeout(150); console.log('chained slide mode', await ev(() => __game.mode), 'speed', (await ev(() => __game.speed)).toFixed(1));
await p.keyboard.press('Space'); await p.waitForTimeout(80); console.log('jump cancel', JSON.stringify(await ev(() => ({ m: __game.mode, s: +__game.speed.toFixed(1) }))));
await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW');
console.log('report', await ev(() => __game.lastReport && __game.lastReport.kind));
await b.close();
