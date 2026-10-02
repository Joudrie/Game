// v34: Esc pauses (the world stops) with settings that work: mouse sensitivity, invert Y, volume, field of view,
// and the key list. Opening a panel on purpose doesn't pause.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const locked = () => ev(() => document.pointerLockElement === document.querySelector('canvas'));
const lock = async () => { if (!(await locked())) { await p.mouse.click(640, 300); await p.waitForTimeout(200); } };
const unlock = async () => { await ev(() => document.exitPointerLock()); await p.waitForTimeout(200); }; // what Esc does while playing
await lock(); check(await locked(), 'a click takes the mouse');

// Esc (the mouse let go) pauses; the world stops
await ev(() => { __game.fillEnemies(); __game.advance(0.5); });
await unlock();
check(await ev(() => __game.paused) && await ev(() => !document.getElementById('pause').hidden), 'Esc pauses and shows the pause menu');
const keys = await ev(() => document.querySelectorAll('#keylist dt').length);
check(keys >= 20, `the key list shows ${keys} keys`);
const e0 = await ev(() => JSON.stringify(__game.enemies().map((e) => e.pos)));
await p.waitForTimeout(1500);
check(e0 === await ev(() => JSON.stringify(__game.enemies().map((e) => e.pos))), 'while paused nobody moves');
await p.screenshot({ path: `${OUT}/v34-pause.png` });
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
check(!(await ev(() => __game.paused)), 'Esc again resumes');
await lock();

// panels you open on purpose don't pause
await p.keyboard.press('KeyM'); await p.waitForTimeout(300);
check(!(await ev(() => __game.paused)), 'M opens the menu without pausing');
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
await lock(); await p.keyboard.press('KeyI'); await p.waitForTimeout(300);
check(!(await ev(() => __game.paused)), 'I opens the inventory without pausing');
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
await lock();

// P pauses; the settings, by real input
await p.keyboard.press('KeyP'); await p.waitForTimeout(200);
check(await ev(() => __game.paused), 'P pauses too');
const slide = (id, v) => ev(([id, v]) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]);
await slide('setsens', 2); await slide('setfov', 70); await slide('setvol', 0.4); await p.click('#setinvert');
const st = await ev(() => __game.settings);
check(st.sens === 2 && st.fov === 70 && st.vol === 0.4 && st.invertY === true, `settings saved (${JSON.stringify(st)})`);
check((await ev(() => __game.masterVol)) === null || Math.abs((await ev(() => __game.masterVol)) - 0.4) < 0.01, `the volume reaches the sound (${await ev(() => __game.masterVol)})`);
await p.click('#pauseresume'); await p.waitForTimeout(250);
check(!(await ev(() => __game.paused)) && await locked(), 'Resume takes the mouse back');
await ev(() => { __game.look(0, 0.3); __game.advance(1.5); });
check(Math.abs((await ev(() => __game.fov)) - 70) < 1.5, `field of view ${(await ev(() => __game.fov)).toFixed(1)}° (set 70)`);
// mouse: twice the turn, and up looks down
await p.mouse.move(640, 300); await p.waitForTimeout(100); const v0 = await ev(() => __game.view); await p.mouse.move(700, 290); await p.mouse.move(760, 280); await p.waitForTimeout(100); const v1 = await ev(() => __game.view);
const dyaw = v0[0] - v1[0], dpitch = v1[1] - v0[1];
check(dyaw > 0, `the mouse turns the view (${dyaw.toFixed(3)} rad)`);
check(dpitch > 0, `invert Y: moving the mouse up looks down (pitch ${dpitch.toFixed(3)})`);
await p.reload(); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
check((await ev(() => __game.settings)).sens === 2 && Math.abs((await ev(() => __game.baseFov)) - 70) < 0.01, 'the settings are kept after a reload');
await ev(() => localStorage.removeItem('settings'));

// phone width: the pause panel fits
await p.setViewportSize({ width: 375, height: 700 }); await ev(() => __game.setPause(true)); await p.waitForTimeout(200);
const w = await ev(() => { const r = document.querySelector('#pause .panel').getBoundingClientRect(); return [r.left, r.right, document.documentElement.scrollWidth]; });
check(w[0] >= 0 && w[1] <= 375 && w[2] <= 375, `at 375 px the panel fits (${w.map(Math.round).join(', ')})`);
await p.screenshot({ path: `${OUT}/v34-pause-375.png` });
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
