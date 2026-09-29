import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
p.on('console', m => { if (m.type()==='error' && !/404|CERT/.test(m.text())) console.log('console', m.text()); });
await p.goto('http://localhost:8765/preview2.html');
await p.evaluate(() => localStorage.setItem('moves-pool', JSON.stringify({ djump: ['dj_side'] })));
await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
console.log('cal', JSON.stringify(await p.evaluate(() => window.__cal)));
await p.click('#movesbtn'); await p.waitForTimeout(500);
for (const [slot,id,t] of [['walk','MX_Walk',700],['jog','ST_Run_Superman',500],['jog','MX_Run',400],['djump','dj_side',450],['crouch','ST_Walk_Sneak',600]]) {
  await p.click('.pv[data-slot="'+slot+'"][data-id="'+id+'"]'); await p.waitForTimeout(t);
  await p.screenshot({ path: 'v3-'+id+'.png' });
}
await p.click('#movesclose'); await p.waitForTimeout(300);
await p.evaluate(() => window.__game.setClass('force'));
await p.keyboard.down('KeyW'); await p.waitForTimeout(1200);
await p.keyboard.press('Space'); await p.waitForTimeout(350); await p.keyboard.press('Space'); await p.waitForTimeout(250);
await p.screenshot({ path: 'v3-djump-game.png' });
await p.waitForTimeout(2000); console.log(await p.evaluate(() => ({ m: window.__game.mode, s: window.__game.speed })));
await b.close();
