// v39: no shortcuts through a juggernaut's field or a duellist's guard. The dash strike counts as one swing; the
// Force can't choke a juggernaut with his field up; a duellist with his guard up breaks a choke, holds his ground
// against a push and catches lightning on his blade (each costs him guard); once his guard breaks, the Force works.
// Also: the camera never goes under the hills or down into the grass.
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
await p.mouse.click(640, 300);
const O = [90, 90];
await ev(() => { const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === 'force'); if (bi >= 0) { const t = I.hot[3]; I.hot[3] = I.bag[bi]; I.bag[bi] = t; } __game.setEnemyCount(0); for (let i = 0; i < 12; i++) __game.moveEnemy(i, 400 + i * 4, 300); });
const spec = (id) => ev((id) => ({ e: __game.enemies().find((x) => x.id === id), s: __game.special().find((x) => x.id === id) }), id);
const spawn = (kind, d = 6) => ev(([x, z, k, d]) => { const g = __game; const alive = g.enemies().filter((e) => e.state !== 'dead'); alive.forEach((e, i) => { if (Math.hypot(e.pos[0] - x, e.pos[2] - z) < 40) g.moveEnemy(i, 300 + i * 6, 300); }); g.place(x, z); g.look(0, 0.12); const id = g.spawnSpecial(k, x, z + d); const i = g.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); g.setMind(i, 'patrol', 999); g.faceEnemy(i, Math.PI); g.advance(0.2); return id; }, [...O, kind, d]);

// the dash strike: one swing's worth, not a kill
for (const kind of ['jugg', 'duel']) {
  const id = await spawn(kind, 11);
  await ev(() => { __game.selectSlot(0, true); __game.setGear('lit'); __game.advance(1.2); __game.look(0, 0.12); });
  const d0 = await ev(() => __game.dashes);
  await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(0.9);
  await p.mouse.down(); await adv(0.05); await p.mouse.up(); await adv(0.8);
  await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW');
  const r = await spec(id);
  const dn = (await ev(() => __game.dashes)) - d0;
  check(dn === 1 && r.e.state !== 'dead', `a dash strike at a ${kind === 'jugg' ? 'juggernaut' : 'duellist'} doesn't kill him outright (${kind === 'jugg' ? 'field ' + r.s.jugg?.hits : 'guard ' + r.s.guard}, ${dn} dash)`);
}
// the Force: choke a juggernaut with his field up
let id = await spawn('jugg');
await ev(() => { __game.selectSlot(3); __game.advance(1.5); __game.look(0, 0.12); __game.advance(0.3); __game.chokeStart(); __game.advance(5); });
let r = await spec(id);
check(r.e.state !== 'dead', `choking a juggernaut with his field up: his field holds (${r.e.state})`);
// a duellist: choke, push, lightning each cost him guard; guard broken, the choke works
id = await spawn('duel');
const g0 = (await spec(id)).s.guard;
await ev(() => { __game.selectSlot(3); __game.advance(1.5); __game.look(0, 0.12); __game.advance(0.3); __game.chokeStart(); __game.advance(1); });
r = await spec(id); check(r.e.state !== 'dead' && r.e.state !== 'choked' && r.s.guard === g0 - 1, `a duellist breaks the choke (guard ${g0} → ${r.s.guard})`);
await ev(() => { __game.setClass('force'); __game.advance(1); __game.forcePush(); __game.advance(0.6); });
r = await spec(id); check(r.e.state !== 'dead' && r.e.state !== 'knock' && r.s.guard <= g0 - 2, `he holds his ground against a push (guard ${r.s.guard}, ${r.e.state})`);
await ev(() => { __game.setClass('light'); __game.advance(1.2); __game.look(0, 0.12); __game.zapStart(); __game.advance(1.6); __game.zapEnd(); __game.advance(0.1); });
r = await spec(id); check(r.e.state !== 'dead', `he catches lightning on his blade (guard ${r.s.guard}, stagger ${r.s.stagger})`);
const aim = (id) => ev((id) => { const e = __game.enemies().find((x) => x.id === id); for (let i = 0; i < 3; i++) { const c = __game.camPos; __game.look(Math.atan2(e.pos[0] - c[0], e.pos[2] - c[2]), 0.12); __game.advance(0.03); } }, id);
for (let i = 0; i < 6 && r.s && r.s.guard > 0; i++) { await aim(id); await ev(() => { __game.chokeStart(); __game.advance(0.85); }); r = await spec(id); }
check(r.s && r.s.guard <= 0 && r.s.stagger > 0, `chokes in quick succession break his guard (guard ${r.s?.guard}, staggered ${r.s?.stagger?.toFixed?.(1)})`);
await aim(id); await ev(() => { __game.chokeStart(); __game.advance(0.6); });
const held = (await spec(id)).e.state; await adv(4.5);
r = await spec(id); check(held === 'choked' && r.e.state === 'dead', `while he staggers, the choke works on him (${held}, then ${r.e.state})`);

// the camera over the hills
await p.goto(URL + '?hills=1'); await p.waitForFunction(() => window.__game, null, { timeout: 120000 }); await p.mouse.click(640, 300);
await ev(() => { __game.setEnemyCount(0); for (let i = 0; i < 12; i++) __game.moveEnemy(i, 400 + i * 5, 0); });
const top = await ev(() => { let best = null; for (let x = -300; x <= 300; x += 8) for (let z = -300; z <= 300; z += 8) { const h = __game.terrainH(x, z); if (!best || h > best[2]) best = [x, z, h]; } return best; });
let low = 0, n = 0, worst = 9;
for (const pitch of [-0.45, -0.2, 0.15]) for (let a = 0; a < 8; a += 1) {
  await ev(([x, z, a, pt]) => { __game.place(x, z); __game.look(a * Math.PI / 4, pt); __game.advance(0.3); }, [top[0], top[1], a, pitch]);
  await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft');
  for (let t = 0; t < 6; t++) { await ev((pt) => { __game.look(__game.view[0], pt); __game.advance(0.4); }, pitch); const c = await ev(() => { const c = __game.camPos; return c[1] - __game.terrainH(c[0], c[2]); }); n++; worst = Math.min(worst, c); if (c < 0.6) low++; }
  await p.keyboard.up('ShiftLeft'); await p.keyboard.up('KeyW');
}
check(low === 0, `sprinting over hills looking up, level or down: the camera stays above the ground and the grass (${n} samples, lowest ${worst.toFixed(2)} m)`);
await p.screenshot({ path: `${OUT}/v39-camera.png` });
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
