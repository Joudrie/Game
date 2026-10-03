// v51: phone controls. Dragging from the Fire button turns the camera while it fires; the pad is in the corner; no
// speed readout on phones.
import { chromium, devices } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ ...devices['iPhone 13 landscape'] }); const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
await p.evaluate(() => { __game.selectSlot(3, true); __game.advance(1); });
const r = await p.evaluate(() => {
  const el = document.getElementById('firebtn'), bb = el.getBoundingClientRect(), x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
  const ev = (type, dx) => el.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x + dx, clientY: y }));
  const y0 = __game.camYaw, shots0 = __game.sfxCount;
  ev('pointerdown', 0); __game.advance(0.1); const held = __game.padLook;
  for (let k = 1; k <= 10; k++) ev('pointermove', -k * 12);
  __game.advance(0.3); const y1 = __game.camYaw; ev('pointerup', -120);
  const readout = getComputedStyle(document.getElementById('readout')).display;
  const right = innerWidth - bb.right, bottom = innerHeight - bb.bottom;
  return { turned: +(y1 - y0).toFixed(2), held, after: __game.padLook, fired: __game.sfxCount - shots0, readout, right: Math.round(right), bottom: Math.round(bottom) };
});
check(Math.abs(r.turned) > 0.3 && r.held === 1 && r.after === 0, `dragging from Fire turns the camera (${r.turned} rad) and lets go on release`);
check(r.fired > 0, `holding Fire fires (${r.fired} sounds)`);
check(r.right < 40 && r.bottom < 40, `Fire sits in the bottom-right corner (${r.right}, ${r.bottom} px from the edges)`);
check(r.readout === 'none', 'no speed readout on phones');
await p.screenshot({ path: `${OUT}/test50-touch.png` });
check(errs.length === 0, 'no page errors');
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close(); process.exit(fail ? 1 : 0);
