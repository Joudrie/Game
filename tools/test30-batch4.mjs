// v26 (roadmap batch 4): soldiers on patrol who notice you and shout, silent kills before the shout, panic on seeing a
// death, gunfire alerts, stealth takedowns, your health (difficulty, regen), death as a ragdoll, your own grenade,
// ragdoll soldiers, snap-to-cover with peeking.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const alive = () => ev(() => __game.minds().filter((m) => m.state !== 'dead'));
// park every living soldier far away, calm and waiting
const park = () => ev(() => { const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { __game.moveEnemy(i, 60 + i * 4, 60); __game.setMind(i, 'patrol', 999); } __game.advance(0.1); });
// put soldier i at (x, z) facing yawR, calm, standing still for `wait` s
const put = (i, x, z, yawR, wait = 999) => ev(([i, x, z, yawR, wait]) => { __game.moveEnemy(i, x, z, yawR); __game.setMind(i, 'patrol', wait); __game.faceEnemy(i, yawR); }, [i, x, z, yawR, wait]);
const mindOf = async (i) => (await alive())[i];

await ev(() => { __game.setDifficulty('normal'); __game.place(0, 0); __game.look(0, 0.1); __game.fillEnemies(); __game.advance(1); });
let ms = await alive();
check(ms.length >= 5 && ms.every((m) => m.mind === 'patrol'), `soldiers start on patrol (${ms.map((m) => m.mind).join(', ')})`);
const p0 = (await ev(() => __game.enemies())).filter((e) => e.state !== 'dead').map((e) => e.pos);
await ev(() => __game.advance(6));
const p1 = (await ev(() => __game.enemies())).filter((e) => e.state !== 'dead').map((e) => e.pos);
check(p1.some((q, i) => Math.hypot(q[0] - p0[i][0], q[2] - p0[i][2]) > 1), 'patrolling soldiers walk about');

// spotted: a soldier facing you 8 m away notices, shows ! and shouts; everyone near joins
await park();
await put(0, 0, 8, Math.PI); await put(1, 3, 14, Math.PI);
let spotT = null;
for (let t = 0; t < 4; t += 0.1) { await ev(() => __game.advance(0.1)); const m = await mindOf(0); if (m.mind === 'spot') { spotT = t; break; } }
check(spotT !== null && (await mindOf(0)).mark === '!', `he notices you at 8 m after ${spotT?.toFixed(1)} s and shows !`);
await p.screenshot({ path: `${OUT}/v26-spotted.png` });
const a0 = await ev(() => __game.alarms);
await ev(() => __game.advance(1.5));
ms = await alive();
check(ms[0].mind === 'combat' && ms[1].mind === 'combat' && (await ev(() => __game.alarms)) === a0 + 1, `his shout brings the squad (${ms[0].mind}, ${ms[1].mind})`);

// killed before the shout ends: nobody knows
await park();
await put(0, 0, 8, Math.PI); await put(1, 5, 30, 0);
for (let t = 0; t < 4; t += 0.1) { await ev(() => __game.advance(0.1)); if ((await mindOf(0)).mind === 'spot') break; }
const a1 = await ev(() => __game.alarms);
await ev(() => { __game.damageEnemy(0, 999, 'head', 'stealth'); __game.advance(2); });
check((await ev(() => __game.alarms)) === a1 && (await alive())[0].mind === 'patrol', 'killed mid-shout: no alarm, the other guard stays calm');

// a calm guard who sees someone die panics, then shouts
await ev(() => { __game.fillEnemies(); __game.advance(0.2); }); await park();
await put(0, 0, 12, 0); await put(1, 4, 12, -Math.PI / 2);
const watcher = (await alive())[1].id;
await ev(() => { __game.damageEnemy(0, 999, 'torso', 'stealth'); __game.advance(0.2); });
let w = (await ev(() => __game.minds())).find((m) => m.id === watcher);
check(w.mind === 'panic', `the guard who saw it panics (${w.mind})`);
await ev(() => __game.advance(3.5));
w = (await ev(() => __game.minds())).find((m) => m.id === watcher);
check(w.mind === 'combat', `then shouts and fights (${w.mind})`);

// gunfire carries: a calm soldier 25 m away hears the pistol
await ev(() => { __game.fillEnemies(); __game.advance(0.2); }); await park();
await put(0, 25, 0, 0);
await ev(() => { __game.setGear('pistol'); __game.advance(1.5); __game.look(Math.PI, 0.1); __game.firePistol(); __game.advance(0.3); });
check((await mindOf(0)).mind === 'combat', 'a pistol shot alerts a soldier 25 m away');
await ev(() => { __game.setGear('none'); __game.advance(1); });

// stealth takedown from behind
await park();
await put(0, 0, 1.3, 0);
await ev(() => { __game.look(0, 0.1); __game.advance(0.3); });
const td = await ev(() => __game.tdTarget);
check(!!td, `behind an unaware soldier: takedown offered (${td})`);
await p.screenshot({ path: `${OUT}/v26-takedown-prompt.png` });
const a2 = await ev(() => __game.alarms);
await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.2); });
await p.screenshot({ path: `${OUT}/v26-takedown.png` });
await ev(() => __game.advance(1));
const tk = (await ev(() => __game.cuts())).find((c) => c.id === td);
console.log(JSON.stringify(tk)); check(tk.state === 'dead' && /Takedown/.test(tk.label) && (await ev(() => __game.alarms)) === a2, `takedown: silent kill (${tk.label})`);
// facing you: no takedown
await ev(() => { __game.fillEnemies(); __game.advance(0.2); }); await park();
await put(0, 0, 1.3, Math.PI);
await ev(() => __game.advance(0.3));
check(!(await ev(() => __game.tdTarget)), 'no takedown from the front');

// health: hits by difficulty, slow regen
await park();
await ev(() => { __game.hurt(0.3); __game.advance(3); });
const h1 = await ev(() => __game.hp);
await ev(() => __game.advance(3));
const h2 = await ev(() => __game.hp);
check(Math.abs(h1 - 0.7) < 0.01 && h2 > h1 + 0.1, `hurt to ${h1}, no regen for 4 s, then back to ${h2}`);
// a bolt that reaches you hurts
await ev(() => { __game.advance(8); __game.setGear('none'); __game.advance(1); });
await put(0, 0, 10, Math.PI); await ev(() => __game.setMind(0, 'combat', 0));
await ev(() => { __game.enemyBolt(0); __game.advance(0.6); });
const h3 = await ev(() => __game.hp);
check(h3 < 0.9, `a bolt hits you: health ${h3} (Normal: about 7 hits)`);
await park();

// death: your body goes limp, the camera watches, respawn
await ev(() => { __game.hurt(2, 'bullet'); __game.advance(0.1); });
let d = await ev(() => __game.dead);
check(!!d && d.rag, `dead: ragdoll (${JSON.stringify(d)})`);
await ev(() => __game.advance(3));
d = await ev(() => __game.dead);
check(d.pelvis[1] < 0.45, `the body falls and lies down (hips at ${d.pelvis[1]} m)`);
await p.screenshot({ path: `${OUT}/v26-dead.png` });
check(await ev(() => !document.getElementById('deathpanel').hidden), 'death panel with Respawn');
await ev(() => { __game.respawn(); __game.advance(0.5); });
check(!(await ev(() => __game.dead)) && (await ev(() => __game.hp)) === 1, 'respawned at full health');

// your own grenade at your feet blows you apart
await ev(() => { const q = __game.pos; __game.explodeAt(q[0] + 0.8, 0.2, q[2]); __game.advance(0.1); });
d = await ev(() => __game.dead);
check(!!d && d.kind === 'explosion' && d.severed.length >= 2, `own grenade: blown apart (${d && d.severed.join(', ')})`);
await ev(() => __game.advance(1.2));
await p.screenshot({ path: `${OUT}/v26-own-grenade.png` });
await ev(() => { __game.respawn(); __game.advance(0.5); });

// soldiers killed by a blast go limp and settle
await ev(() => { __game.fillEnemies(); __game.advance(0.2); }); await park();
await put(0, 0, 12, Math.PI);
const victim = (await alive())[0].id;
await ev(() => { __game.explodeAt(0.5, 0.3, 11.5); __game.advance(0.4); });
await p.screenshot({ path: `${OUT}/v26-ragdoll-air.png` });
await ev(() => __game.advance(5));
const vm = (await ev(() => __game.minds())).find((m) => m.id === victim), vi = (await ev(() => __game.minds())).findIndex((m) => m.id === victim);
const vp = await ev((i) => __game.ragPelvis(i), vi);
check(vm.state === 'dead' && vm.rag && vp[1] < 0.5, `blast victim is a ragdoll lying at ${vp}`);
await ev((vp) => { __game.setDebugCam([vp[0] + 2.5, 1.6, vp[2] + 2.5], [vp[0], 0.3, vp[2]]); __game.advance(0.05); }, vp);
await p.screenshot({ path: `${OUT}/v26-ragdoll-rest.png` });
await ev(() => __game.setDebugCam(null));
check(vm.state === 'dead' && (await ev(() => __game.hp)) === 1, 'a blast 12 m away leaves you unhurt');

// cover: snap to a crate, slide along it, peek out
const boxes = await ev(() => __game.blockBoxes());
const bx = boxes.filter((q) => q[1] < 0.1 && q[4] > 0.9).sort((a, c) => Math.hypot((a[0] + a[3]) / 2, (a[2] + a[5]) / 2) - Math.hypot((c[0] + c[3]) / 2, (c[2] + c[5]) / 2))[0];
const cx = (bx[0] + bx[3]) / 2, fz = bx[2] - 0.7; // stand just off the box's -z face
await ev(([x, z]) => { __game.place(x, z); __game.look(0, 0.15); __game.advance(0.3); }, [cx, fz]);
const inCover = await ev(() => __game.enterCover());
await ev(() => __game.advance(0.4));
let cv = await ev(() => __game.cover);
check(inCover && cv, `Q next to a box (${bx.map((v) => v.toFixed(1)).join(',')}) snaps into ${cv && (cv.low ? 'low' : 'tall')} cover`);
const u0 = cv.u;
await ev(() => { __game.setKey('KeyD', true); __game.advance(0.6); __game.setKey('KeyD', false); __game.advance(0.1); });
cv = await ev(() => __game.cover);
check(cv && Math.abs(cv.u - u0) > 0.4, `A/D slides along it (${u0} → ${cv && cv.u})`);
await p.screenshot({ path: `${OUT}/v26-cover.png` });
await ev(() => { __game.setGear('pistol'); __game.advance(1.2); __game.setAim(true); __game.advance(0.5); });
cv = await ev(() => __game.cover);
check(cv && cv.peek > 0.9, `right-click peeks out (${cv && cv.peek}, ${cv && (cv.low ? 'stands up over it' : 'edge ' + cv.edge)})`);
await p.screenshot({ path: `${OUT}/v26-peek.png` });
await ev(() => { __game.setAim(false); __game.advance(0.3); __game.leaveCover('test'); __game.advance(0.2); });
check(!(await ev(() => __game.cover)), 'Q again leaves cover');

// Sandbox: nothing hurts
await ev(() => { __game.setDifficulty('sandbox'); __game.hurt(0.5); __game.advance(0.1); });
check((await ev(() => __game.hp)) === 1, 'Sandbox: no damage');
const rep = await ev(() => __game.lastReport);
check(!errs.length && !(rep && /error|tpose/.test(rep.kind)), `no page errors or reports (${errs.length}, ${rep && rep.kind + ': ' + rep.detail})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close(); process.exit(fail ? 1 : 0);
