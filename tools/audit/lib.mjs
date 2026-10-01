// Shared setup for the audit scripts: launch Chromium (swiftshader), load the game, collect errors and watchdog reports.
import { chromium } from 'playwright';
import fs from 'fs';
export const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html';
export const SHOTS = new globalThis.URL('../../audit/shots/', import.meta.url).pathname;
fs.mkdirSync(SHOTS, { recursive: true });
export async function open({ w = 1280, h = 720, clear = true, init } = {}) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const log = { errors: [], reports: [], console: [] };
  p.on('pageerror', (e) => log.errors.push(e.message));
  p.on('console', (m) => { const t = m.text(); log.console.push(t); if (t.startsWith('[report]')) log.reports.push(t); });
  if (init) await p.addInitScript(init);
  const t0 = Date.now();
  await p.goto(URL);
  if (clear) { await p.evaluate(() => localStorage.clear()); await p.reload(); }
  await p.waitForFunction(() => window.__game, null, { timeout: 180000 });
  log.loadMs = Date.now() - t0;
  const ev = (f, a) => p.evaluate(f, a);
  const shot = (name) => p.screenshot({ path: SHOTS + name + '.png' });
  // reports raised by the in-game watchdog (alert panel)
  const alert = () => ev(() => { const a = document.getElementById('alert'); return a && !a.hidden ? document.getElementById('alerttitle').textContent + ': ' + document.getElementById('alerttext').textContent : null; });
  const closeAlert = () => ev(() => { const a = document.getElementById('alert'); if (a) a.hidden = true; });
  return { b, ctx, p, ev, shot, log, alert, closeAlert };
}
// Park all soldiers far away and calm so a scenario starts clean.
export const park = (ev) => ev(() => { __game.fillEnemies(); __game.advance(0.2); const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { __game.moveEnemy(i, 80 + i * 4, 80); __game.setMind(i, 'patrol', 999); } __game.advance(0.1); });
// Real keyboard input, with game time advanced between press and release (headless runs ~8 fps).
export async function tap(p, key, hold = 0.1) { await p.keyboard.down(key); await p.evaluate((s) => __game.advance(s), hold); await p.keyboard.up(key); }
export const adv = (p, s) => p.evaluate((s) => __game.advance(s), s);
