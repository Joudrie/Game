// v41 the disguise: a soldier's uniform puts his body on your skeleton; calm guards let you walk past, get suspicious
// if you stand in their face, see through it at once with a lit saber, and a loud shot blows it for everyone watching.
// Bumping a calm guard gets a line; bodies drop their uniform; taking it off brings your own look back.
// Screenshots: OUT/v41-disguise.png (in uniform) and v41-own.png.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html';
const OUT = process.env.OUT || '/tmp';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
await p.mouse.click(640, 300); await p.waitForTimeout(1500);

const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 25) && !__game.onRoad(x, z, 5)) return [Math.round(x), Math.round(z)]; } return null; });
// one calm guard at (dx, dz) from you facing you (yaw PI faces -z, toward you when he's at +z); the rest far away
const setup = (dx, dz, yaw = Math.PI) => ev(([x, z, dx, dz, yaw]) => { const g = __game; g.fillEnemies(); g.advance(0.1); const n = g.enemies().filter((e) => e.state !== 'dead').length;
  for (let i = 0; i < n; i++) { g.moveEnemy(i, x + (i ? 300 + i * 4 : dx), z + (i ? 300 : dz), yaw); g.setMind(i, 'patrol', 999); }
  g.place(x, z); g.look(0, 0.2); g.advance(0.05); g.voReset(); }, [...O, dx, dz, yaw]);
const mind = () => ev(() => __game.minds().filter((e) => e.state !== 'dead')[0]?.mind);
const said = () => ev(() => __game.voLog.map((l) => l.split(':')[0]));
await ev(([x, z]) => { __game.place(x, z); __game.selectSlot(0, true); __game.setGear('none'); __game.advance(1); }, O);

// wearing it: his body on your bones, yours hidden
await ev(() => __game.setDisguise(true)); await ev(() => __game.advance(0.3));
let parts = await ev(() => __game.disguiseParts());
check(parts.soldier > 0 && parts.own === 0, `in uniform: ${parts.soldier} soldier meshes shown, ${parts.own} of yours`);
await ev(([x, z]) => { __game.place(x, z); __game.look(Math.PI, 0.25); __game.advance(0.6); }, O);
await p.screenshot({ path: `${OUT}/v41-disguise.png` });

// a calm guard 8 m away, looking right at you: nothing
await setup(0, 8); await ev(() => { for (let t = 0; t < 40; t++) __game.advance(0.1); });
check((await mind()) === 'patrol', `in uniform, a guard 8 m away looking at you stays calm (${await mind()})`);
// the same without it: he spots you
await ev(() => __game.setDisguise(false)); await setup(0, 8); await ev(() => { for (let t = 0; t < 40; t++) __game.advance(0.1); });
const without = await mind();
check(without !== 'patrol', `without it, the same guard spots you (${without})`);
await ev(() => __game.setDisguise(true));

// standing in his face: "What unit are you?", then he sees through it
await setup(0, 2.5); await ev(() => { for (let t = 0; t < 140; t++) __game.advance(0.1); });
let s = await said();
check(s.includes('dsus') && (await mind()) !== 'patrol', `staring at him from 2.5 m: "What unit are you?", then he's onto you (${s.join(' ')})`);

// a lit saber: at once
await setup(0, 10); await ev(() => { __game.setGear('lit'); for (let t = 0; t < 25; t++) __game.advance(0.1); });
s = await said();
check((await mind()) !== 'patrol' && s.includes('jedi'), `a lit saber in view: "We got a Jedi!" (${s.join(' ')})`);
await ev(() => { __game.setGear('none'); __game.advance(1); });

// a loud shot in view: cover blown
await setup(0, 12); await ev(([x, z]) => { const g = __game; g.selectSlot(1, true); g.advance(1.5); g.voReset(); g.shootPoint(x + 6, 1, z + 30); g.advance(0.5); }, O);
s = await said();
check((await mind()) === 'combat' && s.includes('blown'), `a shot in front of a guard: "He's not one of us!" (${s.join(' ')})`);
await ev(() => { __game.selectSlot(0, true); __game.setGear('none'); __game.advance(1); });

// bumping into a calm guard
await setup(0, 1.4, 0); // his back to you
await p.keyboard.down('KeyW'); await ev(() => { for (let t = 0; t < 15; t++) __game.advance(0.1); }); await p.keyboard.up('KeyW');
s = await said();
check(s.includes('bump') && (await mind()) === 'patrol', `walking into a calm guard: "Watch it!", and he stays calm (${s.join(' ')})`);

// bodies drop uniforms
const rolls = await ev(() => { let n = 0; for (let k = 0; k < 60; k++) if (__game.lootRoll(0).includes('Soldier uniform')) n++; return n; });
check(rolls > 25 && rolls < 60, `a soldier's body has his uniform most of the time (${rolls} of 60)`);

// taking it off
await ev(() => __game.setDisguise(false)); parts = await ev(() => __game.disguiseParts());
check(parts.soldier === 0 && parts.own > 0 && !(await ev(() => __game.disguised)), `uniform off: your own look is back (${parts.own} meshes)`);
await ev(([x, z]) => { __game.place(x, z); __game.look(Math.PI, 0.25); __game.advance(0.6); }, O);
await p.screenshot({ path: `${OUT}/v41-own.png` });

// v43: changing out of sight. A guard fighting you from the far side of a building loses you when you put it on.
const wall = await ev(() => __game.blocks.filter((b) => b.max[1] - b.min[1] > 4 && b.max[0] - b.min[0] > 6 && b.max[0] - b.min[0] < 40 && Math.abs(b.min[0]) < 300 && Math.abs(b.min[2]) < 300)[0]);
const cz = (wall.min[2] + wall.max[2]) / 2, cx = (wall.min[0] + wall.max[0]) / 2;
await ev(([cx, cz, x0, x1]) => { const g = __game; g.setDisguise(false); g.fillEnemies(); g.advance(0.1); const n = g.enemies().filter((e) => e.state !== 'dead').length;
  for (let i = 0; i < n; i++) { g.moveEnemy(i, i ? cx + 300 + i * 4 : x1 + 3, i ? cz + 300 : cz, -Math.PI / 2); g.setMind(i, i ? 'patrol' : 'combat', 999); }
  g.place(x0 - 3, cz); g.advance(0.3); }, [cx, cz, wall.min[0], wall.max[0]]);
const before = await mind();
await ev(() => { __game.setDisguise(true); __game.advance(0.2); });
check(before === 'combat' && (await mind()) === 'patrol', `a guard fighting you from behind a building loses you when you change out of sight (${before} → ${await mind()})`);
// reinforcements while you're in uniform come in calm, even with a fight on
const fresh = await ev(([x, z]) => { const g = __game; g.place(x, z); g.setMind(1, 'combat'); g.damageEnemy(0, 999, 'head', 'bullet'); g.advance(0.2); g.fillEnemies(); g.advance(0.2); const m = g.minds().filter((e) => e.state !== 'dead'); return m[m.length - 1].mind; }, O);
check(fresh === 'patrol', `a reinforcement spawned while you're in uniform comes in calm (${fresh})`);
await ev(() => __game.setDisguise(false));
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
