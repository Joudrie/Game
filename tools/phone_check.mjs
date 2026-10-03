// Load a build as an iPhone 13 (touch, small screen; CPU=<n> slows the CPU n times) and log console errors, failed
// requests and boot progress every 5 s; screenshot to $OUT/phone.png. tools/serve.sh node tools/phone_check.mjs http://127.0.0.1:8766/preview2.html
import { chromium, devices } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ ...devices['iPhone 13'], ignoreHTTPSErrors: true });
const p = await ctx.newPage(); const t0 = Date.now();
const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +(process.env.CPU || 1) });
p.on('console', (m) => console.log(((Date.now() - t0) / 1000).toFixed(1), 'console:', m.type(), m.text().slice(0, 200)));
p.on('pageerror', (e) => console.log(((Date.now() - t0) / 1000).toFixed(1), 'pageerror:', e.message));
p.on('response', (r) => { if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); }); p.on('requestfailed', (r) => console.log('failed', r.url().slice(0, 100), r.failure()?.errorText));
await p.goto(url, { timeout: 180000 });
for (let i = 0; i < 24; i++) { await p.waitForTimeout(5000); const s = await p.evaluate(() => ({ load: !document.getElementById('loading') || document.getElementById('loading').hidden || getComputedStyle(document.getElementById('loading')).display === 'none', msg: document.getElementById('loadmsg')?.textContent, game: !!window.__game, mem: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null })); console.log(((Date.now() - t0) / 1000).toFixed(1), JSON.stringify(s)); if (s.load) break; }
await p.screenshot({ path: `${process.env.OUT || '.'}/phone.png` });
await b.close();
