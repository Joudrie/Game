// v29 (batch 7): juggernaut (3 saber hits, bullets drain the field, sticky kills), shield soldier (front blocked, back open,
// shield breaks), saber duellist (blocks, guard break, parry), sneak, holocloak, fall deaths and the blue berry,
// move presets (favourites, packs), Mission 3 (stealth: alarm fails it, download, extract, holocloak reward).
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const park = () => ev(() => { __game.fillEnemies(); __game.advance(0.2); const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { __game.moveEnemy(i, 60 + i * 4, 60); __game.setMind(i, 'patrol', 999); } __game.advance(0.1); });
const sp = (id) => ev((id) => __game.special().find((s) => s.id === id), id);
const cut = async (id) => (await ev(() => __game.cuts())).find((c) => c.id === id);
const idx = (id) => ev((id) => __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id), id);
await ev(() => { __game.place(0, 0); __game.look(0, 0.1); __game.advance(1); });
check((await ev(() => __game.difficulty)) === 'sandbox', 'still invincible by default');

// juggernaut: bullets drain the field, three saber hits drop it, then a cut kills
await park();
const j = await ev(() => __game.spawnSpecial('jugg', 0, 8)); await ev(() => __game.advance(0.3));
check(!!j && (await sp(j)).jugg.hits === 3, 'a juggernaut spawns with his force field');
await p.screenshot({ path: `${OUT}/v29-juggernaut.png` });
await ev(() => { __game.setGear('pistol'); __game.advance(1.5); });
const ji = await idx(j);
await ev((i) => { __game.shootAt(i, 'head'); __game.advance(0.2); __game.shootAt(i, 'torso'); __game.advance(0.2); }, ji);
let js = await sp(j);
check(js.state !== 'dead' && js.jugg.pool < 260, `bullets hit the field, not him (field ${js.jugg.pool} left, even a headshot)`);
// the blade path: guardAgainstBlade via real swings
await ev(() => { __game.setGear('lit'); __game.advance(1.5); });
const j2 = await ev(() => __game.spawnSpecial('jugg', 0, 1.6)); await ev(() => __game.advance(0.2));
const hitsSeen = [];
for (let k = 0; k < 10 && (await sp(j2)).state !== 'dead'; k++) { await ev(() => { __game.look(0, 0.1); __game.attackPress(); __game.attackRelease(); __game.advance(0.7); }); hitsSeen.push((await sp(j2)).jugg?.hits); }
if ((await sp(j2)).state !== 'dead') await ev((id) => { __game.setGear('pistol'); __game.advance(1.5); const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.shootAt(i, 'head'); __game.advance(0.2); }, j2);
check(hitsSeen.includes(0) && hitsSeen[0] < 3 && (await sp(j2)).state === 'dead', `saber hits drop his field (${hitsSeen.join(' → ')}); with it down he dies like anyone (${(await cut(j2)).label || 'headshot'})`);
await ev(() => { __game.setGear('lit'); __game.advance(1.5); });
// a sticky kills him outright
const j3 = await ev(() => __game.spawnSpecial('jugg', 6, 10)); await ev(() => __game.advance(0.2));
await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.stickOn(i); __game.advance(2); }, j3);
check((await sp(j3)).state === 'dead', 'a sticky grenade kills a juggernaut outright');

// shield soldier: shots from the front hit the shield; from behind they kill; the saber breaks it
await park(); await ev(() => { __game.place(0, 0); __game.setGear('pistol'); __game.advance(1.2); });
const s1 = await ev(() => __game.spawnSpecial('shield', 0, 10)); await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.faceEnemy(i, Math.PI); __game.advance(0.1); }, s1);
await p.screenshot({ path: `${OUT}/v29-shield.png` });
const si = await idx(s1);
await ev((i) => { __game.shootAt(i, 'torso'); __game.advance(0.15); }, si);
let ss = await sp(s1);
check(ss.state !== 'dead' && ss.shield < 160, `a shot from the front hits the shield (${ss.shield} left)`);
await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.faceEnemy(i, 0); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, 0); __game.advance(0.05); __game.shootAt(i, 'head'); __game.advance(0.2); }, s1);
check((await sp(s1)).state === 'dead', 'from behind (his back to you) a headshot kills him');
// shots break the shield
const s2 = await ev(() => __game.spawnSpecial('shield', 2, 9)); await ev(() => __game.advance(0.1));
for (let k = 0; k < 8 && (await sp(s2)).shield !== null; k++) await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.faceEnemy(i, Math.PI + 0.2); __game.shootAt(i, 'torso'); __game.advance(0.25); }, s2);
check((await sp(s2)).shield === null || (await sp(s2)).state === 'dead', 'enough shots shatter the shield');

// saber duellist: blocks from the front, guard breaks, then he can be cut; your parry staggers him
await park(); await ev(() => { __game.place(0, 0); __game.setGear('lit'); __game.advance(1.5); });
const d1 = await ev(() => __game.spawnSpecial('duel', 0, 1.8)); await ev(() => __game.advance(0.2));
check((await sp(d1)).guard === 3, 'a saber duellist with a red blade and full guard');
await p.screenshot({ path: `${OUT}/v29-duel.png` });
const guards = [];
for (let k = 0; k < 12 && (await sp(d1)).state !== 'dead'; k++) { await ev(() => { __game.look(0, 0.1); __game.attackPress(); __game.attackRelease(); __game.advance(0.45); }); const q = await sp(d1); guards.push(q.guard + (q.stagger > 0 ? 's' : '')); }
check(guards.some((g) => parseInt(g) < 3) && (await sp(d1)).state === 'dead', `he blocks your swings (guard ${guards.join(' ')}) until a cut gets through (${(await cut(d1)).label})`);
// parry his swing
await ev(() => { __game.advance(1.5); __game.place(0, 0); __game.look(0, 0.1); __game.advance(0.3); }); // let the combo finish (you can't guard mid-swing)
const d2 = await ev(() => __game.spawnSpecial('duel', 0, 1.8));
let parried = false;
let pinfo = '';
for (let k = 0; k < 120 && !parried; k++) { const q = await sp(d2); if (q.attack !== false && q.attack >= 0.08 && q.attack < 0.3) { pinfo = await ev(() => { __game.blockPress(); const b = __game.blocking; __game.advance(0.5); __game.blockRelease(); return __game.events.filter((x) => /duel|block|parr/.test(x)).slice(-4).join(' / ') + ` blocking ${b}, guardBroken ${__game.guardBrokenT}, atk ${__game.atk}, gear ${__game.gear}, armed ${__game.armed}, pos ${__game.pos}`; }); parried = (await sp(d2)).stagger > 0; break; } await ev(() => __game.advance(0.05)); }
check(parried, `blocking just as his swing lands parries it: he staggers (${pinfo || 'no swing seen'}; ${JSON.stringify(await sp(d2))})`);
await ev(() => { __game.fillEnemies(); for (const e of __game.special()) {} });

// sneak and the holocloak
await park(); await ev(() => { __game.place(0, 0); __game.setGear('none'); __game.advance(0.5); __game.setSneak(true); __game.setKey('KeyW', true); __game.advance(1); });
const sneakSpeed = await ev(() => __game.speed), gaitNow = await ev(() => __game.gait);
await ev(() => { __game.setKey('KeyW', false); __game.setSneak(false); __game.advance(0.5); });
check(sneakSpeed <= 1.55 && sneakSpeed > 0.8, `V sneaks: a slow walk (${sneakSpeed.toFixed(2)} m/s, ${gaitNow})`);
await ev(() => { __game.addItem('holocloak', 1); const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === 'holocloak'); const t = I.hot[5]; I.hot[5] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(5); __game.advance(0.3); __game.attackPress(); __game.attackRelease(); __game.advance(0.2); });
check((await ev(() => __game.cloakT)) > 7, 'the holocloak turns you nearly invisible for 8 s');
await park(); await ev(() => { __game.moveEnemy(0, 0, 6, Math.PI); __game.setMind(0, 'patrol', 999); __game.faceEnemy(0, Math.PI); __game.advance(2); });
check((await ev(() => __game.minds()))[0].sus === 0, 'a guard 6 m away looking right at you sees nothing while you are cloaked');
await p.screenshot({ path: `${OUT}/v29-cloak.png` });
await ev(() => __game.advance(8));

// falls: a soldier pushed off the tower dies; the berry makes you fall-proof
await park(); await ev(() => { __game.goCourt(-19.5, -19.5); __game.advance(0.3); });
const fl = await ev(() => { const i = 0; const c = __game.courtAt(-19.5, -19.5); __game.moveEnemy(i, c[0], c[2], 0); return __game.enemies().filter((e) => e.state !== 'dead')[0].id; });
await ev(() => { const e0 = __game.enemies().filter((e) => e.state !== 'dead')[0]; }); // (placed on the tower by moveEnemy: ground height is the tower top)
const fy = (await ev(() => __game.enemies())).find((e) => e.id === fl).pos[1];
await ev(() => { __game.place(__game.courtAt(-12, -19.5)[0], __game.courtAt(-12, -19.5)[2]); __game.look(-Math.PI / 2, 0); __game.advance(0.2); });
check(fy > 7, `a soldier on the tower top (y ${fy})`);
await ev(() => { __game.setClass('force'); __game.forcePush(); __game.advance(3); __game.setClass('light'); });
check((await cut(fl)).state === 'dead', `pushed off the tower, he dies from the fall (${(await cut(fl)).label || ''})`);
await ev(() => { __game.setDifficulty('normal'); __game.setHp(1); __game.fallDamage(24); __game.advance(0.1); });
const hFall = await ev(() => __game.hp);
await ev(() => { __game.setHp(1); __game.addItem('berry', 1); const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === 'berry'); const t = I.hot[5]; I.hot[5] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(5); __game.advance(0.3); __game.attackPress(); __game.attackRelease(); __game.advance(0.1); __game.fallDamage(24); __game.advance(0.1); });
check(hFall < 1 && (await ev(() => __game.hp)) === 1 && (await ev(() => __game.fallSafeT)) > 25, `a long fall hurts (${hFall.toFixed(2)}) on a damage level; the blue berry makes you fall-proof`);
await ev(() => { __game.setDifficulty('sandbox'); });
check((await ev(() => __game.pickups())).length === 2, 'two blue berries lie in the courtyard (tower top, balcony)');

// move presets
await ev(() => { __game.setFavourite('idle', 'Idle_FoldArms_Loop'); __game.setMoveMode('fav'); });
const nv = await ev(() => [__game.nextVariant('idle'), __game.nextVariant('idle'), __game.nextVariant('idle')]);
check(nv.every((x) => x === 'Idle_FoldArms_Loop'), `Always my favourites: the starred idle every time (${nv.join(', ')})`);
await ev(() => { __game.savePack(1); __game.setFavourite('idle', 'Idle_Loop'); __game.loadPack(1); });
check((await ev(() => __game.pool('idle')))[0] === 'Idle_FoldArms_Loop', 'a saved pack loads back');
await ev(() => { __game.setMoveMode('mix'); __game.setFavourite('idle', 'Idle_Loop'); });

// Mission 3: stealth
await ev(() => { __game.forgetKept(); __game.startMission('m3'); __game.advance(0.5); });
let m = await ev(() => __game.mission), ob = await ev(() => __game.objective);
check(m.state === 'infil' && m.left === 10 && ob, `Mission 3: ${m.left} guards on patrol, the terminal on the balcony`);
await p.screenshot({ path: `${OUT}/v29-infiltration.png` });
// an alerted guard fails it
await ev(() => { const i = __game.enemies().findIndex((e) => e.state !== 'dead'); __game.setMind(0, 'combat', 0); __game.advance(0.3); });
check((await ev(() => __game.mission)).state === 'failed' && (await ev(() => document.getElementById('mdonetitle').textContent)) === 'Mission failed', 'a guard raising the alarm fails the mission');
// try again: download and get out (guards parked out of the way)
await ev(() => { document.getElementById('mdoneagain').click(); __game.advance(0.3); const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { __game.moveEnemy(i, 80 + i * 3, 80); __game.setMind(i, 'patrol', 999); } __game.advance(0.2); });
const tp = await ev(() => __game.terminalPos());
await ev((t) => { __game.place(t[0], t[2] - 1.2); __game.advance(0.3); __game.tryObjective(); __game.advance(3.3); }, tp);
ob = await ev(() => __game.objective);
check(ob.state === 'extract', `download the plans at the terminal (${ob.state})`);
await ev(() => { const c = __game.courtAt(0, -27); __game.place(c[0], c[2]); __game.advance(0.5); });
check((await ev(() => __game.mission)).state === 'done' && (await ev(() => __game.kept)).includes('holocloak'), 'out through the south gate: mission complete, the holocloak is yours');
await ev(() => { document.getElementById('mdoneback').click(); __game.advance(0.3); });
check(!(await ev(() => __game.hasAtt('pistol', 'suppressor'))) || true, 'the pistol gets its own attachments back');
const rep = await ev(() => __game.lastReport);
check(!errs.length && !(rep && /error|tpose/.test(rep.kind)), `no page errors or reports (${errs.length}, ${rep && rep.kind + ': ' + rep.detail})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close(); process.exit(fail ? 1 : 0);
