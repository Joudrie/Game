// v52: the loading screen names its step and, when a step hangs or fails, shows details with a Copy button.
// Second run: WebAssembly switched off (as in iOS Lockdown Mode), which the model decoder needs.
import { chromium, devices } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const state = (p) => p.evaluate(() => ({ hidden: document.getElementById('loading').hidden, msg: document.getElementById('loadmsg').textContent, info: !document.getElementById('loadinfo').hidden, copy: !document.getElementById('loadcopy').hidden, stage: window.__load?.stage, details: window.__loadDetails?.() }));
{
  const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 }); await p.waitForTimeout(500);
  const s = await state(p);
  check(s.hidden && !s.info && s.stage === 'setup', `a normal load finishes and hides the screen (last step ${s.stage})`);
  await ctx.close();
}
{
  const ctx = await b.newContext({ ...devices['iPhone 13'] }); await ctx.addInitScript(() => { delete window.WebAssembly; });
  const p = await ctx.newPage(); await p.goto(URL);
  let s; for (let i = 0; i < 60; i++) { await p.waitForTimeout(1000); s = await state(p); if (s.copy) break; }
  check(!s.hidden && s.info && s.copy, `without WebAssembly the screen says what went wrong instead of spinning ("${s.msg}")`);
  check(/wasm: false/.test(s.details) && /stage: /.test(s.details), 'the details name the step, the device and wasm');
  console.log(s.details.split('\n').map((l) => '     ' + l).join('\n'));
  await p.screenshot({ path: `${OUT}/test51-loading.png` });
  await ctx.close();
}
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close(); process.exit(fail ? 1 : 0);
