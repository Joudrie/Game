// Audit: grapple swing started from the ground vs mid-jump; the duellist's front guard (5 tries).
import fs from 'fs';
import { open, park } from './lib.mjs';
const { b, p, ev, shot } = await open();
const adv = (s) => ev((s) => __game.advance(s), s);
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
await p.mouse.click(640, 300); await park(ev);
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return null; });
const aimAt = (x, y, z) => ev(([x, y, z]) => { for (let i = 0; i < 3; i++) { const c = __game.camPos, dx = x - c[0], dy = y - c[1], dz = z - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.05); } }, [x, y, z]);
const res = { swing: {}, duel: [] };
const tall = await ev(() => __game.blocks.filter((b) => b.max[1] >= 18).map((b) => ({ ...b, c: [(b.min[0] + b.max[0]) / 2, (b.min[2] + b.max[2]) / 2] })).sort((a, b) => Math.hypot(...a.c) - Math.hypot(...b.c))[0]);
for (const start of ['ground', 'mid-jump', 'mid-double-jump']) for (const dist of [8, 14, 22]) {
  await ev(([B, d]) => { __game.setGadget('swing', true); __game.setMode('ground', 0); __game.place(B.c[0], B.min[2] - d); __game.look(0, 0); __game.selectSlot(0, true); __game.advance(0.5); }, [tall, dist]);
  if (start !== 'ground') { await key('Space', 0.03); await adv(0.2); } if (start === 'mid-double-jump') { await key('Space', 0.03); await adv(0.2); }
  await aimAt(tall.c[0], tall.max[1] * 0.85, tall.min[2]);
  await key('KeyR'); const sw = []; let maxY = 0, swingT = 0;
  for (let i = 0; i < 50; i++) { await adv(0.1); const s = await ev(() => [__game.grappleState, __game.swing, __game.y]); if (s[1]) swingT += 0.1; maxY = Math.max(maxY, s[2]); sw.push(s[0][0] + (s[1] ? 'S' : '')); if (i === 12 && dist === 14) await shot(`v7-swing-${start}`); if (i === 8) await p.keyboard.down('KeyW'); }
  await p.keyboard.up('KeyW'); await ev(() => { if (__game.grappleState !== 'idle') __game.grapplePress(); __game.advance(3); });
  res.swing[`${start} ${dist}m`] = { swingingSeconds: +swingT.toFixed(1), maxHeight: +maxY.toFixed(1), states: sw.join('') };
  console.log(start, dist, JSON.stringify(res.swing[`${start} ${dist}m`]));
}
await ev(() => __game.setGadget('swing', false));
for (let t = 0; t < 5; t++) {
  const id = await ev(([x, z]) => { __game.place(x, z); __game.advance(0.3); return __game.spawnSpecial('duel', x, z - 2.6); }, O);
  await ev((id) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === id); __game.setMind(i, 'combat', 0); __game.faceEnemy(i, 0); __game.advance(0.4); }, id);
  const seq = [];
  for (let n = 0; n < 8; n++) {
    const e = await ev((id) => __game.enemies().find((x) => x.id === id), id); if (!e || e.state === 'dead') break;
    await ev(([x, z]) => { __game.place(x, z + 1.4); __game.look(Math.PI, 0.25); }, [e.pos[0], e.pos[2]]); await click(); await adv(0.75);
    const s = await ev((id) => __game.special().find((x) => x.id === id), id); const c = await ev((id) => __game.cuts().find((x) => x.id === id), id);
    seq.push(`${s ? 'g' + s.guard : 'dead'}${c && c.severed.length ? ':' + c.severed.join('+') : ''}`);
  }
  res.duel.push(seq.join(' ')); console.log('duel try', t, seq.join(' '));
  await ev(() => { __game.fillEnemies(); for (const e of __game.enemies()) {} __game.advance(1); });
}
fs.writeFileSync(new URL('../../audit/verify7.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
