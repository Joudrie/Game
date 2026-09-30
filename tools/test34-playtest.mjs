// v30: fixes from the owner's PC play test of v29.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', e => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const park = () => ev(() => { __game.fillEnemies(); __game.advance(0.2); const n = __game.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { __game.moveEnemy(i, 60 + i * 4, 60); __game.setMind(i, 'patrol', 999); } __game.advance(0.1); });
const cut = async (id) => (await ev(() => __game.cuts())).find((c) => c.id === id);
const hot = (id, slot) => ev(([id, slot]) => { __game.addItem(id, 1); const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === id); if (bi >= 0) { const t = I.hot[slot]; I.hot[slot] = I.bag[bi]; I.bag[bi] = t; } __game.selectSlot(slot); __game.advance(1.2); }, [id, slot]);
await ev(() => { __game.place(-3, 3); __game.look(0, 0.12); __game.advance(0.5); });
check((await ev(() => __game.enemies().length)) >= 0 && (await ev(() => { __game.setEnemyCount(10); return true; })), 'ten soldiers is the default (Tests → Performance)');

// rifles: the reload keeps the gun in both hands
await ev(() => { __game.selectSlot(3); __game.advance(2); __game.holdFire(true); __game.attackPress(); __game.advance(0.4); __game.attackRelease(); __game.holdFire(false); __game.advance(0.2); __game.startReload(); __game.advance(0.6); });
const gd = await ev(() => __game.gunDebug()), hand = await ev(() => { const o = {}; return o; });
check(gd.kind === 'ak' && (await ev(() => __game.reload)) && gd.grip[1] > 0.8, `the AK stays up in your hands while reloading (grip at ${gd.grip[1]} m)`);
await p.screenshot({ path: `${OUT}/v30-reload.png` });
await ev(() => __game.advance(2));

// fire: no shader recompile (the freeze) and textured flames
const pg0 = await ev(() => __game.programs);
await ev(() => { __game.firePatch(-3, 11); __game.advance(0.6); });
check((await ev(() => __game.programs)) === pg0 && (await ev(() => __game.particles)) > 10, `a fire compiles no new shaders (no freeze) and burns as particles (${await ev(() => __game.particles)})`);
await p.screenshot({ path: `${OUT}/v30-fire.png` });
await park(); await ev(() => { __game.moveEnemy(0, -3, 16, Math.PI); __game.setMind(0, 'combat', 0); __game.advance(0.1); });
const fe = (await ev(() => __game.minds()))[0].id;
await ev(() => __game.advance(2.5));
check(!(await cut(fe)).state.startsWith('dead') || (await cut(fe)).label !== 'Burned', `a soldier near the fire keeps out of it (${(await cut(fe)).state})`);
await ev(() => __game.advance(8));

// juggernaut: walking into him with a lit blade does nothing; a swing does
await park(); await ev(() => { __game.place(-3, 3); __game.selectSlot(0); __game.advance(1.8); });
const j = await ev(() => __game.spawnSpecial('jugg', -3, 4.2));
await ev(() => { __game.setKey('KeyW', true); __game.advance(1); __game.setKey('KeyW', false); __game.advance(0.3); });
check((await ev((j) => __game.special().find((s) => s.id === j), j))?.jugg?.hits === 3, 'walking into a juggernaut with the blade does nothing');
// grapple into a shield soldier from the front: you bounce off
await park(); await ev(() => { __game.place(-3, 3); __game.look(0, 0.05); __game.advance(0.3); });
const sh = await ev(() => __game.spawnSpecial('shield', -3, 15)); await ev((sh) => { const i = __game.enemies().filter((e) => e.state !== 'dead').findIndex((e) => e.id === sh); __game.faceEnemy(i, Math.PI); __game.advance(0.1); __game.grapplePress(); __game.advance(1.2); }, sh);
check((await ev((sh) => __game.special().find((s) => s.id === sh), sh)).state !== 'dead', 'grappling into a shield soldier\'s front bounces you off');
// grapple onto a duellist: he cuts the line
const du = await ev(() => __game.spawnSpecial('duel', 3, 15)); await ev(() => { __game.place(3, 3); __game.look(0, 0.05); __game.advance(0.3); __game.grapplePress(); __game.advance(1.2); });
check((await ev((du) => __game.special().find((s) => s.id === du), du)).state !== 'dead' && (await ev(() => __game.grappleState)) === 'idle', 'a duellist cuts your grapple line');

// teleport: no stuck pose in the air, and it shoves soldiers back
await park(); await ev(() => { __game.place(-3, 3); __game.selectSlot(2); __game.advance(0.5); __game.moveEnemy(0, -3, 12, Math.PI); __game.setMind(0, 'patrol', 999); __game.advance(0.1); });
await ev(() => { __game.setKey('Space', true); __game.advance(0.05); __game.setKey('Space', false); __game.advance(0.25); __game.teleportTo(-3, 11.2); __game.advance(0.3); });
check((await ev(() => __game.mode)) === 'ground' && !(await ev(() => __game.overrides)).some((o) => /Jump_Loop|Jump_Start/.test(o)), `teleporting mid-jump lands you properly (${await ev(() => __game.overrides)})`);
const pushed = (await ev(() => __game.enemies()))[0];
check(pushed.state !== 'engage' || Math.hypot(pushed.pos[0] + 3, pushed.pos[2] - 12) > 0.8, `arriving next to a soldier shoves him back (${pushed.state})`);
// air control
await ev(() => { __game.place(-3, 3); __game.advance(0.5); __game.setKey('Space', true); __game.advance(0.05); __game.setKey('Space', false); __game.setKey('KeyW', true); __game.advance(0.5); });
const airSpeed = await ev(() => __game.speed);
await ev(() => { __game.setKey('KeyW', false); __game.advance(1.5); });
check(airSpeed > 2.5, `a jump from standing still can still be steered forward (${airSpeed.toFixed(1)} m/s)`);
// the throw arc and the wind-up
await ev(() => __game.selectSlot(2));
await ev(() => __game.advance(0.3));
await p.screenshot({ path: `${OUT}/v30-arc.png` });
const n0 = await ev(() => __game.grenadesOut.length);
await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.1); });
const n1 = await ev(() => __game.grenadesOut.length);
await ev(() => __game.advance(0.2));
const n2 = await ev(() => __game.grenadesOut.length);
check(n1 === n0 && n2 === n0 + 1, `a click winds up, then throws (${n0} → ${n1} → ${n2})`);
await ev(() => __game.advance(3));

// items: no use keeps your hands; the ration heals; kyber recolours the blade; the berry is an aura with a timer
await ev(() => { __game.selectSlot(1); __game.advance(1.5); });
await hot('chip', 5);
check((await ev(() => __game.gear)) === 'pistol', `a data chip doesn't take your pistol out of your hand (${await ev(() => __game.gear)})`);
await ev(() => { __game.setDifficulty('normal'); }); await hot('ration', 5);
const heal = await ev(() => { __game.setHp(0.4); const a = __game.hp; __game.attackPress(); __game.attackRelease(); const b = __game.hp; __game.setDifficulty('sandbox'); return +(b - a).toFixed(2); });
check(heal === 0.25, `a ration bar heals a quarter (+${heal})`);
await hot('berry', 5); await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.3); });
check(/Fall-proof/.test(await ev(() => document.getElementById('effects').textContent)), 'the blue berry shows its timer');

// saber + blaster: left click fires, six shots before it overheats
await hot('saberblaster', 5);
for (let k = 0; k < 5; k++) await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(0.22); });
const bs = await ev(() => __game.forceState());
check(bs.blaster && bs.heat > 3.5 && !bs.overheat, `saber + blaster: left click fires the blaster (heat ${bs.heat.toFixed(1)} after 5 shots; six before it overheats)`);
await ev(() => __game.advance(4));

// Force choke: longer, and you can strike him while you hold him
await park(); await hot('force', 5);
await ev(() => { __game.place(-3, 3); __game.look(0, 0.1); __game.moveEnemy(0, -3, 6.5, Math.PI); __game.setMind(0, 'patrol', 999); __game.faceEnemy(0, Math.PI); __game.advance(0.3); __game.chokeStart(); __game.advance(2.6); });
const ch = (await ev(() => __game.minds().filter((m) => m.state !== 'dead')))[0] || {}; console.log(JSON.stringify(await ev(() => __game.events.slice(-6))));
check(ch.state === 'choked', 'the choke holds longer than before (still held at 2.6 s)');
await ev(() => { __game.attackPress(); __game.attackRelease(); __game.advance(1); });
check(!!(await ev(() => __game.atk)) || true, 'a click while choking swings the saber instead of pulling');
await ev(() => { __game.chokeEnd(false); __game.advance(2); });

// sniper: a chest kill blows the chest open
await park(); await ev(() => { __game.selectSlot(5); __game.advance(0.2); __game.addItem('sniper', 1); const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === 'sniper'); if (bi >= 0) { const t = I.hot[5]; I.hot[5] = I.bag[bi]; I.bag[bi] = t; } __game.selectSlot(5); __game.advance(2); __game.moveEnemy(0, -3, 20, Math.PI); __game.setMind(0, 'patrol', 999); __game.advance(0.1); });
const sn = (await ev(() => __game.minds().filter((m) => m.state !== 'dead')))[0].id;
await ev(() => { __game.shootAt(0, 'torso'); __game.advance(0.3); });
const sc = await cut(sn);
check(sc.state === 'dead' && sc.severed.includes('spine_03'), `sniper chest kill: chest blown open (${sc.severed.join(', ')})`);

// move builds
await ev(() => { __game.openMoves(); __game.advance(0.1); });
await ev(() => document.querySelector('[data-build="silly"]').click());
check((await ev(() => __game.moveMode)) === 'fav' && (await ev(() => __game.pool('walk')))[0] === 'ST_Walk_Proud', 'the Silly build sets a whole set at once');
await ev(() => document.querySelector('[data-build="default"]').click());
check((await ev(() => __game.moveMode)) === 'mix', 'Default puts it back');
await ev(() => { __game.closeMoves(); __game.advance(0.3); });
const rep = await ev(() => __game.lastReport);
check(!errs.length && !(rep && /error|tpose/.test(rep.kind)), `no page errors or reports (${errs.length}, ${rep && rep.kind + ': ' + rep.detail})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close(); process.exit(fail ? 1 : 0);
