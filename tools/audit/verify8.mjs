// Audit: Mission 3 started from the Missions panel, player stands still at the gate. Does it fail on its own? (3 tries)
import fs from 'fs';
import { open } from './lib.mjs';
const { b, p, ev, shot } = await open();
await p.mouse.click(640, 300);
const res = [];
for (let t = 0; t < 3; t++) {
  await ev(() => { if (__game.mission) __game.endMission('quit'); __game.place(0, 0); __game.advance(1); document.getElementById('missionsbtn').click(); });
  await ev(() => document.querySelector('[data-mission="m3"]').click());
  const seq = [];
  for (let i = 0; i < 20; i++) { await ev(() => __game.advance(0.5)); const m = await ev(() => [__game.mission?.state, __game.minds().filter((x) => x.state !== 'dead' && x.mind !== 'patrol').map((x) => x.mind + (x.mark || '')).join(',')]); seq.push(m.join(':')); if (i === 6 && t === 0) await shot('v8-m3-idle'); if (m[0] === 'failed') break; }
  res.push(seq); console.log('try', t, seq.join(' | '));
  await ev(() => { document.getElementById('mdoneback')?.click(); __game.advance(1); });
}
fs.writeFileSync(new URL('../../audit/verify8.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
