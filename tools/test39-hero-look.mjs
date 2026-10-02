// v34: the dressed hero. The Ranger outfit (Quaternius, CC0) is the default look; Menu → Moves → Look switches back
// to the Superhero; the choice is saved; your corpse wears the same; the holocloak still works on the outfit.
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://127.0.0.1:8766/preview2.html', OUT = process.env.OUT || '.';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = []; p.on('pageerror', (e) => { errs.push(e.message); console.log('pageerror:', e.message); });
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
const ev = (f, a) => p.evaluate(f, a);
let fail = 0; const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) fail++; };
const parts = (corpse) => ev((c) => __game.visibleParts(c), corpse);
const outfit = (l) => l.filter((s) => /Ranger/.test(s)).length, bare = (l) => l.filter((s) => /^Sphere005_Retopology004_1:/.test(s)).length;

let v = await parts();
check((await ev(() => __game.heroLook)) === 'ranger' && outfit(v) >= 8 && bare(v) === 0, `the hooded Ranger by default (${outfit(v)} outfit pieces, bare body hidden)`);
check(v.some((s) => /^Sphere005_Retopology004:/.test(s)) && v.some((s) => /^Eyes:/.test(s)), 'his face shows under the hood');

// Menu → Look → Superhero, by clicks
await ev(() => __game.openMoves()); await p.waitForTimeout(100);
const btns = await ev(() => [...document.querySelectorAll('#movesbody [data-look]')].map((x) => x.dataset.look + ':' + x.getAttribute('aria-pressed')));
check(btns.join() === 'ranger:true,superhero:false', `Look buttons in the menu (${btns.join(', ')})`);
await p.click('#movesbody [data-look="superhero"]');
v = await parts();
check(outfit(v) === 0 && bare(v) === 1, 'Superhero: the outfit goes, the bare body comes back');
await ev(() => __game.closeMoves());
await p.reload(); await p.waitForFunction(() => window.__game, null, { timeout: 120000 });
check((await ev(() => __game.heroLook)) === 'superhero' && outfit(await parts()) === 0, 'the choice is kept after a reload');
await ev(() => __game.setLook('ranger'));

// your body when you die wears the outfit too, even blown apart
await ev(() => { __game.setDifficulty('normal'); __game.advance(0.5); const P = __game.pos; __game.explodeAt(P[0], P[1] + 0.3, P[2]); __game.advance(1.5); });
const d = await ev(() => __game.dead);
const cp = await parts(true);
check(!!d && outfit(cp) >= 8 && bare(cp) === 0, `your corpse is the Ranger too (${outfit(cp)} outfit pieces)`);

await ev(() => { __game.setDebugCam(null); __game.respawn(); __game.setDifficulty('sandbox'); __game.advance(0.5); });
check(!(await ev(() => __game.dead)) && outfit(await parts()) >= 8, 'respawned as the Ranger');

// the holocloak fades the outfit as well
await ev(() => { __game.addItem('holocloak', 1); const I = __game.inv; const bi = I.bag.findIndex((x) => x && x.id === 'holocloak'); const t = I.hot[5]; I.hot[5] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(5); __game.advance(0.3); __game.attackPress(); __game.attackRelease(); __game.advance(0.3); });
const op = await ev(() => { const o = []; __game.heroMeshes?.().forEach((m) => o.push(m)); return o; });
check(op.length > 8 && op.every((x) => x < 0.5), `cloaked: every visible piece is see-through (${op.length})`);
check(errs.length === 0, `no page errors (${errs.length})`);
console.log(fail ? `${fail} FAILED` : 'all passed');
await b.close();
process.exit(fail ? 1 : 0);
