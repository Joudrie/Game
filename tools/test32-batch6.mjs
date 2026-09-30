// v28 (batch 6): throwables (sticky, fire, teleport orb), dash strike, grapple yank, finishers, grapple swing,
// Mission 2 (hold the courtyard for 3 minutes; the jetpack is the reward and works in missions).
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const park = () => ev(() => { __game.fillEnemies(); __game.advance(0.2); const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { __game.moveEnemy(i, 60 + i * 4, 60); __game.setMind(i, 'patrol', 999); } __game.advance(0.1); });
const put = (i, x, z, yawR) => ev(([i, x, z, yawR]) => { __game.moveEnemy(i, x, z, yawR); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, yawR); }, [i, x, z, yawR]);
const idOf = async (i) => (await ev(() => __game.minds().filter((m) => m.state !== 'dead')))[i].id;
const cut = async (id) => (await ev(() => __game.cuts())).find((c) => c.id === id);
await ev(() => { __game.setDifficulty('sandbox'); __game.place(0, 0); __game.look(0, 0.1); __game.advance(1); });
const counts = await ev(() => ['sticky', 'firenade', 'orb'].map((id) => __game.countItem(id)));
check(counts[0] >= 3 && counts[1] >= 2 && counts[2] >= 2, `new throwables handed out (sticky ${counts[0]}, fire ${counts[1]}, orb ${counts[2]})`);

// sticky: sticks to a soldier and kills him
await park(); await put(0, 0, 8, Math.PI); const s0 = await idOf(0);
await ev(() => { __game.stickOn(0); __game.advance(0.5); });
const go = await ev(() => __game.grenadesOut);
check(go.length === 1 && go[0].stuck && go[0].on === s0, `sticky grenade stuck on the soldier (${JSON.stringify(go)})`);
await p.screenshot({ path: `${OUT}/v28-sticky.png` });
await ev(() => __game.advance(1.5));
check((await cut(s0)).state === 'dead' && (await ev(() => __game.grenadesOut)).length === 0, `it goes off and kills him (${(await cut(s0)).severed.join(', ')})`);
// a thrown sticky grabs whatever it hits
await ev(() => { __game.look(0, 0.2); __game.throwKind('sticky'); for (let i = 0; i < 30 && !__game.grenadesOut.some((g) => g.stuck); i++) __game.advance(0.05); });
const go2 = await ev(() => __game.grenadesOut);
check(go2.length === 1 && go2[0].kind === 'sticky' && go2[0].stuck, `a thrown sticky sticks where it lands (${JSON.stringify(go2)})`);
await ev(() => __game.advance(2));

// fire: soldiers catch fire and die; boards burn through; it hurts you
await park(); await put(0, 0, 10, Math.PI); const f0 = await idOf(0);
const fp = (await ev(() => __game.enemies())).find((e) => e.id === f0).pos;
await ev((q) => { __game.firePatch(q[0], q[2]); __game.advance(0.4); }, fp);
check((await ev(() => __game.burning())) === 1, 'the soldier in the fire catches fire');
await p.screenshot({ path: `${OUT}/v28-fire.png` });
await ev(() => __game.advance(3));
check((await cut(f0)).state === 'dead' && (await cut(f0)).label === 'Burned', `he runs about, then drops (${(await cut(f0)).label})`);
await ev(() => { __game.setDifficulty('normal'); __game.setHp(1); const q = __game.pos; __game.firePatch(q[0], q[2]); __game.advance(1); });
const hf = await ev(() => __game.hp);
check(hf < 0.9, `standing in fire hurts (${hf})`);
await ev(() => { __game.place(0, -20); __game.setDifficulty('sandbox'); __game.advance(9); });
await ev(() => { __game.goCourt(-12, 1.5); __game.advance(0.3); const w0 = __game.broken.wood || 0; const c = __game.courtAt(-12, 3); __game.firePatch(c[0], c[2] - 0.6); __game.advance(4.5); window.__w = [w0, __game.broken.wood]; });
const wb = await ev(() => window.__w);
check(wb[1] > wb[0], `boards in the fire burn through (${wb[1] - wb[0]})`);
await ev(() => { __game.place(0, 0); __game.advance(5); });

// teleport orb
const t0 = await ev(() => __game.pos);
await ev(() => { __game.look(0, 0.25); __game.throwKind('orb'); for (let i = 0; i < 30; i++) __game.advance(0.05); });
const t1 = await ev(() => __game.pos);
check(Math.hypot(t1[0] - t0[0], t1[2] - t0[2]) > 4, `the orb takes you where it lands (${t0} → ${t1})`);
// X throws the one you picked last
await ev(() => { const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === 'firenade'); const t = I.hot[5]; I.hot[5] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(5); __game.advance(0.3); __game.selectSlot(0); __game.advance(0.3); });
check((await ev(() => __game.lastNade)) === 'fire', 'X throws the throwable you picked last (fire)');

// dash strike: sprint at a soldier and attack
await ev(() => { __game.place(0, 0); __game.look(0, 0.1); __game.setGear('lit'); __game.advance(1.5); });
await park(); await put(0, 0, 11, Math.PI); const d0 = await idOf(0);
await ev(() => { __game.setKey('KeyW', true); __game.setKey('ShiftLeft', true); __game.advance(0.8); });
const dt0 = await ev(() => __game.dashTarget());
await ev(() => { __game.attackPress(); __game.attackRelease(); __game.setKey('KeyW', false); __game.setKey('ShiftLeft', false); __game.advance(0.1); });
await p.screenshot({ path: `${OUT}/v28-dash.png` });
await ev(() => __game.advance(0.8));
check(dt0 === d0 && (await ev(() => __game.dashes)) === 1 && (await cut(d0)).state === 'dead', `dash strike across the gap: ${(await cut(d0)).label}`);

// grapple yank: hold right click and grapple a soldier
await park(); await ev(() => { __game.place(0, 0); __game.look(0, 0.05); __game.advance(0.5); }); await put(0, 0, 14, Math.PI); const y0 = await idOf(0);
await ev(() => { __game.setRmb(true); __game.grapplePress(); for (let i = 0; i < 24; i++) __game.advance(0.05); __game.setRmb(false); });
const yp = (await ev(() => __game.enemies())).find((e) => e.id === y0), yc = await cut(y0);
check((await ev(() => __game.yanks)) === 1 && (yc.state === 'dead' || Math.hypot(yp.pos[0], yp.pos[2] - (await ev(() => __game.pos))[2]) < 4), `grapple yank pulls him to you (${yc.state}${yc.label ? ', ' + yc.label : ''})`);

// finisher on a soldier who's down
await park(); await ev(() => { __game.place(0, 0); __game.advance(0.3); }); await put(0, 0, 1.4, Math.PI); const c0 = await idOf(0);
await ev(() => { __game.cutEnemy(0, 'thigh_l'); __game.advance(0.4); });
const lbl = await ev(() => __game.tdLabel), tgt = await ev(() => __game.tdTarget);
check(tgt === c0 && lbl === 'Finisher', `a crawling soldier offers a finisher (${lbl})`);
await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(1); });
check(/Finisher/.test((await cut(c0)).label || ''), `finisher (${(await cut(c0)).label})`);

// grapple swing
const tall = (await ev(() => __game.blockBoxes())).filter((q) => q[4] >= 11 && q[5] < 140 && q[1] < 0.1).sort((a, c) => Math.hypot((a[0] + a[3]) / 2, a[2]) - Math.hypot((c[0] + c[3]) / 2, c[2]))[0];
await ev((q) => { __game.setGadget('swing', true); __game.setGear('none'); __game.place((q[0] + q[3]) / 2, q[2] - 7); __game.look(0, -0.45); __game.advance(0.6); __game.grapplePress(); __game.advance(0.6); }, tall);
const sw = await ev(() => ({ swing: __game.swing, st: __game.grappleState, y: __game.pos[1] }));
await ev(() => __game.advance(0.6));
await p.screenshot({ path: `${OUT}/v28-swing.png` });
const sw2 = await ev(() => __game.pos);
await ev(() => { __game.setKey('Space', true); __game.advance(0.05); __game.setKey('Space', false); __game.advance(0.1); });
check(sw.swing && (await ev(() => __game.grappleState)) === 'idle', `grapple swing on a high hook, jump lets go (${JSON.stringify(sw)}, then ${sw2})`);
await ev(() => { __game.setGadget('swing', false); __game.advance(2); });

// Mission 2: hold out, win the jetpack, use it in a mission
await ev(() => { __game.forgetKept(); __game.startMission('m2'); __game.advance(5); });
let m = await ev(() => __game.mission);
check(m.state === 'fight', 'Mission 2 starts after 4 s');
await ev(() => __game.advance(12));
m = await ev(() => __game.mission);
check(m.left >= 3, `reinforcements keep coming (${m.left} on the field)`);
await p.screenshot({ path: `${OUT}/v28-hold.png` });
await ev(() => { __game.missionClock(0.5); __game.advance(1); });
m = await ev(() => __game.mission);
check(m.state === 'done' && (await ev(() => __game.kept)).includes('jetpack'), 'held out: the jetpack is yours');
await ev(() => { document.getElementById('mdoneagain').click(); __game.advance(0.5); __game.setKey('Space', true); __game.advance(0.1); __game.setKey('Space', false); __game.advance(0.15); __game.setKey('Space', true); __game.advance(0.6); });
const jm = await ev(() => __game.mode);
await ev(() => { __game.setKey('Space', false); __game.advance(2); __game.endMission('quit'); __game.advance(0.3); });
check(jm === 'jet', `the earned jetpack works in the mission (${jm})`);
const rep = await ev(() => __game.lastReport);
check(!errs.length && !(rep && /error|tpose/.test(rep.kind)), `no page errors or reports (${errs.length}, ${rep && rep.kind + ': ' + rep.detail})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close(); process.exit(fail ? 1 : 0);
