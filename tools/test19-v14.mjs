// v14: swings end on input, fists combo, aim + fire, pistol aim pitch, draw/holster, block sparks, jetpack, grapple, bodies.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
const want = (k) => !ONLY.length || ONLY.includes(k);
const counts = () => ev(() => JSON.stringify(__game.deathCounts));

if (want('combo')) {
  // saber: one swing, then push the stick: the swing ends at its cancel point and you walk
  await ev(() => { __game.setClass('force'); __game.setGear('lit', true); __game.place(40, -40); __game.advance(1.5); __game.attackPress(); __game.attackRelease(); __game.advance(0.1); });
  await p.keyboard.down('KeyW');
  const seq = [];
  for (let i = 0; i < 10; i++) { await ev(() => __game.advance(0.1)); seq.push(`${await ev(() => __game.atk)}@${(await ev(() => __game.speed)).toFixed(1)}`); }
  await p.keyboard.up('KeyW');
  console.log('swing then move:', seq.join(' '));
  // fists: gear none, four hits on an enemy in front
  await ev(() => { __game.setGear('none', true); __game.fillEnemies(); __game.place(0, 0); __game.look(0, 0.2); __game.advance(1.5); });
  const hp = [];
  for (let i = 0; i < 4; i++) { await ev(() => { const q = __game.pos; __game.moveEnemy(0, q[0], q[2] + 1.3, Math.PI); __game.attackPress(); __game.attackRelease(); __game.advance(0.45); }); hp.push(Math.round((await ev(() => __game.enemies().filter((e) => e.state !== 'dead')[0])).hp)); }
  console.log('fists hp after each hit:', hp.join(' '), 'counts', await counts());
}
if (want('pistol')) {
  await ev(() => { __game.setClass('light'); __game.setGear('pistol', true); __game.place(40, -40); __game.look(Math.PI, 0.25); __game.advance(1.5); });
  await p.screenshot({ path: `${OUT}/v19-pistol-idle.png` });
  await p.keyboard.down('KeyW'); await ev(() => __game.advance(1.2)); await p.waitForTimeout(100); await p.screenshot({ path: `${OUT}/v19-pistol-run.png` }); await p.keyboard.up('KeyW'); await ev(() => __game.advance(1));
  for (const [nm, pitch] of [['level', 0.1], ['up', -0.45], ['down', 1.0]]) { await ev((pt) => { __game.look(Math.PI, pt); __game.setAim(true); __game.advance(0.5); }, pitch); await p.waitForTimeout(80); await p.screenshot({ path: `${OUT}/v19-aim-${nm}.png` }); }
  await ev(() => { __game.setAim(false); __game.look(Math.PI, 0.25); __game.advance(1); });
  // aim with the right button, fire with the left, as a real mouse would (pointer lock faked)
  const fired = await ev(() => {
    const c = document.querySelector('canvas'); Object.defineProperty(document, 'pointerLockElement', { get: () => c, configurable: true });
    c.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); __game.advance(0.3);
    c.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true })); __game.advance(0.05);
    const ev = __game.events.filter((x) => / fire /.test(x + ' ')).length;
    c.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true })); c.dispatchEvent(new MouseEvent('mouseup', { button: 2, bubbles: true }));
    return { fired: ev, aim: __game.strafe };
  });
  console.log('aim + fire with the mouse:', JSON.stringify(fired));
  await ev(() => { __game.firePistol(); __game.advance(0.15); }); await p.waitForTimeout(80);
  await p.screenshot({ path: `${OUT}/v19-hipfire.png` });
}
const r = await ev(() => __game.lastReport);
console.log('report', r ? r.kind + ' ' + r.detail : null);
await b.close();
