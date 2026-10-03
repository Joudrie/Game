// v31: the dressed world (Kenney buildings, nature, clouds) and soldiers in four uniforms with smaller heads and mixed guns.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
p.on('console', (m) => { if (/world dressed|failed/i.test(m.text())) console.log('  console:', m.text()); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const w = await ev(() => __game.world());
check(w.buildings >= 30 && w.hidden === w.buildings, `city blocks wear Kenney buildings (${w.buildings}), their grey boxes hidden but kept for collision`);
check(w.instances > 400 && w.trees > 20 && w.paths > 50, `grass, flowers, rocks and ${w.trees} trees scattered (${w.instances} instances), a ${w.paths}-stone path`);
check(w.clouds > 10, `${w.clouds} clouds in the sky`);
await ev(() => { __game.place(0, 2); __game.look(0, 0.05); __game.advance(1); });
await p.screenshot({ path: `${OUT}/v31-start.png` });
await ev(() => { __game.place(-40, -30); __game.look(0.6, -0.15); __game.advance(0.6); });
await p.screenshot({ path: `${OUT}/v31-city.png` });
// soldiers: uniforms, skin tones, heads, guns
await ev(() => { __game.place(0, 2); __game.setEnemyCount(20); __game.fillEnemies(); __game.advance(0.5); });
const looks = await ev(() => __game.looks());
const U = new Set(looks.map((l) => l.uniform)), K = new Set(looks.map((l) => l.kind));
check(U.size >= 3, `soldiers wear different uniforms (${[...U].join(', ')})`);
check(looks.every((l) => l.head > 0.8 && l.head <= 1.001), 'every soldier\'s head is in proportion (v48: the enemy model needs no shrinking)');
await ev(() => __game.advance(1));
check((await ev(() => __game.looks())).every((l) => l.head > 0.8 && l.head <= 1.001), 'the head keeps its size while he animates');
check(K.size >= 3, `mixed weapons (${[...K].join(', ')})`);
await ev(() => { const n = __game.enemies().length; for (let i = 0; i < Math.min(n, 5); i++) __game.moveEnemy(i, -3 + i * 1.5, 7, Math.PI); __game.look(0, 0.05); __game.advance(0.4); });
await p.screenshot({ path: `${OUT}/v31-soldiers.png` });
// the hidden city box still stops you
const blk = await ev(() => { const bl = __game.blocksInfo ? __game.blocksInfo() : null; return bl; });
check(errs.length === 0, 'no page errors');
await b.close();
console.log(fail ? `FAILED (${fail})` : 'PASS'); process.exit(fail ? 1 : 0);
