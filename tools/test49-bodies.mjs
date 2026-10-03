// v49: five soldier bodies (terrorist, SWAT, female soldier, insurgent, American soldier), mixed in every squad,
// heights varying; each one animates on our skeleton, holds his gun and still loses limbs.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game && __game.bodies().length, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const bodies = await ev(() => __game.bodies());
check(bodies.length === 5, `five soldier bodies loaded (${bodies.join(', ')})`);
const squad = await ev(() => { __game.fillEnemies(); __game.advance(0.5); return __game.enemies().filter((e) => e.state !== 'dead'); });
const kinds = new Set(squad.map((e) => e.body)), sizes = squad.map((e) => e.size);
check(kinds.size === 5, `a squad of ${squad.length} mixes every body (${[...kinds].join(', ')})`);
check(Math.max(...sizes) - Math.min(...sizes) > 0.03 && sizes.every((s) => s >= 0.94 && s <= 1.06), `heights vary within ±6% (${Math.min(...sizes)}–${Math.max(...sizes)})`);
for (const body of bodies) {
  const r = await ev((body) => {
    const g = __game; g.setBody(body); for (let i = 0; i < 20; i++) g.damageEnemy(0, 999, 'head'); g.advance(0.2);
    for (const e of g.enemies()) if (e.state !== 'dead') { /* clear the field */ }
    g.fillEnemies(); g.advance(0.3);
    const live = g.enemies().filter((e) => e.state !== 'dead'); const e = live.find((x) => x.body === body); if (!e) return { none: true };
    const b0 = g.bonesOf(e.id); g.advance(0.7); const b1 = g.bonesOf(e.id);
    const moved = Math.hypot(...b1.hand_r.map((v, k) => v - b0.hand_r[k])) + Math.hypot(...b1.foot_l.map((v, k) => v - b0.foot_l[k]));
    const up = b1.Head[1] - b1.foot_l[1], reach = Math.hypot(b1.hand_r[0] - b1.pelvis[0], b1.hand_r[2] - b1.pelvis[2]);
    const cut = g.shootLimb(e.id, 'upperarm_l', 'sniper'); g.advance(0.3);
    return { moved: +moved.toFixed(2), up: +up.toFixed(2), reach: +reach.toFixed(2), cut };
  }, body);
  check(!r.none && r.moved > 0.02 && r.up > 1.2 && r.up < 2.1 && r.reach < 1.1 && (r.cut || []).includes('upperarm_l'),
    `${body}: animates (${r.moved}), stands ${r.up} m head over foot, hand within reach (${r.reach} m), loses an arm (${r.cut})`);
}
// a line-up for the eye
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return [0, 0]; });
await ev(([x, z]) => { const g = __game; g.setBody(null); g.place(x, z); g.look(Math.PI, 0.05); g.advance(0.2); }, O);
const live = await ev(() => __game.enemies().filter((e) => e.state !== 'dead').length);
await ev(([bodies, O]) => { const g = __game; for (let k = 0; k < 30; k++) g.damageEnemy(0, 999, 'head'); g.advance(3);
  g.setBody(null); g.fillEnemies(); g.advance(0.2); // a mixed squad: two of each body
  g.setBody(null);
  const live = g.enemies().filter((e) => e.state !== 'dead'); const seen = new Set(); let k = 0;
  live.forEach((e, i) => { if (seen.has(e.body)) { g.moveEnemy(i, 300 + i * 3, 300); g.setMind(i, 'patrol', 999); return; } seen.add(e.body); g.moveEnemy(i, O[0] - 3 + k * 1.5, O[1] - 7, 0); g.setMind(i, 'patrol', 999); k++; });
  g.advance(0.1); }, [bodies, O]);
await p.screenshot({ path: `${OUT}/test49-lineup.png` });
check(errs.length === 0, 'no page errors');
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close(); process.exit(fail ? 1 : 0);
