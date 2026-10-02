// v34: roads and street props (Kenney City Kit Roads, CC0) laid between the buildings.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const w = await ev(() => __game.world());
check(w.roads >= 60 && w.props >= 30, `${w.roads} road tiles and ${w.props} street props`);
const cells = await ev(() => __game.roadCells);
const bad = await ev((cells) => { const B = __game.blocks; return cells.filter((c) => { const [i, j] = c.split(',').map(Number), x = i * 10, z = j * 10; return B.some((b) => b.max[1] > 2 && b.max[0] - b.min[0] > 0.7 && b.max[2] - b.min[2] > 0.7 && x + 5 > b.min[0] && x - 5 < b.max[0] && z + 5 > b.min[2] && z - 5 < b.max[2]); }); }, cells);
check(bad.length === 0, `no road runs into a building (${bad.join(' ') || 'none'})`);
check(!(await ev(() => __game.onRoad(0, 0, 3))), 'the start is clear');
check(!(await ev(() => __game.onRoad(0, 175, 0) || __game.onRoad(0, 150, 0))), 'the courtyard is clear');
// walk down a road, away from its end: the ground is flat and nothing stops you
const [i, j] = cells.find((c) => { const [a, b] = c.split(',').map(Number); return cells.includes(`${a},${b + 1}`) && cells.includes(`${a},${b + 2}`) && cells.includes(`${a},${b + 3}`); }).split(',').map(Number);
await ev(([x, z]) => { __game.place(x - 1.5, z); __game.look(0, 0.2); __game.advance(0.5); }, [i * 10, j * 10]);
const y0 = await ev(() => __game.y); await p.mouse.click(640, 300); await p.keyboard.down('KeyW'); await ev(() => __game.advance(3)); await p.keyboard.up('KeyW');
const pos = await ev(() => __game.pos);
check(Math.abs(pos[2] - j * 10) > 8 && Math.abs(pos[1] - y0) < 0.3, `walked ${Math.abs(pos[2] - j * 10).toFixed(1)} m down the street, level ground`);
await ev(() => { const P = __game.pos; __game.setDebugCam([P[0] + 6, 4, P[2] - 8], [P[0], 0.5, P[2] + 12]); __game.advance(0.05); }); await p.screenshot({ path: `${OUT}/v34-street.png` }); await ev(() => __game.setDebugCam(null));
// lamps and traffic lights are solid
const solidProps = await ev(() => __game.blocks.filter((b) => b.max[1] > 3.5 && b.max[0] - b.min[0] < 0.5).length);
check(solidProps >= 10, `${solidProps} lamp posts and traffic lights you bump into`);
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
