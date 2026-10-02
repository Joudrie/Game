// v34 sound pass: every new clip loads, and the actions make their sounds (steps, landing, punches, saber cuts,
// bullet hits, dry fire, the grapple, drawing a gun, bodies falling).
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
const adv = (s) => ev((s) => __game.advance(s), s);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
await p.mouse.click(640, 300); await p.waitForTimeout(1500); // the click starts Web Audio, which decodes the clips
const NEW = ['step1', 'step2', 'step3', 'land', 'punch', 'punch2', 'hit', 'impact', 'cut', 'dry', 'grapple', 'bounce', 'pickup', 'draw', 'bodyfall', 'alarm', 'win', 'lose', 'jet'];
const loaded = await ev(() => __game.sfxLoaded);
const missing = NEW.filter((n) => !loaded.includes(n));
check(missing.length === 0, `all ${NEW.length} new clips decode (${missing.join(' ') || 'none missing'})`);
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 25) && !__game.onRoad(x, z, 5)) return [Math.round(x), Math.round(z)]; } return null; });
const calm = () => ev(() => { const g = __game; g.fillEnemies(); g.advance(0.1); const n = g.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { g.moveEnemy(i, 300 + i * 4, 300); g.setMind(i, 'patrol', 999); } });
const since = async (fn, arg) => { const c0 = await ev(() => __game.sfxCount); await ev(fn, arg); const n = (await ev(() => __game.sfxCount)) - c0; return n ? (await ev(() => __game.sfxLog)).slice(-Math.min(n, 60)).join(' ') : ''; };
await ev(([x, z]) => { __game.place(x, z); __game.look(0, 0.2); __game.selectSlot(0, true); __game.setGear('none'); __game.advance(1); }, O);
// steps
await p.keyboard.down('KeyW'); let s = await since(() => __game.advance(2)); await p.keyboard.up('KeyW');
check(/step\d/.test(s), `walking: footsteps (${(s.match(/step\d/g) || []).length} in 2 s)`);
// landing from a jump
await p.keyboard.down('Space'); await adv(0.1); await p.keyboard.up('Space'); s = await since(() => __game.advance(1.5));
check(s.includes('land'), 'a jump lands with a thud');
// a punch
await calm(); s = await since(([x, z]) => { __game.moveEnemy(0, x, z + 1.1, Math.PI); __game.setMind(0, 'patrol', 999); __game.place(x, z); __game.look(0, 0.2); __game.advance(0.2); __game.attackPress(); __game.attackRelease(); __game.advance(0.6); }, O);
check(/punch/.test(s), `fists: a punch lands (${s})`);
// a saber cut (and the body falls)
s = await since(() => { __game.cutEnemy(0, 'chest'); __game.advance(1); });
check(s.includes('cut') && s.includes('bodyfall'), `a saber cut, then the body falls (${s})`);
// pistol: the draw, a hit, then dry fire
s = await since(() => { __game.selectSlot(1, true); __game.advance(1.5); });
check(s.includes('draw'), 'drawing the pistol');
await calm(); s = await since(([x, z]) => { __game.moveEnemy(0, x, z + 8, Math.PI); __game.setMind(0, 'patrol', 999); __game.advance(0.2); __game.shootAt(0, 'legs'); __game.advance(0.3); }, O);
check(s.includes('hit'), `a bullet hits him (${s})`);
s = await since(() => { __game.advance(0.6); __game.ammo.mag = 0; __game.attackPress(); __game.attackRelease(); __game.advance(0.1); });
check(s.includes('dry'), `an empty gun clicks (${s})`);
// the grapple
await adv(2.5); s = await since(() => { __game.grapplePress(); __game.advance(0.2); });
check(s.includes('grapple'), 'the grapple fires');
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
