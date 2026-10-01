// Audit: why rifles miss at 8 m. Logs each shot's result (the game's own 'fire <gun> <zone|miss>' event) and his pose.
import fs from 'fs';
import { open, park } from './lib.mjs';
const { b, p, ev, shot } = await open();
await p.mouse.click(640, 300); await park(ev);
const adv = (s) => ev((s) => __game.advance(s), s);
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return null; });
const res = {};
for (const [slot, gun] of [[1, 'pistol'], [3, 'ak']]) for (const d of [5, 8, 12, 20]) {
  await ev(([x, z, s, d]) => { __game.place(x, z); __game.look(Math.PI, 0.2); __game.selectSlot(s, true); __game.advance(1.5); __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, x, z - d, 0); __game.faceEnemy(0, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.3); }, [O[0], O[1], slot, d]);
  const id = await ev(() => __game.enemies().filter((e) => e.state !== 'dead')[0].id);
  const log = [];
  for (let i = 0; i < 12; i++) {
    const e = await ev((id) => __game.enemies().find((x) => x.id === id), id); if (e.state === 'dead') break;
    // aim at his chest bone, not a fixed height
    const ch = await ev((id) => __game.enemyBone(id, 'spine_03')?.at, id);
    await ev(([x, y, z]) => { for (let k = 0; k < 3; k++) { const c = __game.camPos, dx = x - c[0], dy = y - c[1], dz = z - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.03); } }, ch);
    await p.mouse.down(); await adv(0.03); await p.mouse.up(); await adv(0.25);
    const hpNow = (await ev((id) => __game.enemies().find((x) => x.id === id), id)); log.push([e.state, hpNow.hp, hpNow.state, ((await ev(() => __game.events.filter((x) => /fire /.test(x)).slice(-1)[0])) || '').split(' ').slice(-1)[0], +ch[1].toFixed(2), +Math.hypot(e.pos[0] - O[0], e.pos[2] - O[1]).toFixed(1)]);
    if (i === 1 && d === 8) await shot(`v5-${gun}-8m`);
  }
  res[`${gun}@${d}m`] = log; console.log(gun, d, JSON.stringify(log));
}
fs.writeFileSync(new URL('../../audit/verify5.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
