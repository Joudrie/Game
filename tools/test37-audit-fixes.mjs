// v32: the audit's Batch 1 fixes (audit/REPORT.md), checked by real keyboard and mouse input where possible.
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
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
// open ground, soldiers parked far away
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return null; });
const reset = async () => { await ev(([x, z]) => { const g = __game; g.fillEnemies(); g.advance(0.1); const n = g.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { g.moveEnemy(i, 300 + i * 4, 300); g.setMind(i, 'patrol', 999); } g.leaveCover('t'); g.setMode('ground', 0); g.place(x, z); g.look(Math.PI, 0.28); g.selectSlot(0, true); g.setGear('lit'); g.advance(2); }, O); await lock(); };
const walk = async () => { await p.keyboard.down('KeyW'); await adv(1.2); const s = await ev(() => __game.speed); await p.keyboard.up('KeyW'); await adv(0.3); return s; };
const swap5 = (id) => ev((id) => { const I = __game.inv, hi = I.hot.findIndex((x) => x && x.id === id); if (hi >= 0) { __game.selectSlot(hi, true); __game.advance(1.3); return; } const bi = I.bag.findIndex((x) => x && x.id === id); const t = I.hot[4]; I.hot[4] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(4, true); __game.advance(1.3); }, id);
await lock();

// BUG-001: actions that interrupt a swing no longer leave a dead swing (walk capped at 1 m/s)
for (const k of ['KeyR', 'KeyT', 'KeyX']) {
  await reset(); await click(); await adv(0.15); await key(k); await adv(3);
  const atk = await ev(() => __game.atk), s = await walk();
  check(atk === null && s > 4, `swing, then ${k}: free again (attack ${atk}, walking ${s.toFixed(1)} m/s)`);
}
await reset(); await ev(([x, z]) => { __game.moveEnemy(0, x, z - 1, Math.PI); __game.faceEnemy(0, Math.PI); __game.setMind(0, 'patrol', 999); __game.advance(0.3); }, O);
await key('KeyF'); await adv(0.25); await click(); await adv(3);
check((await ev(() => __game.takedowns)) >= 1 && (await walk()) > 4, 'a click during a takedown: the takedown lands and you walk at full speed after');
await reset(); await swap5('saberblaster'); await click(); await adv(3);
check((await walk()) > 4, 'Saber + blaster: a left click (blaster) leaves you free to walk');
await click('right'); await adv(3); const sb = await ev(() => [__game.atk, __game.overrides]);
check(sb[0] === null && sb[1].length === 0, `Saber + blaster: a right-click swing finishes (attack ${sb[0]}, overlays ${sb[1].join(',') || 'none'})`);
await reset(); await ev(() => { const I = __game.inv, bi = I.bag.findIndex((x) => x && x.id === 'ak'); if (bi >= 0) { const t = I.hot[4]; I.hot[4] = I.bag[bi]; I.bag[bi] = t; } });

// BUG-008: switching to the pistol mid heavy combo drops the sword pose
await p.mouse.down(); await adv(0.5); await p.mouse.up(); await key('Digit2'); await adv(2);
check((await ev(() => __game.overrides)).length === 0, 'heavy combo, then 2: no sword pose left on the pistol');

// BUG-002: alt-tab lets go of held mouse buttons
await reset(); await ev(() => { __game.selectSlot(3, true); __game.advance(1.5); });
await p.mouse.down(); await adv(0.2); await ev(() => { dispatchEvent(new Event('blur')); document.exitPointerLock(); });
const m1 = (await ev(() => __game.ammoMags())).ak; await adv(1.5); const m2 = (await ev(() => __game.ammoMags())).ak; await p.mouse.up();
check(m2 === m1, `AK held, then alt-tab: firing stops (${m1} → ${m2} rounds)`);
await reset(); await p.mouse.down({ button: 'right' }); await adv(0.3); await ev(() => { dispatchEvent(new Event('blur')); document.exitPointerLock(); }); await adv(0.5);
check(!(await ev(() => __game.blocking)), 'guarding, then alt-tab: the guard drops'); await p.mouse.up({ button: 'right' });

// BUG-003: severed pieces keep the uniform after several cuts
await reset(); await ev(([x, z]) => { __game.moveEnemy(0, x, z - 4, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.3); for (const c of ['hand_l', 'calf_r', 'waist']) { __game.cutEnemy(0, c); __game.advance(0.4); } __game.advance(1); }, O);
const pc = await ev(() => [__game.pieceCount, __game.redPieces()]);
check(pc[0] >= 3 && pc[1] === 0, `three cuts on one soldier: ${pc[0]} pieces, ${pc[1]} painted red all over`);
await ev(([x, z]) => { __game.setDebugCam([x + 2.2, 1.7, z - 1.8], [x, 0.3, z - 4]); __game.advance(0.05); }, O); await p.screenshot({ path: `${OUT}/v32-three-cuts.png` }); await ev(() => __game.setDebugCam(null));

// BUG-009: no "didn't move" report while pushing at the wall in cover
await reset(); await ev(() => { __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(0.3); }); await key('KeyQ'); await adv(0.3);
const r0 = await ev(() => __game.lastReport?.kind || null); await p.keyboard.down('KeyW'); await adv(1.5); await p.keyboard.up('KeyW');
const r1 = await ev(() => __game.lastReport); check(!(r1 && r1.kind === 'stuck'), `in cover, W into the wall: no stuck report (last: ${r1 ? r1.kind : 'none'})`);

// BUG-010: the world has an edge
await reset(); await ev(() => { __game.place(1940, 0); __game.look(Math.PI / 2, 0.2); __game.advance(0.2); });
await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(4); await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft');
const px = (await ev(() => __game.pos))[0]; check(px <= 1950.01, `sprinting east from x = 1940 stops at the edge (x = ${px})`);

// BUG-013: infinite jumps start off, so the class rules count
check((await ev(() => __game.testCfg.infiniteJumps)) === false, 'infinite jumps are off on a new save');
await reset(); await ev(() => __game.setClass('force')); let top = 0; for (let j = 0; j < 5; j++) { await key('Space', 0.03); for (let t = 0; t < 7; t++) { await adv(0.04); top = Math.max(top, await ev(() => __game.y)); } } await adv(3);
check(top > 5 && top < 9, `Force class: five jump taps reach ${top.toFixed(1)} m (three jumps, not five)`); await ev(() => __game.setClass('light'));

// variety: several idles and stances rotate by default
const pools = await ev(() => ({ idle: __game.pool('idle').length, stance: __game.pool('stance').length, jog: __game.pool('jog').length }));
check(pools.idle >= 2 && pools.stance >= 2 && pools.jog === 1, `default move pools: ${JSON.stringify(pools)}`);

// texts: the readout names the gun; the help bar fits at 1920 and shows at 1280
await ev(() => { __game.selectSlot(3, true); __game.advance(1.5); });
check((await ev(() => document.getElementById('gearlbl').textContent)) === 'AK-47', `readout names the gun: "${await ev(() => document.getElementById('gearlbl').textContent)}"`);
for (const [w, h] of [[1920, 1080], [1280, 720]]) {
  await p.setViewportSize({ width: w, height: h }); await adv(0.2);
  const r = await ev(() => { const e = document.getElementById('help'), b = e.getBoundingClientRect(); return [getComputedStyle(e).display, Math.round(b.left), Math.round(b.right), innerWidth]; });
  check(r[0] !== 'none' && r[1] >= 0 && r[2] <= r[3], `help bar at ${w} px: shown and on screen (${r[1]}–${r[2]})`);
}
await p.screenshot({ path: `${OUT}/v32-help-1280.png` });
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
