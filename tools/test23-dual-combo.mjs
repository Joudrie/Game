// v19 dual-saber combos: every ticked combo plays all its hits (both hands), rotates per chain, hits enemies, never freezes.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
const ev = (f, a) => p.evaluate(f, a);
await ev(() => { __game.setClass('light'); __game.setGear('lit', true); __game.place(0, 0); __game.look(0, 0.1); __game.advance(1.5); });
let fail = 0;
const chains = [];
const want = [['Sword_Regular_A', 'MR_Sword_Regular_A', 'Sword_Regular_B', 'MR_Sword_Regular_B', 'KK_Dual_Slice', 'KK_Dual_Chop'],
  ['Sword_Regular_A', 'MR_Sword_Regular_A', 'Sword_Regular_C', 'MR_Sword_Attack', 'KK_Dual_Stab'],
  ['KK_Dual_Slice', 'KK_Dual_Chop', 'MR_Sword_Regular_C', 'KK_Dual_Stab']];
for (let c = 0; c < 4; c++) {
  const seen = [];
  await ev(() => __game.attackPress()); await ev(() => __game.attackRelease());
  for (let k = 0; k < 400; k++) {
    const info = await ev(() => __game.atkInfo);
    if (!info) break;
    const name = info.name.replace(/ \(.*\)$/, '');
    if (!info.rec && seen[seen.length - 1] !== name) {
      seen.push(name);
      if (/^MR_|^KK_Dual/.test(name) && !chains.some((x) => x.includes(name))) { await ev(() => __game.advance(0.12)); await p.screenshot({ path: `${OUT}/v19-${name}.png` }); }
    }
    if (seen.length >= want[c % 3].length) break; // last hit: stop tapping so the chain ends
    await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.05); });
  }
  // let the chain finish: stop tapping
  await ev(() => __game.advance(3));
  chains.push(seen);
  console.log('chain', c + 1, seen.join(' → '));
  if (await ev(() => __game.atk) !== null) { console.log('FAIL: attack still active'); fail++; }
}
for (let i = 0; i < 4; i++) {
  const w = want[i % 3], got = chains[i];
  if (got.join() !== w.join()) { console.log('FAIL chain', i + 1, 'expected', w.join(' → ')); fail++; }
}
// hits land: a soldier 1.5 m ahead takes damage from a left-hand strike
await ev(() => { __game.fillEnemies(); for (let i = 1; i < 5; i++) __game.moveEnemy(i, 60 + i * 3, 60); __game.moveEnemy(0, 0, 1.5, Math.PI); __game.advance(0.5); });
const hp0 = (await ev(() => __game.enemies()))[0].hp;
for (let k = 0; k < 60; k++) await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.05); });
const e0 = (await ev(() => __game.enemies()))[0];
console.log('enemy hp', hp0, '→', e0.hp, e0.state);
if (!(e0.hp < hp0 || e0.state !== 'idle')) { console.log('FAIL: enemy not hit'); fail++; }
const rep = await ev(() => __game.lastReport);
if (rep && rep.kind !== 'freeze') { console.log('FAIL report:', JSON.stringify(rep).slice(0, 300)); fail++; } // headless load stalls show up as 'freeze'
if (errs.length) fail++;
console.log(fail ? `FAILED (${fail})` : 'PASS');
await b.close(); process.exit(fail ? 1 : 0);
