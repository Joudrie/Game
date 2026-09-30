// v20 The Second: the player is the owner's character (rigged Hunyuan3D model), soldiers keep the Superhero body.
// Screenshots idle / run / dual-saber swing / pistol aim / back view, and fails on page errors or error reports.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: Number(process.env.W) ? { width: +process.env.W, height: +process.env.H } : { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0;
const who = await ev(() => __game.character());
console.log('character mesh:', who);
if (who !== 'TheSecond') { console.log('FAIL: player is not The Second'); fail++; }
await ev(() => { __game.setGear('none', true); __game.place(0, 0); __game.look(Math.PI, 0.15); __game.advance(1.5); });
await p.screenshot({ path: `${OUT}/v20-idle-front.png` });
await ev(() => { __game.look(0, 0.15); __game.advance(0.5); });
await p.screenshot({ path: `${OUT}/v20-idle-back.png` });
await ev(() => { __game.setKey('KeyW', true); __game.advance(1.2); });
await p.screenshot({ path: `${OUT}/v20-run.png` });
await ev(() => { __game.setKey('KeyW', false); __game.setGear('lit', true); __game.look(2.4, 0.15); __game.advance(1.2); });
await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.2); });
await p.screenshot({ path: `${OUT}/v20-saber-hit1.png` });
for (let i = 0; i < 6; i++) await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.08); });
await p.screenshot({ path: `${OUT}/v20-saber-hit2.png` });
await ev(() => { __game.advance(2.5); __game.setGear('pistol', true); __game.look(2.4, 0.1); __game.advance(1); __game.setAim(true); __game.advance(0.6); });
await p.screenshot({ path: `${OUT}/v20-pistol-aim.png` });
await ev(() => { __game.setAim(false); __game.fillEnemies(); __game.moveEnemy(0, 1.5, 4, Math.PI); __game.look(Math.PI * 0.85, 0.15); __game.advance(1); });
await p.screenshot({ path: `${OUT}/v20-with-soldier.png` });
const rep = await ev(() => __game.lastReport);
if (rep && rep.kind !== 'freeze') { console.log('FAIL report:', JSON.stringify(rep).slice(0, 300)); fail++; }
if (errs.length) fail++;
console.log(fail ? `FAILED (${fail})` : 'PASS');
await b.close(); process.exit(fail ? 1 : 0);
