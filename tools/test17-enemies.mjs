// Enemies: spawn, engage, zone deaths, force push + wall impact, grenade, corpses, no reports.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
await p.waitForTimeout(4000);
let en = await ev(() => __game.enemies());
console.log('spawned', en.length, en.map(e => e.state + ':' + e.clip).join(' '));
await p.screenshot({ path: `${OUT}/v17-engage.png` });
// zone rules via direct damage
const alive = async () => (await ev(() => __game.enemies())).filter(e => e.state !== 'dead');
await ev(() => __game.damageEnemy(0, 100, 'head', 'bullet'));
await ev(() => { __game.damageEnemy(0, 26, 'legs', 'bullet'); __game.damageEnemy(0, 26, 'legs', 'bullet'); __game.damageEnemy(0, 26, 'legs', 'bullet'); __game.damageEnemy(0, 26, 'legs', 'bullet'); });
await ev(() => { __game.damageEnemy(0, 26, 'legs', 'bullet'); __game.damageEnemy(0, 34, 'torso', 'bullet'); __game.damageEnemy(0, 34, 'torso', 'bullet'); __game.damageEnemy(0, 26, 'legs', 'bullet'); }); // legs 52/120, final in legs -> torso
await ev(() => { __game.damageEnemy(0, 34, 'torso', 'bullet'); __game.damageEnemy(0, 34, 'torso', 'bullet'); __game.damageEnemy(0, 34, 'torso', 'bullet'); });
console.log('deathCounts after zone kills', JSON.stringify(await ev(() => __game.deathCounts)), 'feed', JSON.stringify(await ev(() => __game.killFeed)));
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/v17-deaths.png` });
// real pistol shots through the hit-zone rays
await ev(() => { __game.setGear('pistol', true); __game.place(0, 0); }); await p.waitForTimeout(2500);
const plan = [['head'], ['legs','legs','legs','legs'], ['torso','torso','torso'], ['legs','torso','torso','legs','legs']];
for (const seq of plan) {
  await ev(() => { __game.fillEnemies(); __game.place(0, 0); __game.look(0, 0); __game.moveEnemy(0, 0.5, 10); }); await p.waitForTimeout(600);
  const got = [];
  for (const z of seq) { got.push(await ev((z) => __game.shootAt(0, z), z)); await p.waitForTimeout(60); }
  console.log('shots', seq.join(','), '→ hit', got.join(','), '| counts', JSON.stringify(await ev(() => __game.deathCounts)));
}
await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/v17-pistol.png` });
// force push: open ground first, then into a wall
await ev(() => __game.fillEnemies());
await ev(() => { __game.setGear('none', true); __game.setClass('force'); __game.place(0, 0); __game.look(0, 0.1); __game.moveEnemy(0, 0, 5); });
await ev(() => __game.advance(0.3)); await ev(() => __game.forcePush()); await ev(() => __game.advance(0.3));
console.log('pushed (open):', JSON.stringify((await ev(() => __game.enemies())).filter(e => e.state === 'knock' || e.state === 'getup').map(e => e.state + ' ' + e.pos)));
await ev(() => __game.advance(3.5));
// a lethal push in the open: soften one up, push, it dies when it lands
await ev(() => { __game.fillEnemies(); __game.place(0, 0); __game.look(0, 0.1); __game.moveEnemy(0, 0, 4); __game.damageEnemy(0, __game.enemies().filter((e) => e.state !== 'dead')[0].hp - 10, 'torso', 'bullet'); __game.moveEnemy(0, 0, 4); __game.advance(1); });
await ev(() => { __game.forcePush(); __game.advance(3); });
console.log('lethal push →', JSON.stringify(await ev(() => __game.deathCounts)), (await ev(() => __game.killFeed))[0]);
const blocks = await ev(() => __game.blocks);
const wall = blocks.filter(b => b.max[1] > 4 && b.max[0] - b.min[0] > 4).sort((a, b) => Math.hypot(a.min[0], a.min[2]) - Math.hypot(b.min[0], b.min[2]))[0];
const cx = (wall.min[0] + wall.max[0]) / 2, fz = wall.min[2];
await ev(() => __game.fillEnemies());
const before = JSON.stringify(await ev(() => __game.deathCounts));
await ev(({ cx, fz }) => { __game.place(cx, fz - 10); __game.look(0, 0.1); __game.moveEnemy(0, cx, fz - 5); }, { cx, fz });
await ev(() => __game.advance(1)); await ev(() => { __game.forcePush(); __game.advance(0.25); });
await p.screenshot({ path: `${OUT}/v17-wallpush.png` });
await ev(() => __game.advance(1.5)); await p.waitForTimeout(300);
console.log('wall push', before, '→', JSON.stringify(await ev(() => __game.deathCounts)), (await ev(() => __game.killFeed))[0]);
await p.screenshot({ path: `${OUT}/v17-wall.png` });
// grenade into a group
await ev(() => __game.fillEnemies());
await ev(() => { __game.place(0, 0); __game.look(0, 0); for (let i = 0; i < 3; i++) __game.moveEnemy(i, -1.5 + i * 1.5, 13); });
await p.waitForTimeout(500);
const b4 = JSON.stringify(await ev(() => __game.deathCounts));
await ev(() => { __game.advance(0.5); __game.throwGrenade(); __game.advance(0.4); });
await p.screenshot({ path: `${OUT}/v17-grenade.png` });
await ev(() => __game.advance(3)); await p.waitForTimeout(300);
console.log('grenade', b4, '→', JSON.stringify(await ev(() => __game.deathCounts)));
await p.screenshot({ path: `${OUT}/v17-grenade2.png` });
en = await ev(() => __game.enemies());
console.log('now', en.length, 'total;', en.filter(e => e.state === 'dead').length, 'corpses;', en.filter(e => e.state !== 'dead').length, 'alive');
console.log('report', await ev(() => __game.lastReport && (__game.lastReport.kind + ' ' + (__game.lastReport.detail || ''))));
await b.close();
