// v36: things that go off, and the score. Barrels and gas tanks blow when shot, cut, pushed or caught in a blast,
// and set each other off; landmines click, then blow; kills score by how they happened, with combos, a civilian
// penalty and the perfect-stealth trophy.
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
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 30) && !__game.onRoad(x, z, 12)) return [Math.round(x), Math.round(z)]; } return null; });
const barrel = (id) => ev((id) => __game.barrels().find((x) => x.id === id) || null, id);
const reset = async () => { await ev(([x, z]) => { const g = __game; g.fillEnemies(); g.advance(0.1); const n = g.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { g.moveEnemy(i, 300 + i * 4, 300); g.setMind(i, 'patrol', 999); } g.place(x, z); g.look(0, 0.15); g.selectSlot(0, true); g.setGear('none'); g.advance(1); }, O); await lock(); };
// aim the camera at a point (a few passes, the camera trails the yaw a little)
const aimAt = (pt) => ev((pt) => { for (let i = 0; i < 4; i++) { const c = __game.camPos, dx = pt[0] - c[0], dy = pt[1] - c[1], dz = pt[2] - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.05); } }, pt);

check((await ev(() => __game.barrels().length)) === 0, 'headless runs start without barrels (older suites)');
const n = await ev(() => __game.scatterProps());
check(n >= 15 && (await ev(() => __game.mines().length)) === 9, `the sandbox gets ${n} barrels in clusters and a 9-mine minefield`);
await reset();

// a pistol shot sets one off, and the soldier beside it dies: a barrel kill
let id = await ev(([x, z]) => __game.spawnBarrel(x, z + 7), O);
await ev(([x, z]) => { __game.moveEnemy(0, x + 1.1, z + 7.3, Math.PI); __game.setMind(0, 'patrol', 999); __game.selectSlot(1, true); __game.advance(1.5); }, O);
let B = await barrel(id); await aimAt([B.at[0], B.at[1] + 0.5, B.at[2]]);
check((await ev(() => __game.shotProbe())).wall?.mat === 'barrel', 'the crosshair is on the barrel');
const s0 = (await ev(() => __game.score)).total;
await p.mouse.down(); await adv(0.05); await p.mouse.up(); await adv(0.6);
B = await barrel(id);
check(B.gone, 'a pistol shot blows the barrel');
let sc = await ev(() => __game.score);
check(sc.total > s0 && sc.log.some((l) => /Barrel kill/.test(l.label)), `the soldier next to it: "${sc.log.at(-1)?.label}" +${sc.log.at(-1)?.pts}`);
check((await ev(() => document.querySelectorAll('.pop').length)) > 0, 'the points pop up where he died');
await p.screenshot({ path: `${OUT}/v36-barrel.png` });

// a chain: five in a row, one shot, they go one after another
await reset(); await ev(() => __game.resetScore());
const row = await ev(([x, z]) => [0, 1, 2, 3, 4].map((i) => __game.spawnBarrel(x - 6 + i * 3, z + 12, i === 2 ? 'gas' : 'barrel')), O);
await ev(([x, z]) => { for (let i = 0; i < 3; i++) __game.moveEnemy(i, x - 4.5 + i * 3, z + 13.2, Math.PI); __game.advance(0.05); }, O);
await ev(([x, z]) => __game.explodeAt(x - 6, 0.4, z + 12), O);
let fuses = 0; for (let t = 0; t < 12; t++) { await adv(0.08); fuses = Math.max(fuses, (await ev((ids) => __game.barrels().filter((b) => ids.includes(b.id) && !b.gone && b.fuse !== null).length, row))); }
await adv(1);
const goneRow = await ev((ids) => __game.barrels().filter((b) => ids.includes(b.id) && b.gone).length, row);
check(goneRow === 5, `a blast sets off the whole row in a chain (${goneRow}/5 gone, up to ${fuses} fuses burning at once)`);
sc = await ev(() => __game.score);
check(sc.log.some((l) => /Chain reaction|Barrel kill/.test(l.label)), `soldiers caught in it score (${sc.log.map((l) => l.label).join(', ')})`);
check(sc.log.some((l) => /×[2-5]/.test(l.label)), 'kills close together make a combo');
check((await ev(() => __game.fires)) > 0, 'the gas tank leaves a fire');
await ev(([x, z]) => { __game.setDebugCam([x, 4, z + 2], [x, 0.5, z + 12]); __game.advance(0.02); }, O); await p.screenshot({ path: `${OUT}/v36-chain.png` }); await ev(() => __game.setDebugCam(null));

// the Force throws a barrel into a soldier
await reset(); await ev(() => { __game.setClass('force'); });
id = await ev(([x, z]) => __game.spawnBarrel(x, z + 4), O);
await ev(([x, z]) => { __game.moveEnemy(0, x, z + 13, Math.PI); __game.setMind(0, 'patrol', 999); __game.look(0, 0.1); __game.advance(0.3); __game.forcePush(); __game.advance(0.15); }, O);
check((await ev(() => __game.flyingBarrels)) === 1, 'a Force push throws the barrel');
await adv(1.5);
check((await barrel(id)) === null || (await barrel(id)).gone, 'it goes off where it lands');
await ev(() => __game.setClass('light'));

// the saber cuts one open
await reset(); id = await ev(([x, z]) => __game.spawnBarrel(x, z + 1.3), O);
await ev(() => { __game.setGear('lit'); __game.advance(1.2); __game.look(0, 0.15); }); for (let i = 0; i < 3 && !(await barrel(id)).gone; i++) { await p.mouse.down(); await adv(0.05); await p.mouse.up(); await adv(0.5); }
check((await barrel(id)).gone, 'a saber swing sets one off');

// a landmine: he steps on it, it clicks, then blows
await reset(); await ev(() => __game.resetScore());
const mine = await ev(([x, z]) => __game.spawnMine(x + 3, z + 9), O);
await ev(([x, z]) => { __game.moveEnemy(0, x + 3, z + 9.2, Math.PI); __game.advance(0.05); }, O);
const m1 = await ev((id) => __game.mines().find((m) => m.id === id), mine); await adv(0.6); const m2 = await ev((id) => __game.mines().find((m) => m.id === id), mine);
check(m1.fuse > 0 && m2.gone, `stepping on a mine: a click (fuse ${m1.fuse}), then the blast`);
check((await ev(() => __game.score)).log.some((l) => /Landmine/.test(l.label)), 'a landmine kill scores');

// headshot, unaware; a civilian costs you
await reset(); await ev(() => __game.resetScore());
await ev(([x, z]) => { __game.moveEnemy(0, x, z + 9, Math.PI); __game.setMind(0, 'patrol', 999); __game.selectSlot(1, true); __game.advance(1.5); __game.shootAt(0, 'head'); __game.advance(0.3); }, O);
sc = await ev(() => __game.score);
check(/Headshot · unaware/.test(sc.log.at(-1)?.label || ''), `a headshot on someone who never saw you: "${sc.log.at(-1)?.label}" +${sc.log.at(-1)?.pts}`);
const cid = await ev(([x, z]) => { const id = __game.spawnCivilian(x + 2, z + 6, 'm'); __game.setCivCount(1); return id; }, O);
await ev((id) => { __game.shootCiv(id, 'head'); __game.advance(0.3); }, cid);
sc = await ev(() => __game.score);
check(sc.log.at(-1)?.pts === -200, `a civilian costs ${sc.log.at(-1)?.pts}`);
await ev(() => __game.setCivCount(0));

// the sandbox gets its barrels back
const anyGone = await ev(() => __game.barrels().filter((b) => b.gone).length);
await ev(() => { __game.place(-300, -300); __game.advance(62); });
check((await ev(() => __game.barrels().filter((b) => b.gone).length)) < anyGone, `blown barrels come back after a minute (${anyGone} gone before)`);

// missions: the stealth trophy when nobody saw you, not after a fight
await ev(() => { document.getElementById('missionsbtn').click(); document.querySelector('[data-mission="m3"]').click(); }); await adv(2);
await ev(() => { __game.completeMission(); __game.advance(0.2); });
check((await ev(() => __game.trophy)) === true && /perfect stealth/.test(await ev(() => document.getElementById('mdonetitle').textContent)), 'Mission 3 finished unseen: perfect-stealth trophy');
await ev(() => { __game.endMission('done'); document.getElementById('mdone').hidden = true; });
await ev(() => { document.getElementById('missionsbtn').click(); document.querySelector('[data-mission="m1"]').click(); }); await adv(8);
await ev(() => { __game.completeMission(); __game.advance(0.2); });
check((await ev(() => __game.trophy)) === false, `Mission 1 (they came at you): no trophy (spotted ${await ev(() => __game.score.spotted)})`);
await ev(() => { __game.endMission('done'); document.getElementById('mdone').hidden = true; });
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
