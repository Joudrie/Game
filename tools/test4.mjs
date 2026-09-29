import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', e => console.log('pageerror:', e.message));
p.on('console', m => { if (m.type()==='error' && !/404|CERT/.test(m.text())) console.log('console', m.text()); });
await p.goto('http://localhost:8765/preview2.html');
await p.evaluate(() => localStorage.setItem('moves-pool', JSON.stringify({ djump: ['dj_m2m_backflip'], sprint: ['M2M_Run_Anime'] })));
await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 90000 });
console.log('cal', JSON.stringify(await p.evaluate(() => window.__cal)));
await p.click('#movesbtn'); await p.waitForTimeout(500);
for (const [slot,id,t] of [['sprint','M2M_Run_Anime',500],['walk','M2M_Walk_Large',600],['djump','dj_m2m_backflip',700],['jump','jump_m2m_run',500]]) {
  await p.click('.pv[data-slot="'+slot+'"][data-id="'+id+'"]'); await p.waitForTimeout(t);
  await p.screenshot({ path: 'v4-'+id+'.png' });
}
await p.click('[data-lib="M2M_Two_hand_Blast"]'); await p.waitForTimeout(300); await p.screenshot({ path: 'v4-blast.png' });
await p.click('#movesclose'); await p.waitForTimeout(300);
await p.evaluate(() => window.__game.setClass('force'));
await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await p.waitForTimeout(1500); await p.screenshot({ path: 'v4-anime-sprint.png' }); await p.keyboard.up('ShiftLeft');
await p.keyboard.press('Space'); await p.waitForTimeout(350); await p.keyboard.press('Space'); await p.waitForTimeout(250);
await p.screenshot({ path: 'v4-djump-game.png' });
await p.keyboard.up('KeyW'); await p.waitForTimeout(700); await p.screenshot({ path: 'v4-landing.png' }); await p.waitForTimeout(1500); console.log(await p.evaluate(() => ({ m: window.__game.mode, s: window.__game.speed })));
await b.close();
