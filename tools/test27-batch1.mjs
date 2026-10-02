// v23 (roadmap batch 1): jetpack off by default, recoil no longer climbs, bullet holes, leg cut → crawl,
// gun hand off → panic then a backup pistol in the other hand, walking over dropped pistols picks them up, 6-slot hotbar, shoulder swap.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
check(!(await ev(() => __game.jetpackOn)), 'jetpack is off by default');
check((await ev(() => __game.hotSlots)) === 6 && (await ev(() => document.querySelectorAll('#hotbar .slot').length)) === 6, 'six hotbar slots');
const hb = await ev(() => { const r = document.getElementById('hotbar').getBoundingClientRect(); return [r.left + r.width / 2, innerWidth / 2]; });
check(Math.abs(hb[0] - hb[1]) < 4, `hotbar centred (${hb[0].toFixed(0)} vs ${hb[1]})`);
await p.keyboard.press('KeyB'); check((await ev(() => __game.shoulder)) === -1, 'B swaps to the left shoulder'); await p.keyboard.press('KeyB');

// recoil: 12 aimed shots with the mouse still, the barrel stays put
await ev(() => { __game.setGear('pistol', true); __game.place(0, 0); __game.look(0, 0.1); __game.advance(1); __game.setAim(true); __game.advance(0.6); });
const a0 = await ev(() => __game.aimProbe());
for (let i = 0; i < 12; i++) await ev(() => { __game.firePistol(); __game.advance(0.18); });
await ev(() => __game.advance(1));
const a1 = await ev(() => __game.aimProbe());
check(Math.abs(a1.barrelUp - a0.barrelUp) < 3 && Math.abs(a1.camPitch - a0.camPitch) < 0.01, `recoil settles: barrel ${a0.barrelUp}° → ${a1.barrelUp}°, view ${a0.camPitch} → ${a1.camPitch}`);
// holes: shoot the ground and a wall
await ev(() => { __game.setAim(false); __game.look(0, 0.9); __game.advance(0.3); for (let i = 0; i < 3; i++) { __game.firePistol(); __game.advance(0.2); } });
check((await ev(() => __game.blood().holes)) >= 3, `bullet holes: ${await ev(() => __game.blood().holes)}`);
await p.screenshot({ path: `${OUT}/v23-holes.png` });

// leg cut: he crawls toward you
await ev(() => { __game.setGear('lit', true); __game.look(0, 0.15); __game.fillEnemies(); __game.advance(1); for (let i = 0; i < 5; i++) __game.moveEnemy(i, 40 + i * 4, 40); __game.moveEnemy(0, 0, 5, Math.PI); __game.advance(0.2); });
const idL = await ev(() => __game.cutEnemy(0, 'calf_r'));
await ev(() => __game.advance(0.5));
const d0 = await ev((id) => { const e = __game.enemies().find((x) => x.id === id); return Math.hypot(e.pos[0], e.pos[2]); }, idL);
await ev(() => __game.advance(3));
const eL = await ev((id) => __game.enemies().find((x) => x.id === id), idL), d1 = Math.hypot(eL.pos[0], eL.pos[2]);
check(eL.state === 'crawl' && eL.clip === 'M2M_Crawl' && d1 < d0 - 0.5, `leg off: crawling toward you (${d0.toFixed(1)} → ${d1.toFixed(1)} m)`);
await p.screenshot({ path: `${OUT}/v23-crawl.png` });

// gun hand off: panic, then a backup pistol in the left hand, shooting again
const idH = await ev(() => { const i = __game.cuts().filter((c) => c.state !== 'dead').findIndex((c) => !c.severed.length); __game.moveEnemy(i, 2, 6, Math.PI); return __game.cutEnemy(i, 'hand_r'); });
await ev(() => __game.advance(0.4));
await p.screenshot({ path: `${OUT}/v23-clutch.png` });
let r = (await ev(() => __game.rearm())).find((x) => x.id === idH);
check(r.unarmed, 'gun hand off: unarmed at first');
await ev(() => __game.advance(5));
r = (await ev(() => __game.rearm())).find((x) => x.id === idH);
check(!r.unarmed && r.gunHand === 'hand_l', `then re-armed with the other hand (${r.gunHand})`);
await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.moveEnemy(i, 1.5, 4, Math.PI); __game.look(0.35, 0.1); __game.advance(0.5); }, idH);
await p.screenshot({ path: `${OUT}/v23-lefthand.png` });

// pick up a dropped pistol
const guns = await ev(() => __game.gunsNear());
check(guns.length > 0, `dropped pistols on the ground: ${guns.length}`);
const g = guns.find((x) => x[2]) || guns[0];
const ammoId = { pistol: 'ammo', ak: 'ammo_rifle', ar: 'ammo_rifle', sniper: 'ammo_sniper', shotgun: 'ammo_shells' }[g[3] || 'pistol']; // a soldier may have dropped a rifle
const ammo0 = await ev((id) => __game.countItem(id), ammoId);
await ev((g) => { __game.place(g[0] + 0.3, g[1]); __game.advance(0.4); }, g); // walking over it picks it up
const ammo1 = await ev((id) => __game.countItem(id), ammoId);
const magOf = { pistol: 12, ak: 30, ar: 30, sniper: 5, shotgun: 6 }[g[3] || 'pistol']; // one magazine of whatever he dropped (v31 loadouts)
check(ammo1 >= ammo0 + magOf, `walked over it and picked it up: ammo ${ammo0} → ${ammo1} (${g[3] || 'pistol'})`);
check(!(await ev(() => __game.gunsNear())).some((x) => Math.hypot(x[0] - g[0], x[1] - g[1]) < 0.05), 'that pistol is gone from the ground');
check(!errs.length, 'no page errors');
console.log(fail ? `FAILED (${fail})` : 'PASS');
await b.close(); process.exit(fail ? 1 : 0);
