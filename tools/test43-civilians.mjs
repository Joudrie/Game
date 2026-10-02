// v35: civilians. They walk the streets, run from gunfire, blasts and a lit saber, can be shot, cut, blown up and
// ragdolled like soldiers, are hit by stray fire, can't be looted, and stay out of missions.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
const adv = (s) => ev((s) => __game.advance(s), s);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const civ = (id) => ev((id) => __game.civilians().find((c) => c.id === id) || null, id);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
// a quiet spot on a road, away from buildings, with the soldiers sent far off
const R = await ev(() => { const cells = __game.roadCells.map((c) => c.split(',').map(Number)).filter(([i, j]) => Math.hypot(i, j) > 4); const [i, j] = cells[Math.floor(cells.length / 2)]; return [i * 10, j * 10]; });
const calm = () => ev(([x, z]) => { const g = __game; g.setEnemyCount(0); for (const e of g.enemies()) {} g.place(x, z); g.look(0, 0.2); g.selectSlot(0, true); g.setGear('none'); g.advance(1); }, R);
await ev(() => { __game.setEnemyCount(0); __game.advance(0.2); });
await calm();
check((await ev(() => __game.civilians().length)) === 0, 'headless runs start without civilians (older suites see only soldiers)');

// the Tests panel turns them on; they turn up on the streets
await ev(() => { __game.openMoves(); document.querySelector('[data-tab="tests"]').click(); });
await p.click('[data-ccount="8"]'); await ev(() => __game.closeMoves()); await adv(8);
let cs = await ev(() => __game.civilians());
const onRoad = await ev((cs) => cs.filter((c) => __game.onRoad(c.pos[0], c.pos[2], 2)).length, cs);
check(cs.length === 8, `Tests → Civilians: 8 people turn up (${cs.length})`);
check(onRoad >= 6, `they turn up on the streets (${onRoad} of ${cs.length} on or by a road)`);
check((await ev((ids) => __game.enemies().filter((e) => ids.includes(e.id)).length, cs.map((c) => c.id))) === 0, 'the soldier list (and count) leaves them out');
// variety
await ev(() => __game.setCivCount(0)); await adv(0.2);
const ids = await ev(([x, z]) => { const o = []; for (let i = 0; i < 14; i++) o.push(__game.spawnCivilian(x - 6 + i, z + 30)); __game.setCivCount(14); return o; }, R);
cs = await ev(() => __game.civilians());
const kinds = new Set(cs.map((c) => c.kind)), hairs = new Set(cs.map((c) => c.hair));
check(kinds.size === 2 && hairs.size >= 4, `men and women, ${hairs.size} hairstyles (${[...hairs].join(' ')})`);
await ev(([x, z]) => { __game.setDebugCam([x, 1.7, z + 25], [x, 0.9, z + 30]); __game.advance(0.05); }, R); await p.screenshot({ path: `${OUT}/v35-civilians.png` }); await ev(() => __game.setDebugCam(null));
await ev(() => __game.setCivCount(0)); await adv(0.2);

// a calm one walks
const one = async (kind = 'm', dx = 0, dz = 8) => { await ev(() => __game.setCivCount(0)); await adv(0.1); return ev(([x, z, k]) => { const id = __game.spawnCivilian(x, z, k); __game.setCivCount(1); __game.advance(0.05); return id; }, [R[0] + dx, R[1] + dz, kind]); };
let id = await one('f'); let c0 = await civ(id); await adv(5); let c1 = await civ(id);
check(c1 && c1.cs !== 'flee' && dist(c0.pos, c1.pos) > 2.5, `a calm civilian walks (${c1 && dist(c0.pos, c1.pos).toFixed(1)} m in 5 s, ${c1 && c1.cs})`);
// gunfire: she runs away from it
id = await one('f', 0, 8); c0 = await civ(id);
await ev(() => { __game.selectSlot(1, true); __game.advance(1.5); }); await p.mouse.click(640, 300); await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.1); });
c1 = await civ(id); await adv(2.5); let c2 = await civ(id); const P = await ev(() => __game.pos);
check(c1 && ['flee', 'cower'].includes(c1.cs), `a gunshot frightens her (${c1 && c1.cs})`);
check(c2.cs === 'cower' || dist(c2.pos, P) > dist(c0.pos, P) + 4, `she runs from it (${dist(c0.pos, P).toFixed(1)} → ${dist(c2.pos, P).toFixed(1)} m) or cowers (${c2.cs})`);
// a lit saber right next to him
await calm(); id = await one('m', 0, 2.5);
await ev(() => { __game.setGear('lit'); __game.advance(1.2); }); c1 = await civ(id);
check(['flee', 'cower'].includes(c1.cs), `a lit saber next to him: he runs (${c1.cs})`);
// shot in the head: dead, and the feed says so
await calm(); id = await one('m', 0, 6);
await ev((id) => { __game.shootCiv(id, 'head'); __game.advance(1); }, id); c1 = await civ(id);
check(c1.state === 'dead' && (await ev(() => __game.civDeaths)) === 1, `shot in the head, he dies (${c1.state})`);
// an arm cut off: she lives and runs; a cut through the chest kills, with no red pieces
await calm(); id = await one('f', 0, 1.8);
await ev((id) => { __game.cutCiv(id, 'upperarm_l'); __game.advance(0.6); }, id); c1 = await civ(id);
check(c1.state !== 'dead' && c1.severed.includes('upperarm_l') && ['flee', 'cower'].includes(c1.cs), `arm cut off: she lives and runs (${c1.state}, ${c1.cs})`);
await ev((id) => { __game.cutCiv(id, 'chest'); __game.advance(1.5); }, id); c1 = await civ(id);
check(c1.state === 'dead' && c1.severed.length >= 2, `a cut through the chest kills her (${c1.severed.join(' ')})`);
check((await ev(() => __game.redPieces())) === 0, 'cut-off pieces keep her clothes and skin (no red pieces)');
await ev(([x, z]) => { __game.setDebugCam([x + 2.5, 1.6, z + 3.5], [x, 0.5, z + 1.8]); __game.advance(0.05); }, R); await p.screenshot({ path: `${OUT}/v35-civ-cut.png` }); await ev(() => __game.setDebugCam(null));
// a grenade blows him apart
await calm(); id = await one('m', 0, 7);
const pc0 = await ev(() => __game.pieces); await ev((id) => { const c = __game.civilians().find((x) => x.id === id); __game.explodeAt(c.pos[0], c.pos[1] + 0.3, c.pos[2]); __game.advance(1.5); }, id); c1 = await civ(id);
check(c1.state === 'dead' && (await ev(() => __game.pieces)) > pc0, `a grenade kills and dismembers him (${c1.severed.join(' ') || 'none'})`);
// a body you can't loot
await ev((id) => { const c = __game.civilians().find((x) => x.id === id); __game.place(c.pos[0] + 0.6, c.pos[2]); __game.advance(0.5); }, id);
check((await ev(() => __game.lootTarget)) === null, 'a civilian\'s body has nothing to loot');
// stray fire: a soldier's round passing through her hits her
await calm(); id = await one('f', 0, 10); c0 = await civ(id);
const st = await ev(([a]) => __game.strayAt(a[0], 1.25, a[2] - 5, a[0], 1.25, a[2] + 5), [c0.pos]);
check(st === id, `a stray round on the line hits her (${st})`);
// missions have none; they come back afterwards
await ev(() => __game.setCivCount(6)); await adv(3);
await ev(() => { document.getElementById('missionsbtn').click(); document.querySelector('[data-mission="m1"]').click(); }); await adv(4);
check((await ev(() => __game.civilians().filter((c) => c.state !== 'dead').length)) === 0, 'no civilians during a mission');
await ev(() => { __game.endMission('quit'); document.getElementById('mdone').hidden = true; }); await adv(4);
check((await ev(() => __game.civilians().filter((c) => c.state !== 'dead').length)) > 0, 'they come back after it');
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
