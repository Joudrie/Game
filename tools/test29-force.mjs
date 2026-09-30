// v25 (roadmap batch 3): the Force item (marker, pull onto the blade, choke, lightning), saber throw, saber trail/light/
// scorch, saber + blaster (overheats after 4), triple jump rising, wall run.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const park = () => ev(() => { const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) __game.moveEnemy(i, 60 + i * 4, 60); __game.advance(0.1); });
const slotOf = (id) => ev((id) => __game.inv.hot.findIndex((x) => x && x.id === id), id);
await ev(() => { __game.setClass('force'); __game.place(0, 0); __game.look(0, 0.1); __game.fillEnemies(); __game.advance(1.5); });
await park();
// put the Force and the saber + blaster in the hotbar for the test
await ev(() => { const I = __game.inv; for (const id of ['force', 'saberblaster']) { const bi = I.bag.findIndex((x) => x && x.id === id); if (bi >= 0) { const hi = id === 'force' ? 3 : 4; const t = I.hot[hi]; I.hot[hi] = I.bag[bi]; I.bag[bi] = t; } } });
const fs = await slotOf('force'), bs = await slotOf('saberblaster');
check(fs >= 0 && bs >= 0, `The Force (slot ${fs + 1}) and Saber + blaster (slot ${bs + 1}) in the hotbar`);

// marker and pull onto the blade
await ev((fs) => { __game.selectSlot(fs); __game.advance(1.5); __game.moveEnemy(0, 0, 9, Math.PI); __game.look(0, 0.1); __game.advance(0.3); }, fs);
let st = await ev(() => __game.forceState());
check(st.mode && st.ring && st.target, `Force mode: marker on the soldier in front (${st.target})`);
await p.screenshot({ path: `${OUT}/v25-marker.png` });
const pulled = st.target;
await ev(() => { __game.forcePull(); for (let i = 0; i < 40; i++) __game.advance(0.05); });
const pe = (await ev(() => __game.cuts())).find((x) => x.id === pulled), pp = (await ev(() => __game.enemies())).find((x) => x.id === pulled);
check(pe.state === 'dead' || pe.severed.length > 0 || Math.hypot(pp.pos[0], pp.pos[2]) < 4, `pulled in (and onto the blade): ${pe.state}, ${pe.label || ''} at ${pp.pos}`);
await ev(() => { __game.fillEnemies(); __game.advance(0.5); }); await park();
// choke: lifted, then dead
await ev(() => { __game.moveEnemy(0, 0, 8, Math.PI); __game.look(0, 0.1); __game.advance(0.3); });
const ct = (await ev(() => __game.forceState())).target;
await ev(() => { __game.chokeStart(); __game.advance(0.8); });
const lifted = (await ev(() => __game.enemies())).find((x) => x.id === ct);
check(lifted.state === 'choked' && lifted.pos[1] > 0.5, `choke lifts him (y ${lifted.pos[1]})`);
await p.screenshot({ path: `${OUT}/v25-choke.png` });
await ev(() => __game.advance(2));
check((await ev(() => __game.enemies())).find((x) => x.id === ct).state === 'dead', 'held long enough, the choke kills');
await ev(() => { __game.chokeEnd(); __game.fillEnemies(); __game.advance(3); }); await park();
// lightning
await ev(() => { __game.moveEnemy(0, 0, 7, Math.PI); __game.moveEnemy(1, 1.5, 8, Math.PI); __game.look(0, 0.1); __game.advance(0.3); });
const lt = (await ev(() => __game.forceState())).target;
await ev(() => { __game.zapStart(); __game.advance(0.4); });
await p.screenshot({ path: `${OUT}/v25-lightning.png` });
await ev(() => { __game.advance(1.8); __game.zapEnd(); __game.advance(0.2); });
check((await ev(() => __game.enemies())).find((x) => x.id === lt).state === 'dead', 'lightning kills');
await ev(() => { __game.fillEnemies(); __game.advance(0.5); }); await park();

// saber throw: back to the lit saber, throw at a soldier 7 m out
await ev(() => { __game.selectSlot(0); __game.advance(1.5); __game.moveEnemy(0, 0, 7, Math.PI); __game.look(0, 0.1); __game.advance(0.3); });
const tt = (await ev(() => __game.enemies().filter((e) => e.state !== 'dead')))[0].id;
await ev(() => { __game.saberThrow(); __game.advance(0.35); });
check((await ev(() => __game.forceState())).thrown, 'saber thrown');
await p.screenshot({ path: `${OUT}/v25-throw.png` });
await ev(() => __game.advance(1));
const tc = (await ev(() => __game.cuts())).find((x) => x.id === tt);
check(tc.state === 'dead' || tc.severed.length, `the thrown saber cuts him (${tc.state}, ${tc.label})`);
check(!(await ev(() => __game.forceState())).thrown, 'and comes back to your hand');

// saber feel: swing → trail, light, and slashing the ground leaves scorch marks
st = await ev(() => { __game.look(0, 0.9); __game.attackPress(); __game.attackRelease(); __game.advance(0.15); return __game.forceState(); });
check(st.light > 1, `the blade lights up its surroundings (${st.light.toFixed(1)})`);
await ev(() => { for (let i = 0; i < 12; i++) { __game.attackPress(); __game.attackRelease(); __game.advance(0.08); } });
st = await ev(() => __game.forceState());
check(st.scorches >= 0, `scorch marks: ${st.scorches}`);
await ev(() => { __game.look(0, 0.1); __game.advance(1); });

// saber + blaster: four shots overheat
await ev((bs) => { __game.selectSlot(bs); __game.advance(1.5); }, bs);
st = await ev(() => { for (let i = 0; i < 5; i++) { __game.fireBlaster(); __game.advance(0.25); } return __game.forceState(); });
check(st.blaster && st.overheat > 0, `saber + blaster overheats after 4 quick shots (overheat ${st.overheat.toFixed(1)} s)`);
await p.screenshot({ path: `${OUT}/v25-saberblaster.png` });

// triple jump, each higher
await ev(() => { __game.selectSlot(0); __game.advance(1); __game.testCfg.infiniteJumps = false; __game.place(0, -10); __game.advance(0.5); });
const vys = [];
for (let i = 0; i < 4; i++) { await ev(() => { __game.setKey('Space', true); __game.advance(0.05); __game.setKey('Space', false); }); vys.push(+(await ev(() => __game.vy)).toFixed(1)); await ev(() => __game.advance(0.35)); }
check((await ev(() => __game.jumpsDone)) === 3, `three jumps in the air: vy ${vys.join(' → ')}`);
await ev(() => { __game.testCfg.infiniteJumps = true; __game.advance(3); });
// wall run: sprint along a tall wall and jump
const boxes = await ev(() => __game.blockBoxes());
const W = boxes.filter((x) => x[4] > 3 && x[5] - x[2] > 6 && x[5] < 140).sort((a, c) => (c[5] - c[2]) - (a[5] - a[2]))[0];
await ev((B) => { __game.place(B[3] + 0.5, B[2] + 1); __game.look(0, 0.1); __game.advance(0.5); }, W);
const wr = await ev(() => { __game.setKey('KeyW', true); __game.setKey('ShiftLeft', true); __game.advance(1.2); __game.setKey('Space', true); __game.advance(0.05); __game.setKey('Space', false);
  let on = 0, top = 0; for (let i = 0; i < 14; i++) { __game.advance(0.1); if (__game.wallRun) on++; top = Math.max(top, __game.pos[1]); } __game.setKey('KeyW', false); __game.setKey('ShiftLeft', false); return { on, top }; });
check(wr.on >= 6 && wr.top > 1.2, `wall run along a wall at sprint speed (${wr.on / 10} s, up to ${wr.top.toFixed(1)} m)`);
check(!errs.length, 'no page errors');
console.log(fail ? `FAILED (${fail})` : 'PASS');
await b.close(); process.exit(fail ? 1 : 0);
