// Audit: the "stuck swing" (walk capped at 1 m/s, clicks do nothing) after Force pull, saber + blaster and takedowns.
// Usage: node tools/audit/verify3.mjs   → audit/verify3.json + audit/shots/v3-*.png
import fs from 'fs';
import { open, park } from './lib.mjs';
const { b, p, ev, log, alert, closeAlert, shot } = await open();
const adv = (s) => ev((s) => __game.advance(s), s);
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 40)) return [Math.round(x), Math.round(z)]; } return null; });
async function reset() {
  for (const m of ['left', 'right', 'middle']) await p.mouse.up({ button: m }).catch(() => {});
  for (const k of ['KeyW', 'ShiftLeft', 'Space', 'KeyH']) await p.keyboard.up(k).catch(() => {});
  await ev(([x, z]) => { const g = __game; if (g.dead) g.respawn(); g.blockRelease(); g.attackRelease(); g.setClass('light'); g.setMode('ground', 0); g.place(x, z); g.look(Math.PI, 0.28); g.selectSlot(0, true); g.setGear('lit'); g.advance(2); }, O);
  await park(ev); await closeAlert(); await lock();
}
const swapIn = (id, slot = 4) => ev(([id, slot]) => { const I = __game.inv; const hi = I.hot.findIndex((x) => x && x.id === id); if (hi >= 0) { __game.selectSlot(hi, true); __game.advance(1.3); return; } const bi = I.bag.findIndex((x) => x && x.id === id); const t = I.hot[slot]; I.hot[slot] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(slot, true); __game.advance(1.3); }, [id, slot]);
const one = (d, yw = 0) => ev(([x, z, d, yw]) => { __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, x, z - d, yw); __game.faceEnemy(0, yw); __game.setMind(0, 'patrol', 999); __game.advance(0.2); return __game.enemies().filter((e) => e.state !== 'dead')[0].id; }, [O[0], O[1], d, yw]);
const aimAt = (x, y, z) => ev(([x, y, z]) => { for (let i = 0; i < 3; i++) { const c = __game.camPos, dx = x - c[0], dy = y - c[1], dz = z - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.05); } }, [x, y, z]);
const probe = async () => { const a = await ev(() => [__game.atk, __game.overrides]); await p.keyboard.down('KeyW'); await adv(1.5); const w = await ev(() => __game.speed); await p.keyboard.up('KeyW'); await adv(0.3); await click(); await adv(0.2); const c = await ev(() => [__game.atk, __game.overrides]); return { atk: a[0], ovr: a[1], walk: +w.toFixed(2), clickStarts: c[1].length > 0 }; };
const res = {};
const tries = async (name, setup, n = 5) => { const out = []; for (let i = 0; i < n; i++) { await reset(); await setup(i); await adv(3); out.push(await probe()); if (i === 0) await shot('v3-' + name); } res[name] = { tries: out, stuck: out.filter((t) => t.walk < 1.2).length + '/' + n }; console.log(name, JSON.stringify(res[name])); };
await lock();
await tries('force-pull-then-wait', async () => { await swapIn('force'); const id = await one(8); const e = await ev((id) => __game.enemies().find((x) => x.id === id), id); await aimAt(e.pos[0], 1.2, e.pos[2]); await click(); });
await tries('force-pull-then-R', async () => { await swapIn('force'); const id = await one(8); const e = await ev((id) => __game.enemies().find((x) => x.id === id), id); await aimAt(e.pos[0], 1.2, e.pos[2]); await click(); await adv(0.3); await key('KeyR'); });
await tries('saber-blaster-click', async () => { await swapIn('saberblaster'); await click(); });
await tries('saber-blaster-right-click', async () => { await swapIn('saberblaster'); await click('right'); await adv(0.15); await key('KeyT'); });
await tries('takedown-then-F', async () => { await one(1.0, Math.PI); await adv(0.2); await key('KeyF'); await adv(0.25); await key('KeyF'); });
await tries('takedown-then-click', async () => { await one(1.0, Math.PI); await adv(0.2); await key('KeyF'); await adv(0.25); await click(); });
await tries('swing-then-R', async (i) => { await click(); await adv(0.1 + i * 0.05); await key('KeyR'); });
await tries('swing-then-T', async (i) => { await click(); await adv(0.1 + i * 0.05); await key('KeyT'); });
await tries('swing-then-X', async (i) => { await click(); await adv(0.1 + i * 0.05); await key('KeyX'); });
// what clears it
const clears = {};
for (const [k, f] of Object.entries({ E: () => key('KeyE'), Digit2: () => key('Digit2'), Space: () => key('Space'), C: async () => { await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(1); await key('KeyC'); await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft'); }, Q: () => key('KeyQ'), rightClick: () => click('right', 0.3) })) {
  await reset(); await click(); await adv(0.15); await key('KeyR'); await adv(3); const before = await ev(() => __game.atk); await f(); await adv(1.5); await ev(() => { __game.selectSlot(0, true); __game.setGear('lit'); __game.advance(1.5); }); clears[k] = { before, ...(await probe()) };
}
res.whatClearsIt = clears; console.log('clears', JSON.stringify(clears));
fs.writeFileSync(new URL('../../audit/verify3.json', import.meta.url), JSON.stringify(res, null, 1));
await b.close();
