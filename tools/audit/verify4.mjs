// Audit: are severed pieces solid red after a soldier's second cut? Close-up screenshots, one cut vs two cuts.
import fs from 'fs';
import { open, park } from './lib.mjs';
const { b, p, ev, shot } = await open();
await p.mouse.click(640, 300); await park(ev);
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return null; });
const res = {};
for (const [name, cuts] of [['one-cut-chest', ['chest']], ['two-cuts-thigh-then-chest', ['thigh_l', 'chest']], ['two-cuts-arm-then-head', ['upperarm_r', 'head']], ['three-cuts', ['hand_l', 'calf_r', 'waist']]]) {
  await ev(([x, z, cuts]) => { __game.place(x, z); __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, x, z - 4, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.3); for (const c of cuts) { __game.cutEnemy(0, c); __game.advance(0.4); } __game.advance(2.5); __game.setDebugCam([x + 2.2, 1.7, z - 1.8], [x, 0.3, z - 4]); __game.advance(0.05); }, [O[0], O[1], cuts]);
  await shot('v4-' + name); res[name] = await ev(() => __game.blood());
  await ev(() => { __game.setDebugCam(null); __game.place(0, 0); __game.advance(100); }); // let the old pieces fade before the next
}
fs.writeFileSync(new URL('../../audit/verify4.json', import.meta.url), JSON.stringify(res, null, 1)); console.log(res);
await b.close();
