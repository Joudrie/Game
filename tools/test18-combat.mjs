// v13 combat: grapple strike on enemies, ground pound, dismemberment, combo freeze self-heal.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
const E = () => ev(() => __game.enemies().filter((e) => e.state !== 'dead'));
await ev(() => { __game.setClass('force'); __game.setGear('lit', true); __game.fillEnemies(); __game.advance(1.5); });

// 1. grapple onto an enemy 15 m ahead
await ev(() => { __game.place(0, 0); __game.look(0, 0.05); for (let i = 1; i < 5; i++) __game.moveEnemy(i, 60 + i * 3, 60); __game.moveEnemy(0, 0, 15, Math.PI); __game.advance(0.3); });
const id0 = (await E())[0].id;
await ev(() => __game.grapplePress());
let st = [];
for (let i = 0; i < 20; i++) { await ev(() => __game.advance(0.05)); const en = (await ev(() => __game.enemies())).find((e) => e.id === id0); st.push(`${await ev(() => __game.grapple)}/${en.state}`); if (en.state === 'knock' || en.state === 'dead') break; }
console.log('grapple on enemy:', [...new Set(st)].join(' → '));
await p.screenshot({ path: `${OUT}/v18-grapple.png` });
await ev(() => __game.advance(2.5));
console.log('after strike:', JSON.stringify((await ev(() => __game.enemies())).find((e) => e.id === id0)), 'mode', await ev(() => __game.mode));

// 2. ground pound into a group
await ev(() => { __game.fillEnemies(); __game.place(0, 0); __game.look(0, 0.3); for (let i = 0; i < 3; i++) __game.moveEnemy(i, -2 + i * 2, 3); __game.advance(0.5); });
await ev(() => { __game.setMode('air', 6); __game.setJumps(2); __game.attackPress(); __game.attackRelease(); });
console.log('pound started', await ev(() => __game.pound));
await ev(() => __game.advance(0.25));
await p.screenshot({ path: `${OUT}/v18-pound.png` });
await ev(() => __game.advance(3));
console.log('after pound:', JSON.stringify(await ev(() => __game.deathCounts)), 'pieces', await ev(() => __game.pieces), 'mode', await ev(() => __game.mode));
await p.screenshot({ path: `${OUT}/v18-pound2.png` });

// 3. dismemberment: headshot with the pistol, saber kill
await ev(() => { __game.fillEnemies(); __game.setGear('pistol', true); __game.place(0, 0); __game.look(0, 0); __game.moveEnemy(0, 0.5, 8, Math.PI); __game.advance(0.5); });
await ev(() => __game.shootAt(0, 'head')); await ev(() => __game.advance(0.4));
console.log('headshot pieces', await ev(() => __game.pieces));
await p.screenshot({ path: `${OUT}/v18-headshot.png` });
await ev(() => __game.advance(2));
await p.screenshot({ path: `${OUT}/v18-headshot2.png` });

// 4. freeze self-heal: lose the swing's finish callback on purpose, keep walking
await ev(() => { __game.setGear('lit', true); __game.place(40, -40); __game.advance(1.5); __game.attackPress(); __game.attackRelease(); __game.dropCallbacks(); });
await p.keyboard.down('KeyW');
for (let i = 0; i < 6; i++) await ev(() => __game.advance(0.4));
await p.keyboard.up('KeyW');
console.log('after lost callback: atk', await ev(() => __game.atk), 'overrides', JSON.stringify(await ev(() => __game.overrides)));
const r = await ev(() => __game.lastReport);
console.log('report', r ? r.kind + ' ' + r.detail : null);
await b.close();
