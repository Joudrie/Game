// v24 (roadmap batch 2): AK-47 (auto), pump shotgun (pellets, blasts bodies back), sniper (scope zoom, one-shot);
// blaster bolts: held block deflects (front and sides only), a block timed to the bolt parries it back and kills the
// shooter, a long volley breaks the guard; soldiers carry AKs and you can pick them up.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const living = () => ev(() => __game.enemies().filter((e) => e.state !== 'dead'));
const park = () => ev(() => { const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) __game.moveEnemy(i, 60 + i * 4, 60); __game.advance(0.1); });
await ev(() => { __game.place(0, 0); __game.look(0, 0.12); __game.fillEnemies(); __game.advance(1.5); });
await park();

// AK: automatic fire while the trigger is held
await ev(() => { __game.selectSlot(3); __game.advance(1.2); });
check((await ev(() => __game.gunKind)) === 'ak', 'slot 4 is the AK-47');
const m0 = (await ev(() => __game.ammoMags())).ak;
await ev(() => { __game.holdFire(true); __game.advance(1.0); __game.holdFire(false); __game.advance(0.2); });
const m1 = (await ev(() => __game.ammoMags())).ak;
check(m0 - m1 >= 8, `AK fires on its own while held: ${m0} → ${m1} rounds`);

// shotgun: one blast at 5 m kills and throws the body
await ev(() => { __game.selectSlot(4); __game.advance(1.2); __game.moveEnemy(0, 0, 5, Math.PI); __game.advance(0.1); __game.setAim(true); __game.advance(0.6); });
const tgt = (await living())[0];
await ev((id) => { const e = __game.enemies().find((x) => x.id === id); __game.shootAt(__game.enemies().filter((x) => x.state !== 'dead').findIndex((x) => x.id === id), 'torso'); }, tgt.id);
await ev(() => __game.advance(0.8));
const after = (await ev(() => __game.enemies())).find((x) => x.id === tgt.id);
check(after.state === 'dead', `shotgun at 5 m kills (${after.state})`);
check(Math.hypot(after.pos[0], after.pos[2]) > 5.5, `…and throws the body back (${after.pos})`);
await ev(() => { __game.setAim(false); __game.advance(0.3); __game.fillEnemies(); __game.advance(0.5); });
await park();

// sniper: the scope zooms in, one torso shot kills
await ev(() => { __game.selectSlot(5); __game.advance(1.2); __game.moveEnemy(0, 0.5, 25, Math.PI); __game.advance(0.1); __game.setAim(true); __game.advance(0.8); });
check((await ev(() => __game.fov)) < 30, `scoped in: fov ${(await ev(() => __game.fov)).toFixed(0)}`);
await p.screenshot({ path: `${OUT}/v24-scope.png` });
const sn = (await living())[0];
await ev(() => { __game.shootAt(0, 'torso'); __game.advance(0.3); });
check((await ev(() => __game.enemies())).find((x) => x.id === sn.id).state === 'dead', 'sniper: one torso shot kills');
await ev(() => { __game.setAim(false); __game.advance(0.3); __game.fillEnemies(); __game.advance(0.5); });
await park();

// blaster bolts vs the saber
await ev(() => { __game.selectSlot(0); __game.advance(1.5); __game.moveEnemy(0, 0, 11, Math.PI); __game.setLoadout(0, 'pistol'); __game.look(0, 0.12); __game.advance(0.3); });
const shooter = (await living())[0];
// a timed block: press just before the bolt arrives
await ev(() => { __game.enemyBolt(0); __game.advance(0.12); __game.blockPress(); __game.advance(0.5); __game.blockRelease(); __game.advance(0.4); });
const sh = (await ev(() => __game.enemies())).find((x) => x.id === shooter.id);
check((await ev(() => __game.parries)) === 1 && sh.state === 'dead', `timed block parries the bolt back and kills him (${sh.state}, parries ${await ev(() => __game.parries)})`);
await p.screenshot({ path: `${OUT}/v24-parry.png` });
// holding block from long before: deflects, no parry
await ev(() => { __game.fillEnemies(); __game.advance(0.5); }); await park();
await ev(() => { __game.moveEnemy(0, 0, 11, Math.PI); __game.setLoadout(0, 'pistol'); __game.advance(0.2); __game.blockPress(); __game.advance(1); });
const bs0 = await ev(() => __game.blockedShots);
await ev(() => { __game.enemyBolt(0); __game.advance(0.6); });
check((await ev(() => __game.blockedShots)) === bs0 + 1 && (await ev(() => __game.parries)) === 1, 'held block deflects (no parry)');
// your back isn't covered
await ev(() => { __game.blockRelease(); __game.look(Math.PI, 0.12); __game.advance(0.6); __game.blockPress(); __game.advance(0.8); });
await ev(() => { __game.place(0, 0); __game.advance(0.05); });
const bs1 = await ev(() => __game.blockedShots);
await ev(() => { __game.enemyBolt(0); __game.advance(0.6); });
check((await ev(() => __game.blockedShots)) === bs1, 'a bolt from behind is not blocked');
// a long volley breaks the guard
await ev(() => { __game.blockRelease(); __game.look(0, 0.12); __game.advance(0.6); __game.blockPress(); __game.advance(0.8); });
for (let i = 0; i < 12; i++) await ev(() => { __game.enemyBolt(0); __game.advance(0.12); });
await ev(() => __game.advance(0.4));
check((await ev(() => __game.guardBrokenT)) > 0 || (await ev(() => __game.blocking)) === false, 'a volley breaks the guard');
await ev(() => { __game.blockRelease(); __game.advance(2); });

// soldiers with AKs drop them; walk over one to take it
await ev(() => { __game.fillEnemies(); __game.advance(0.5); }); await park();
await ev(() => { __game.moveEnemy(0, 1, 3, Math.PI); __game.setLoadout(0, 'ak'); __game.advance(0.2); __game.cutEnemy(0, 'head'); __game.advance(2); });
const ak = (await ev(() => __game.gunsNear())).find((g) => g[2] && g[3] === 'ak');
check(!!ak, 'a dead AK soldier drops his rifle');
const r0 = await ev(() => __game.countItem('ammo_rifle'));
if (ak) await ev((g) => { __game.place(g[0] + 0.3, g[1]); __game.advance(0.4); }, ak);
check((await ev(() => __game.countItem('ammo_rifle'))) >= r0 + 30, `walked over it: rifle ammo ${r0} → ${await ev(() => __game.countItem('ammo_rifle'))}`);
const lo = await ev(() => { __game.setEnemyCount(20); __game.advance(4); return __game.loadouts(); });
check(lo.includes('ak') && lo.includes('pistol'), `mixed loadouts: ${lo.filter((k) => k === 'ak').length} AK / ${lo.filter((k) => k === 'pistol').length} pistol`);
check(!errs.length, 'no page errors');
console.log(fail ? `FAILED (${fail})` : 'PASS');
await b.close(); process.exit(fail ? 1 : 0);
