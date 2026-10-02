// v33: the audit's Batch 2 fixes (audit/REPORT.md, BACKLOG → Audit fixes), by real input where it matters.
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
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return null; });
const reset = async () => { await ev(([x, z]) => { const g = __game; if (g.mission) g.endMission('quit'); g.fillEnemies(); g.advance(0.1); const n = g.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { g.moveEnemy(i, 300 + i * 4, 300); g.setMind(i, 'patrol', 999); } g.setGadget('swing', false); g.setMode('ground', 0); g.place(x, z); g.look(Math.PI, 0.28); g.selectSlot(0, true); g.setGear('lit'); g.advance(2); }, O); await lock(); };
const idx = (id) => `__game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === '${id}')`;
await lock();

// first-use shaders are compiled at load: drawing the pistol adds at most a couple
const pr = async () => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(__game.programs)))));
const pg0 = await pr(); await ev(() => { __game.selectSlot(1, true); __game.advance(1.5); }); const pg1 = await pr();
check(pg1 - pg0 <= 2, `first pistol draw compiles ${pg1 - pg0} new shaders (was 11)`);
// recoil you can see, and it settles back
await reset(); await ev(() => { __game.selectSlot(1, true); __game.advance(1.3); __game.look(Math.PI, 0.1); __game.advance(0.3); });
const a0 = (await ev(() => __game.aimProbe())).camPitch; await click(); await adv(0.03); const a1 = (await ev(() => __game.aimProbe())).camPitch; await adv(1.2); const a2 = (await ev(() => __game.aimProbe())).camPitch;
check(a0 - a1 > 0.012 && Math.abs(a2 - a0) < 0.005, `pistol kick ${(a0 - a1).toFixed(3)} rad, back to ${(a2 - a0).toFixed(4)} after 1.2 s`);

// Mission 3: standing still at the start, nobody sees you for 20 s
await reset(); await ev(() => { document.getElementById('missionsbtn').click(); document.querySelector('[data-mission="m3"]').click(); });
let st = ''; for (let i = 0; i < 40; i++) { await adv(0.5); st = await ev(() => __game.mission?.state); if (st === 'failed') break; }
check(st === 'infil', `Mission 3: 20 s standing at the start, still unseen (${st})`);
await p.screenshot({ path: `${OUT}/v33-mission3-start.png` }); await ev(() => { __game.endMission('quit'); document.getElementById('mdone').hidden = true; });

// duellist: one swing spends at most one guard point, the guard breaks, then a cut lands
let ok = 0, maxDrop = 0, broke = 0;
for (let t = 0; t < 3; t++) {
  await reset(); const id = await ev(([x, z]) => __game.spawnSpecial('duel', x, z - 2.4), O); await ev((s) => { const i = (0, eval)(s); __game.setMind(i, 'combat', 0); __game.faceEnemy(i, 0); __game.advance(0.4); }, idx(id));
  let g = 3;
  for (let n = 0; n < 12; n++) {
    const e = await ev((id) => __game.enemies().find((x) => x.id === id), id); if (!e || e.state === 'dead') { ok++; break; }
    await ev(([x, z]) => { __game.place(x, z + 1.4); __game.look(Math.PI, 0.25); }, [e.pos[0], e.pos[2]]); await click(); await adv(0.75);
    const s = await ev((id) => __game.special().find((x) => x.id === id), id); if (s) { maxDrop = Math.max(maxDrop, g - s.guard); g = s.guard; if (s.guard === 0) broke++; }
  }
}
check(ok === 3 && maxDrop <= 1, `duellist: cut down in ${ok}/3 fights, at most ${maxDrop} guard point per swing, guard broken ${broke} times`);

// grapple swing from the ground, 14 m from an 18 m+ building: it keeps swinging, upright
await reset(); const tall = await ev(() => __game.blocks.filter((b) => b.max[1] >= 18).map((b) => ({ ...b, c: [(b.min[0] + b.max[0]) / 2, (b.min[2] + b.max[2]) / 2] })).sort((a, b) => Math.hypot(...a.c) - Math.hypot(...b.c))[0]);
await ev(([B]) => { __game.setGadget('swing', true); __game.place(B.c[0], B.min[2] - 14); __game.look(0, 0); __game.advance(0.3); }, [tall]);
await ev(([x, y, z]) => { for (let i = 0; i < 3; i++) { const c = __game.camPos, dx = x - c[0], dy = y - c[1], dz = z - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.05); } }, [tall.c[0], tall.max[1] * 0.85, tall.min[2]]);
await key('KeyR'); let swingT = 0, maxY = 0; for (let i = 0; i < 30; i++) { await adv(0.1); const s = await ev(() => [__game.swing, __game.y]); if (s[0]) swingT += 0.1; maxY = Math.max(maxY, s[1]); }
check(swingT > 2 && maxY > 2, `grapple swing from the ground at 14 m: ${swingT.toFixed(1)} s swinging, up to ${maxY.toFixed(1)} m`);
check((await ev(() => __game.overrides.join(','))).includes('Jump_Loop'), 'swinging plays the upright airborne pose');
await ev(() => { if (__game.grappleState !== 'idle') __game.grapplePress(); __game.setGadget('swing', false); __game.advance(2); });

// crouch with a weapon out
for (const [n, s] of [['saber', 0], ['pistol', 1], ['AK', 3]]) { await reset(); await ev((s) => { __game.selectSlot(s, true); __game.advance(1.5); }, s); if (await ev(() => __game.crouch)) { await key('KeyC'); await adv(0.3); } await key('KeyC'); await adv(0.5); check(await ev(() => __game.crouch), `C crouches with the ${n} out`); }

// shield soldier: from behind, three pistol shots; he turns slowly enough to flank
await reset(); const sh = await ev(([x, z]) => __game.spawnSpecial('shield', x, z - 12), O);
await ev((s) => { const i = (0, eval)(s); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, Math.PI); __game.selectSlot(1, true); __game.advance(1.5); }, idx(sh));
let shots = 0; for (; shots < 6; shots++) { const i = await ev((s) => (0, eval)(s), idx(sh)); if (i < 0) break; await ev((i) => { __game.shootAt(i, 'torso'); __game.advance(0.25); }, i); }
check(shots <= 3, `shield soldier shot in the back: down in ${shots} shots`);
await reset(); const sh2 = await ev(([x, z]) => __game.spawnSpecial('shield', x, z - 10), O);
await ev((s) => { const i = (0, eval)(s); __game.setMind(i, 'combat', 0); __game.faceEnemy(i, Math.PI); __game.advance(0.05); }, idx(sh2));
const y0 = (await ev((id) => __game.enemyBone(id, 'pelvis'), sh2)).yaw; await adv(0.5); const y1 = (await ev((id) => __game.enemyBone(id, 'pelvis'), sh2)).yaw;
const turned = Math.abs(Math.atan2(Math.sin(y1 - y0), Math.cos(y1 - y0)));
check(turned < 1.0, `shield soldier turns ${(turned * 57.3).toFixed(0)}° in 0.5 s (capped at 100°/s)`);

// blood splats: a few cuts, then a look at the splatter
await ev(([x, z]) => { __game.place(x, z); __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, x, z - 1.6, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.1); __game.cutEnemy(0, 'upperarm_l'); __game.advance(0.5); __game.cutEnemy(0, 'chest'); __game.advance(2); }, O);
check((await ev(() => __game.blood().splats)) > 0, 'cuts leave blood splats');
await ev(([x, z]) => { __game.setDebugCam([x + 2.2, 1.7, z + 0.5], [x, 0.2, z - 1.5]); __game.advance(0.05); }, O); await p.screenshot({ path: `${OUT}/v33-splats.png` }); await ev(() => __game.setDebugCam(null));
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
