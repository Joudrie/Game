// v37 soldier voices: the owner's recorded lines load, one voice speaks one line at a time (five soldiers never shout
// together), urgent lines cut calm ones off, takes don't repeat back to back, a soldier who dies stops talking, and the
// game's moments say the right thing (spotting you, giving up, pain, losing an arm, a leg, fire, flying, grenades,
// barrels, reloading, a buddy dying).
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
await p.mouse.click(640, 300); await p.waitForTimeout(2500); // the click starts Web Audio, which decodes the clips

const loaded = await ev(() => __game.voLoaded);
const cats = Object.keys(loaded.v1 || {}), total = Object.values(loaded.v1 || {}).reduce((a, n) => a + n, 0);
check(cats.length === 31 && total === 291 && loaded.v1.death === 64, `voice v1 decodes: ${total} takes in ${cats.length} categories, ${loaded.v1.death} death sounds`);

// an open patch of ground away from buildings and roads, as in test42
const O = await ev(() => { for (let r = 60; r < 400; r += 10) for (let a = 0; a < 6.28; a += 0.2) { const x = Math.cos(a) * r, z = Math.sin(a) * r; if (__game.blocks.every((b) => Math.hypot(Math.max(b.min[0] - x, 0, x - b.max[0]), Math.max(b.min[2] - z, 0, z - b.max[2])) > 25) && !__game.onRoad(x, z, 5)) return [Math.round(x), Math.round(z)]; } return null; });
const fresh = () => ev(([x, z]) => { const g = __game; g.fillEnemies(); g.advance(0.1); const n = g.enemies().filter((e) => e.state !== 'dead').length; for (let i = 0; i < n; i++) { g.moveEnemy(i, x + 3 + i * 1.5, z + 6, Math.PI); g.setMind(i, 'patrol', 999); } g.place(x, z); g.look(0, 0.2); g.advance(0.1); g.voReset(); }, O);
const said = () => ev(() => __game.voLog.map((s) => s.split(':')[0]));
await ev(([x, z]) => { __game.place(x, z); __game.selectSlot(0, true); __game.setGear('none'); __game.advance(1); }, O);

// one at a time: five soldiers all try to shout "Contact!" together
await fresh();
let n = await ev(() => { let c = 0; for (let i = 0; i < 5; i++) c += __game.say(i, 'spot') ? 1 : 0; return c; });
check(n === 1 && (await ev(() => __game.voCount)) === 1, `five soldiers shouting at once: only one is heard (${n})`);
// the voice is busy: a calm line from someone else waits its turn; a scream cuts in
await ev(() => __game.voReset());
await ev(() => __game.say(0, 'sus'));
const blocked = await ev(() => __game.say(1, 'giveup'));
const cut = await ev(() => __game.say(2, 'pain'));
const now = await ev(() => __game.voNow.v1), scr = await ev(() => __game.voScreams);
check(!blocked && cut && now && now.cat === 'sus' && scr.some((x) => x.cat === 'pain'), `a calm line waits; a scream plays over it (talking: ${now && now.cat}, screaming: ${scr.map((x) => x.cat)})`);
// v42: four men killed at once: four different death cries together, from where each one is
await ev(() => __game.voReset());
const four = await ev(() => { let n = 0; for (let i = 0; i < 5; i++) n += __game.say(i, 'death') ? 1 : 0; return n; });
const cries = await ev(() => __game.voScreams);
check(four === 5 && cries.length === 5 && new Set(cries.map((x) => x.take)).size === 5 && new Set(cries.map((x) => x.id)).size === 5, `five deaths at once: ${cries.length} cries together (no cap, v43), ${new Set(cries.map((x) => x.take)).size} different takes`);
const whereFrom = await ev(() => { const g = __game, e = g.enemies().filter((x) => x.state !== 'dead'); return { cry: g.voScreams[0], pos: e.find((x) => x.id === g.voScreams[0].id)?.pos }; });
check(whereFrom.cry.at && Math.abs(whereFrom.cry.at[0] - whereFrom.pos[0]) < 0.3 && Math.abs(whereFrom.cry.at[1] - whereFrom.pos[2]) < 0.3, `a cry comes from where the soldier stands (${whereFrom.cry.at} vs ${whereFrom.pos[0]},${whereFrom.pos[2]})`);
const ears = await ev(() => { __game.advance(0.05); return { ears: __game.earsAt, cam: __game.camPos || null }; });
check(Array.isArray(ears.ears) && ears.ears.some((v) => v !== 0), `the ears follow the camera (${ears.ears})`);
// takes don't repeat back to back
const takes = [];
for (let i = 0; i < 24; i++) { await ev(() => __game.voReset()); await ev(() => __game.say(0, 'spot')); takes.push((await ev(() => __game.voNow.v1))?.take); }
const soon = (list, hold) => list.filter((t, i) => list.slice(Math.max(0, i - hold), i).includes(t)).length; // v40: a take sits out for `hold` plays
const repeats = soon(takes, 5);
check(takes.every(Boolean) && repeats === 0 && new Set(takes).size === 10, `24 "Contact!"s: all 10 takes used, none again within 5 (${repeats} too soon)`);
const deaths = [];
for (let i = 0; i < 70; i++) { await ev(() => __game.voReset()); await ev(() => __game.say(0, 'death')); deaths.push((await ev(() => __game.voScreams))[0]?.take); }
check(deaths.every(Boolean) && soon(deaths, 32) === 0 && new Set(deaths).size > 45, `70 death cries: ${new Set(deaths).size} different, none again within 32 (${soon(deaths, 32)} too soon)`);
// a soldier who dies mid-sentence goes quiet (a headshot: no last cry either)
await fresh(); await ev(() => __game.say(0, 'alarm'));
const id0 = (await ev(() => __game.voNow.v1))?.id;
await ev(() => { __game.damageEnemy(0, 999, 'head', 'bullet'); __game.advance(0.1); });
const after = await ev(() => __game.voNow.v1);
check(id0 && (!after || after.id !== id0), `shot in the head mid-shout: his line stops (now: ${after ? after.cat + ' from a buddy' : 'quiet'})`);

// the moments
// spotted: he notices you (a "?"), then shouts
await fresh();
await ev(([x, z]) => { const g = __game; g.moveEnemy(0, x, z + 9, Math.PI); g.setMind(0, 'patrol', 999); g.advance(0.05); g.voReset(); for (let t = 0; t < 40; t++) g.advance(0.1); }, O);
let s = await said();
check(s.includes('sus') && (s.includes('spot') || s.includes('jedi')) && s.includes('alarm'), `a guard who sees you: "Huh?", "Contact!", then the alarm (${s.join(' ')})`);
// gives up when you slip away
await fresh();
s = await ev(([x, z]) => { const g = __game; g.moveEnemy(0, x, z + 14, Math.PI); g.setMind(0, 'patrol', 999); g.advance(0.05); g.voReset();
  for (let t = 0; t < 30 && !g.voLog.some((l) => l.startsWith('sus')); t++) g.advance(0.1);
  g.place(x, z + 45); for (let t = 0; t < 120; t++) g.advance(0.1); /* behind his back, close enough that he is still thinking */ return g.voLog.map((l) => l.split(':')[0]); }, O);
check(s.includes('sus') && s.includes('giveup'), `slip away after a "Huh?": "Must have been the wind" (${s.join(' ')})`);
// pain, then death
await fresh(); await ev(() => { __game.damageEnemy(0, 0.01, 'torso', 'bullet'); __game.advance(0.1); });
s = await said(); check(s.includes('pain') || s.includes('hit'), `a wound: a grunt or "I'm hit!" (${s.join(' ')})`);
// an arm off: "MY ARM!"; the gun hand: then "Fall back!"
await fresh(); await ev(() => { __game.cutEnemy(0, 'upperarm_r'); for (let t = 0; t < 30; t++) __game.advance(0.1); });
s = await said(); check(s[0] === 'arm' && (s.includes('panic') || s.includes('medic')), `an arm off: "MY ARM!", then "Fall back!" or "Medic!" (${s.join(' ')})`);
// a leg off: pain, then "Medic!"
await fresh(); await ev(() => { __game.cutEnemy(0, 'thigh_l'); for (let t = 0; t < 30; t++) __game.advance(0.1); });
s = await said(); check(s.includes('arm') && s.includes('medic'), `a leg off: a scream, then "Medic!" (${s.join(' ')})`);
// on fire
await fresh(); await ev(([x, z]) => { __game.firePatch(x + 3, z + 6); __game.advance(0.3); }, O);
s = await said(); check(s.includes('fire'), `set alight: screaming (${s.join(' ')})`);
// a grenade lands near them
await fresh(); await ev(() => { __game.look(0, 0.35); __game.throwKind('frag'); for (let t = 0; t < 20; t++) __game.advance(0.05); });
s = await said(); check(s.includes('grenade'), `a grenade coming down by them: "GRENADE!" (${s.join(' ')})`);
// a barrel goes off by them
await fresh();
await ev(([x, z]) => { __game.spawnBarrel(x + 12, z + 6); __game.advance(0.1); __game.voReset(); __game.shootPoint(x + 12, 0.5, z + 6); __game.selectSlot(1, true); __game.advance(1.5); __game.shootPoint(x + 12, 0.5, z + 6); for (let t = 0; t < 30; t++) __game.advance(0.1); }, O);
s = await said(); check(s.includes('barrels') || s.includes('flying'), `a barrel blows by them: "WHO PUT THOSE BARRELS THERE?!" or a flying scream (${s.join(' ')})`);
// reloading: a soldier fighting you stops after a few volleys
await fresh();
s = await ev(([x, z]) => { const g = __game; g.selectSlot(0, true); g.moveEnemy(0, x, z + 12, Math.PI); g.setMind(0, 'combat'); g.advance(0.05); g.voReset();
  for (let t = 0; t < 400 && !g.voLog.some((l) => l.startsWith('reload')); t++) g.advance(0.1); return g.voLog.map((l) => l.split(':')[0]); }, O);
check(s.includes('reload'), `a soldier in a fight stops to reload: "Reloading!" (${s.join(' ')})`);
// a buddy dies next to one who's fighting
await fresh();
s = await ev(([x, z]) => { const g = __game; g.setMind(1, 'combat'); g.advance(0.05); g.voReset(); g.damageEnemy(0, 999, 'head', 'bullet'); for (let t = 0; t < 10; t++) g.advance(0.1); return g.voLog.map((l) => l.split(':')[0]); }, O);
check(s.includes('mandown') || s.includes('whatthe') || s.includes('panic'), `a buddy goes down: "Man down!" (${s.join(' ')})`);

// v40: a calm guard near you mutters, hums, yawns or talks on the radio now and then
await fresh();
s = await ev(([x, z]) => { const g = __game; const n = g.enemies().filter((e) => e.state !== 'dead').length; for (let i = 1; i < n; i++) { g.moveEnemy(i, x + 300 + i * 4, z + 300); g.setMind(i, 'patrol', 999); } /* the rest out of sight */
  g.moveEnemy(0, x, z + 10, 0); g.setMind(0, 'patrol', 999); g.place(x, z); g.advance(0.05); g.voReset();
  for (let t = 0; t < 400 && !g.voLog.some((l) => /^(hum|idle|radio|yawn):/.test(l)); t++) g.advance(0.1); return g.voLog.map((l) => l.split(':')[0]); }, O);
check(s.some((c) => ['hum', 'idle', 'radio', 'yawn'].includes(c)), `a calm guard nearby mutters to himself (${s.join(' ')})`);
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
