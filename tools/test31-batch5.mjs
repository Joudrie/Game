// v27 (roadmap batch 5): the M4 carbine, attachments (suppressor, scope), the courtyard with glass and wood that
// break, Mission 1 (four waves, snipers on the balcony, the reward you keep), retry on death, stims, the creative catalogue.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
await ev(() => { __game.setDifficulty('sandbox'); __game.place(0, 0); __game.look(0, 0.1); __game.advance(1); });

// the M4 carbine
const arSlot = await ev(() => { const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === 'ar'); if (bi < 0) return -1; const t = I.hot[5]; I.hot[5] = I.bag[bi]; I.bag[bi] = t; return 5; });
check(arSlot === 5, 'the M4 carbine is handed out (moved to slot 6)');
await ev(() => { __game.selectSlot(5); __game.advance(1.5); __game.setAim(true); __game.advance(0.4); });
const m0 = (await ev(() => __game.ammoMags())).ar;
await ev(() => { __game.holdFire(true); __game.attackPress(); for (let i = 0; i < 12; i++) __game.advance(0.05); __game.attackRelease(); __game.holdFire(false); __game.advance(0.2); });
const m1 = (await ev(() => __game.ammoMags())).ar;
check((await ev(() => __game.gunKind)) === 'ar' && m1 < m0 - 2, `M4 in hand, automatic fire (${m0} → ${m1})`);
await p.screenshot({ path: `${OUT}/v27-m4.png` });
// scope: aiming zooms in
await ev(() => { __game.setAtt('ar', 'scope', true); __game.setAtt('ar', 'suppressor', true); __game.advance(0.6); });
check((await ev(() => __game.zoom)) === 24 && (await ev(() => __game.fov)) < 33, `scope: aiming zooms to 2.5x (fov ${(await ev(() => __game.fov)).toFixed(1)})`);
await p.screenshot({ path: `${OUT}/v27-scope.png` });
await ev(() => { __game.setAim(false); __game.advance(0.6); __game.setAtt('ar', 'scope', false); __game.advance(0.3); });
await ev(() => __game.setDebugCam([1.2, 1.7, 1.3], [0, 1.2, 0])); await ev(() => __game.advance(0.05));
await p.screenshot({ path: `${OUT}/v27-suppressor.png` });
await ev(() => __game.setDebugCam(null));
// suppressor: a calm soldier 20 m away doesn't hear it; without it he does
await ev(() => { __game.fillEnemies(); __game.advance(0.3); const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { __game.moveEnemy(i, 60 + i * 4, 60); __game.setMind(i, 'patrol', 999); } __game.moveEnemy(0, 20, 0, 0); __game.setMind(0, 'patrol', 999); __game.faceEnemy(0, Math.PI / 2); __game.advance(0.1); });
await ev(() => { __game.look(Math.PI, 0.05); __game.holdFire(true); __game.attackPress(); __game.advance(0.3); __game.attackRelease(); __game.holdFire(false); __game.advance(0.3); });
const heard1 = (await ev(() => __game.minds()))[0].mind;
await ev(() => { __game.setAtt('ar', 'suppressor', false); __game.holdFire(true); __game.attackPress(); __game.advance(0.3); __game.attackRelease(); __game.holdFire(false); __game.advance(0.3); });
const heard2 = (await ev(() => __game.minds()))[0].mind;
check(heard1 === 'patrol' && heard2 === 'combat', `suppressed shots go unheard at 20 m (${heard1}); loud ones don't (${heard2})`);

// the courtyard
const mats = await ev(() => __game.mats());
check(mats.stone > 10 && mats.wood >= 32 && mats.glass === 8, `courtyard built: ${JSON.stringify(mats)}`);
await ev(() => { __game.setGear('pistol'); __game.goCourt(10, -20); __game.look(0, 0.05); __game.advance(1.2); });
const glass = await ev(() => __game.matBlocks('glass'));
const g0 = glass.find((q) => q.c[0] > 9 && q.c[0] < 11) || glass[0];
await ev((c) => __game.shootPoint(...c), g0.c); await ev(() => __game.advance(0.3));
check((await ev(() => __game.matBlocks('glass'))).length === 7 && (await ev(() => __game.broken)).glass === 1, 'one shot shatters a glass pane');
await p.screenshot({ path: `${OUT}/v27-glass.png` });
// wood: a board takes three pistol shots
await ev(() => { __game.goCourt(-12, 0); __game.look(0, 0.05); __game.advance(0.5); });
const wood = await ev(() => __game.matBlocks('wood'));
const w0 = wood.filter((q) => q.c[1] < 1 && Math.abs(q.c[0] - (-11.5)) < 0.1)[0] || wood[0];
const wb = (await ev(() => __game.broken)).wood || 0;
for (let i = 0; i < 3; i++) { await ev((c) => __game.shootPoint(...c), w0.c); await ev(() => __game.advance(0.25)); }
const wa = (await ev(() => __game.broken)).wood || 0, deb = await ev(() => __game.debris);
check(wa === wb + 1 && deb >= 6, `three shots break a board into chunks (${wa - wb} broken, ${deb} chunks)`);
await ev(() => __game.advance(1));
await p.screenshot({ path: `${OUT}/v27-wood.png` });
// a grenade against the wooden wall takes out several boards
const before = (await ev(() => __game.broken)).wood;
await ev(() => { const c = __game.courtAt(-12, 3); __game.explodeAt(c[0], 0.6, c[2] - 0.4); __game.advance(1); });
const after = (await ev(() => __game.broken)).wood;
check(after - before >= 3, `a blast breaks ${after - before} boards`);
await p.screenshot({ path: `${OUT}/v27-blast-wall.png` });

// Mission 1
await ev(() => { __game.forgetKept(); __game.startMission('m1'); __game.advance(0.3); });
let m = await ev(() => __game.mission), hot = await ev(() => __game.inv.hot.map((x) => x && x.id));
check(m && m.state === 'break' && hot.join() === 'saber,pistol,grenade,stim,,', `mission starts with the kit (${hot.join(',')})`);
await ev(() => { __game.grapplePress(); __game.advance(0.2); });
check((await ev(() => __game.grapple)) === 'idle', 'no grappling hook until you earn it');
await ev(() => __game.advance(4.5));
m = await ev(() => __game.mission);
check(m.state === 'fight' && m.wave === 0 && m.left === 4 && m.kinds.every((k) => k === 'pistol'), `wave 1: ${m.left} pistols`);
await p.screenshot({ path: `${OUT}/v27-wave1.png` });
for (let w = 1; w < 4; w++) { await ev(() => { __game.killWave(); __game.advance(0.4); }); await ev(() => __game.advance(6.5)); }
m = await ev(() => __game.mission);
check(m.wave === 3 && m.hold === 3 && m.kinds.filter((k) => k === 'sniper').length === 3, `wave 4: snipers on the balcony (${m.kinds.join(', ')})`);
await ev(() => __game.advance(3));
const lasers = await ev(() => __game.lasers), sniperY = (await ev(() => __game.enemies())).filter((e) => e.state !== 'dead').map((e) => e.pos[1]);
check(sniperY.filter((y) => y > 3).length === 3, `snipers stand on the ledge (y ${sniperY.join(', ')}); lasers showing: ${lasers}`);
await ev(() => __game.look(Math.PI * 0, 0.25)); await ev(() => __game.advance(0.3));
await p.screenshot({ path: `${OUT}/v27-snipers.png` });
await ev(() => { __game.killWave(); __game.advance(0.5); });
m = await ev(() => __game.mission);
check(m.state === 'done' && (await ev(() => __game.kept)).includes('grapple') && (await ev(() => !document.getElementById('mdone').hidden)), 'mission complete: the grappling hook is yours');
await p.screenshot({ path: `${OUT}/v27-complete.png` });
await ev(() => { document.getElementById('mdoneback').click(); __game.advance(0.3); });
hot = await ev(() => __game.inv.hot.map((x) => x && x.id));
check(!(await ev(() => __game.mission)) && hot.includes('ar'), `back in the sandbox with your own inventory (${hot.join(',')})`);
// failing: retry from the start
await ev(() => { __game.setDifficulty('normal'); __game.startMission('m1'); __game.advance(5); __game.hurt(2, 'bullet'); __game.advance(0.5); });
check(!!(await ev(() => __game.dead)) && (await ev(() => document.getElementById('respawnbtn').textContent)) === 'Retry mission', 'dying in the mission offers a retry');
await ev(() => { __game.respawn(); __game.advance(0.3); });
m = await ev(() => __game.mission);
check(!(await ev(() => __game.dead)) && m && m.wave === -1 && m.state === 'break', 'retry restarts the mission');
await ev(() => { __game.grapplePress(); __game.advance(0.1); });
check((await ev(() => __game.grapple)) !== 'idle', 'the earned grappling hook works in the mission');
await ev(() => { __game.endMission('quit'); __game.setDifficulty('sandbox'); __game.advance(0.3); });

// stims heal
await ev(() => { __game.setDifficulty('normal'); __game.addItem('stim', 2); const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === 'stim'); const t = I.hot[4]; I.hot[4] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(4); __game.advance(1); __game.setHp(0.3); __game.attackPress(); __game.attackRelease(); __game.advance(0.1); });
check(Math.abs((await ev(() => __game.hp)) - 0.8) < 0.02, `a stim heals half (${await ev(() => __game.hp)})`);
// creative catalogue
const k0 = await ev(() => __game.countItem('kyber'));
await ev(() => { __game.toggleInv(true); }); await ev(() => __game.advance(0.1));
await ev(() => document.querySelector('[data-cat="kyber"]').click());
check((await ev(() => __game.countItem('kyber'))) > k0 && (await ev(() => document.querySelectorAll('[data-cat]').length)) >= 21, 'creative: every item, one click adds it');
// attachments from the gun's slot
await ev(() => { const s = document.querySelector('#invhot .slot[data-i="1"]'); s.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, clientX: 10, clientY: 10 })); dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, clientX: 10, clientY: 10 })); });
const attRow = await ev(() => !document.getElementById('invatt').hidden && document.querySelectorAll('#invatt [data-att]').length);
check(attRow === 2, `picking the pistol shows its attachments (${attRow} options)`);
await p.screenshot({ path: `${OUT}/v27-inventory.png` });
await ev(() => { __game.toggleInv(false); __game.setDifficulty('sandbox'); });
const rep = await ev(() => __game.lastReport);
check(!errs.length && !(rep && /error|tpose/.test(rep.kind)), `no page errors or reports (${errs.length}, ${rep && rep.kind + ': ' + rep.detail})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close(); process.exit(fail ? 1 : 0);
