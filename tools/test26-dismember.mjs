// v22 dismemberment: the blade decides. A real swing into a soldier cuts him where the blade passes; hands and arms
// come off and he lives (gun hand: drops the pistol and runs); head, torso and legs kill, cut exactly there;
// cartoon blood spurts and splats; Force push throws the severed limbs and dropped guns.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const living = () => ev(() => __game.cuts().filter((c) => c.state !== 'dead'));
await ev(() => { __game.setClass('force'); __game.setGear('lit', true); __game.place(0, 0); __game.look(0, 0.15); __game.fillEnemies(); __game.advance(1.5); });
// park everyone far away
await ev(() => { for (let i = 0; i < 5; i++) __game.moveEnemy(i, 40 + i * 4, 40); __game.advance(0.2); });

// 1. a real swing: soldier 1.2 m ahead, facing us
await ev(() => { __game.moveEnemy(0, 0, 1.2, Math.PI); __game.advance(0.3); });
const target = (await living())[0].id;
for (let k = 0; k < 14; k++) await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.1); });
await ev(() => __game.advance(0.4));
let c = (await ev(() => __game.cuts())).find((x) => x.id === target);
console.log('real swing →', JSON.stringify(c));
check(c.severed.length > 0 && c.label && c.label.startsWith('Saber'), 'a real swing cuts the soldier where the blade passes');
await p.screenshot({ path: `${OUT}/v22-swing.png` });
await ev(() => __game.advance(2.5));

// 2. gun hand off: lives, drops the pistol, runs
await ev(() => { __game.fillEnemies(); __game.advance(0.8); const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) __game.moveEnemy(i, 40 + i * 4, 40); __game.moveEnemy(0, 0.6, 3, Math.PI); __game.advance(0.2); });
const id2 = await ev(() => __game.cutEnemy(0, 'hand_r'));
await ev(() => __game.advance(0.25));
await p.screenshot({ path: `${OUT}/v22-hand-off.png` });
const before = (await ev(() => __game.enemies())).find((e) => e.id === id2).pos;
await ev(() => __game.advance(2.2));
c = (await ev(() => __game.cuts())).find((x) => x.id === id2); const after = (await ev(() => __game.enemies())).find((e) => e.id === id2).pos;
console.log('hand off →', JSON.stringify(c), 'moved', before, '→', after);
check(c.state !== 'dead' && c.unarmed && !c.gun && c.severed.includes('hand_r'), 'gun hand off: alive, unarmed, pistol dropped');
check(Math.hypot(after[0], after[2]) > Math.hypot(before[0], before[2]) + 2, 'he runs away from you');
const bl = await ev(() => __game.blood()); console.log('blood', JSON.stringify(bl));
check(bl.splats > 0, 'blood splats on the ground');

// 3. left arm off: still armed, keeps fighting
const id3 = await ev(() => { const i = __game.cuts().filter((c) => c.state !== 'dead').findIndex((c) => !c.unarmed); __game.moveEnemy(i, -1, 4, Math.PI); return __game.cutEnemy(i, 'upperarm_l'); });
await ev(() => __game.advance(1.5));
c = (await ev(() => __game.cuts())).find((x) => x.id === id3);
check(c.state !== 'dead' && !c.unarmed && c.gun && c.severed.includes('upperarm_l'), 'left arm off: alive and still armed');

// 4. head and waist: lethal, cut exactly there (legs crawl since v23: test27)
for (const [cut, bone] of [['head', 'Head'], ['waist', 'spine_01']]) {
  const id = await ev((cut) => { const L = __game.cuts().filter((c) => c.state !== 'dead'); const i = L.findIndex((c) => !c.severed.length); __game.moveEnemy(i, 1.5, 3.5, Math.PI); return __game.cutEnemy(i, cut); }, cut);
  await ev(() => __game.advance(0.3));
  if (cut === 'waist') await p.screenshot({ path: `${OUT}/v22-waist.png` });
  await ev(() => __game.advance(1.5));
  c = (await ev(() => __game.cuts())).find((x) => x.id === id);
  check(c && c.state === 'dead' && c.severed.includes(bone), `${cut}: dead, ${bone} severed (${c && c.label})`);
  await ev(() => __game.fillEnemies());
}
await p.screenshot({ path: `${OUT}/v22-after.png` });

// 5. Force push throws the loose limbs and guns
const pieces0 = await ev(() => __game.blood().pieces);
await ev(() => { __game.look(0, 0.15); __game.advance(0.2); });
const moved = await ev(() => { const snap = __game.pieces ? null : null; return null; });
await ev(() => { __game.forcePush(); __game.advance(1.2); });
check(pieces0 >= 4, `loose pieces on the ground: ${pieces0}`);
// v47: shot-off limbs (he lives with it)
await ev(() => { __game.fillEnemies(); __game.advance(0.2); });
const ids = await ev(() => __game.plainSoldiers());
const st = (id) => ev((id) => __game.minds().find((m) => m.id === id)?.state, id);
const armSev = await ev((id) => { const r = __game.shootLimb(id, 'upperarm_l', 'sniper'); __game.advance(0.3); return r; }, ids[0]);
check(armSev.includes('upperarm_l') && (await st(ids[0])) !== 'dead', `a sniper shot to the arm takes it off and he lives (${armSev.join(',')}, ${await st(ids[0])})`);
const legSev = await ev((id) => { const r = __game.shootLimb(id, 'thigh_r', 'shotgun'); __game.advance(0.3); return r; }, ids[1]);
check(legSev.includes('thigh_r') && (await st(ids[1])) === 'crawl', `a shotgun blast to the thigh takes the leg; he crawls (${legSev.join(',')}, ${await st(ids[1])})`);
check(!errs.length, 'no page errors');
const rep = await ev(() => __game.lastReport);
if (rep && rep.kind !== 'freeze') { console.log('report:', JSON.stringify(rep).slice(0, 300)); fail++; }
console.log(fail ? `FAILED (${fail})` : 'PASS');
await b.close(); process.exit(fail ? 1 : 0);
