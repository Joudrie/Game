// Audit 3b: combinations and sequences that cause stuck states. Real input wherever the browser allows.
// Usage: node tools/audit/bughunt.mjs [only-scenario-name]   → audit/bughunt.json + audit/shots/bh-*.png
import fs from 'fs';
import { open, park } from './lib.mjs';

const { b, p, ev, log, alert, closeAlert, shot } = await open();
const adv = (s) => ev((s) => __game.advance(s), s);
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
const st = () => ev(() => { const g = __game, f = g.forceState(); return { mode: g.mode, gear: g.gear, gun: g.gunKind, slot: g.inv.active, atk: g.atk, blocking: g.blocking, grapple: g.grappleState, cover: !!g.cover, reload: g.reload, takedown: g.takedown,
  dash: g.dash, dead: !!g.dead, speed: +g.speed.toFixed(2), pos: g.pos, y: +g.y.toFixed(2), pose: { dev: +g.pose.dev.toFixed(2), leg: +g.pose.leg.toFixed(2), arm: +g.pose.arm.toFixed(2) }, ovr: g.overrides, mags: g.ammoMags(),
  pistolInHand: g.pistolInHand, drawing: g.drawing, choke: f.choke, zap: f.zap, thrown: f.thrown, heat: f.heat, mission: g.mission, hp: g.hp, fov: +g.fov.toFixed(1), crouch: g.crouch, guard: +g.guardBlend.toFixed(2) }; });
async function reset() {
  for (const m of ['left', 'right', 'middle']) await p.mouse.up({ button: m }).catch(() => {});
  await ev(() => { const g = __game; if (g.dead) g.respawn(); g.closeMoves(); g.toggleInv(false); for (const id of ['weapon', 'missions', 'mdone', 'deathpanel']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    if (g.mission) g.endMission('quit'); g.leaveCover('audit'); if (g.grappleState === 'pull' || g.grappleState === 'fire') g.grapplePress(); g.setGadget('jetpack', false); g.setGadget('swing', false);
    g.setSneak(false); g.setDifficulty('sandbox'); g.setRmb(false); g.setAim(false); g.blockRelease(); g.attackRelease(); g.zapEnd(); g.holdFire(false); g.setClass('light'); g.setMode('ground', 0); g.place(0, -2); g.look(Math.PI, 0.28);
    g.selectSlot(0, true); g.setGear('lit'); g.advance(2); });
  await park(ev); await closeAlert(); await lock();
}
const res = {}; let cur;
const note = (k, v) => { cur[k] = v; };
const S = {};

// --- alt-tab with buttons held (blur): keys are cleared, are mouse buttons? ---
S.blurAutoFire = async () => {
  await ev(() => { __game.selectSlot(3, true); __game.advance(1.5); }); // AK
  const m0 = (await st()).mags.ak;
  await p.mouse.down(); await adv(0.3);
  await ev(() => dispatchEvent(new Event('blur'))); await ev(() => document.exitPointerLock()); // alt-tab: focus and pointer lock go; the mouseup never reaches the page
  await adv(0.1); const m1 = (await st()).mags.ak; await adv(2); const m2 = (await st()).mags.ak;
  note('ak rounds: before, at blur, 2 s after blur (no button held)', [m0, m1, m2]);
  note('keeps firing after alt-tab', m2 < m1);
  await p.mouse.up();
};
S.blurBlock = async () => {
  await p.mouse.down({ button: 'right' }); await adv(0.4);
  const a = await st();
  await ev(() => dispatchEvent(new Event('blur'))); await ev(() => document.exitPointerLock()); await adv(2);
  const c = await st(); note('blocking before / 2 s after alt-tab', [a.blocking, c.blocking]);
  await p.keyboard.down('KeyW'); await adv(1); note('speed walking after (block caps at walk speed)', (await st()).speed); await p.keyboard.up('KeyW');
  await p.mouse.up({ button: 'right' });
};
S.blurKeysHeld = async () => {
  await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(1);
  await ev(() => dispatchEvent(new Event('blur'))); await adv(1.5);
  note('speed 1.5 s after blur with W+Shift held', (await st()).speed);
  await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft'); await adv(1); note('speed after release', (await st()).speed);
};
S.blurZap = async () => {
  await ev(() => { const I = __game.inv, bi = I.bag.findIndex((x) => x && x.id === 'force'); const t = I.hot[4]; I.hot[4] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(4, true); __game.advance(1.2); });
  await ev(() => { __game.moveEnemy(0, 0, -8, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.2); });
  await p.keyboard.down('KeyH'); await adv(0.4); const a = await st();
  await ev(() => dispatchEvent(new Event('blur'))); await adv(3); const c = await st();
  note('zap on before / 3 s after blur with H held', [a.zap, c.zap]); await p.keyboard.up('KeyH');
  await ev(() => { const I = __game.inv, bi = I.bag.findIndex((x) => x && x.id === 'ak'); if (bi >= 0) { const t = I.hot[4]; I.hot[4] = I.bag[bi]; I.bag[bi] = t; } });
};
// --- switching items while busy ---
const swapDuring = async (label, setup) => {
  const out = {};
  for (const how of ['scroll-fast', 'digits-fast']) {
    await reset(); await setup();
    const before = await st();
    if (how === 'scroll-fast') for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(200); await adv(0.05); }
    else for (const d of ['Digit2', 'Digit4', 'Digit1', 'Digit6', 'Digit3', 'Digit5', 'Digit2']) { await key(d, 0.03); }
    await p.mouse.up(); await p.mouse.up({ button: 'right' });
    await adv(3); const after = await st();
    await p.keyboard.down('KeyW'); await adv(1); const walk = (await st()).speed; await p.keyboard.up('KeyW');
    out[how] = { before: { gear: before.gear, gun: before.gun, reload: before.reload, atk: before.atk, mode: before.mode }, after: { gear: after.gear, gun: after.gun, slot: after.slot, pistolInHand: after.pistolInHand, drawing: after.drawing, reload: after.reload, atk: after.atk, mode: after.mode, blocking: after.blocking, cover: after.cover, grapple: after.grapple, pose: after.pose, ovr: after.ovr }, walk, alert: await alert() };
    if (after.atk !== null || after.reload || after.mode !== 'ground' || after.pose.arm < 0.9 || after.pose.dev < 0.35 || walk < 1) { out[how].bad = true; await shot(`bh-swap-${label}-${how}`); }
    await closeAlert();
  }
  note(label, out);
};
S.swapWhileBusy = async () => {
  await swapDuring('reload', async () => { await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); }); for (let i = 0; i < 4; i++) { await click(); await adv(0.25); } await key('KeyZ'); await adv(0.2); });
  await swapDuring('rifle-reload', async () => { await ev(() => { __game.selectSlot(3, true); __game.advance(1.5); }); await click('left', 0.5); await key('KeyZ'); await adv(0.3); });
  await swapDuring('swing', async () => { await click(); await adv(0.1); });
  await swapDuring('heavy', async () => { await p.mouse.down(); await adv(0.9); });
  await swapDuring('windup', async () => { await ev(() => { __game.selectSlot(2, true); __game.advance(0.6); }); await p.mouse.down(); await adv(0.05); });
  await swapDuring('grapple', async () => { await ev(() => { __game.look(Math.atan2(4, -11), -0.05); __game.advance(0.2); }); await key('KeyR'); await adv(0.3); });
  await swapDuring('block', async () => { await p.mouse.down({ button: 'right' }); await adv(0.3); });
  await swapDuring('aim', async () => { await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); }); await p.mouse.down({ button: 'right' }); await adv(0.4); });
  await swapDuring('scope', async () => { await ev(() => { __game.selectSlot(5, true); __game.advance(1.5); }); await p.mouse.down({ button: 'right' }); await adv(0.5); });
  await swapDuring('cover', async () => { await ev(() => { __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(0.3); }); await key('KeyQ'); await adv(0.3); });
};
// --- jump into everything ---
S.jumpInto = async () => {
  const out = {};
  const cases = {
    slide: async () => { await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(1.2); await key('KeyC', 0.1); },
    reload: async () => { await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); }); await click(); await adv(0.2); await key('KeyZ'); await adv(0.2); },
    block: async () => { await p.mouse.down({ button: 'right' }); await adv(0.3); },
    cover: async () => { await ev(() => { __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(0.3); }); await key('KeyQ'); await adv(0.3); },
    takedown: async () => { await ev(() => { __game.moveEnemy(0, 0, -3, Math.PI); __game.setMind(0, 'patrol', 999); __game.faceEnemy(0, Math.PI); __game.advance(0.2); }); await key('KeyF'); await adv(0.2); },
    choke: async () => { await ev(() => { const I = __game.inv, bi = I.bag.findIndex((x) => x && x.id === 'force'); if (bi >= 0) { const t = I.hot[4]; I.hot[4] = I.bag[bi]; I.bag[bi] = t; } __game.selectSlot(4, true); __game.advance(1.2); __game.moveEnemy(0, 0, -8, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.2); }); await p.mouse.down({ button: 'right' }); await adv(0.5); },
  };
  for (const [k, f] of Object.entries(cases)) {
    await reset(); await f(); const a = await st();
    await key('Space', 0.1); await adv(0.2); const c = await st();
    for (const kk of ['KeyW', 'ShiftLeft']) await p.keyboard.up(kk); await p.mouse.up({ button: 'right' });
    await adv(3); const d = await st();
    out[k] = { before: { mode: a.mode, reload: a.reload, blocking: a.blocking, cover: a.cover, takedown: a.takedown, choke: a.choke }, afterJump: { mode: c.mode, reload: c.reload, takedown: c.takedown, cover: c.cover, choke: c.choke, y: c.y }, settled: { mode: d.mode, atk: d.atk, takedown: d.takedown, pose: d.pose, reload: d.reload }, alert: await alert() };
    if (d.mode !== 'ground' || d.takedown || d.pose.dev < 0.35) await shot('bh-jump-' + k);
    await closeAlert();
  }
  // restore the AK in slot 5
  await ev(() => { const I = __game.inv, bi = I.bag.findIndex((x) => x && x.id === 'ak'); if (bi >= 0) { const t = I.hot[4]; I.hot[4] = I.bag[bi]; I.bag[bi] = t; } });
  note('cases', out);
};
// --- cancel the grapple every way ---
S.grappleCancel = async () => {
  const out = {};
  const ways = { slide: async () => key('KeyC', 0.1), jump: async () => key('Space', 0.1), throwX: async () => key('KeyX'), teleport: async () => ev(() => __game.teleportTo(10, 10)), jetpack: async () => { await ev(() => __game.setGadget('jetpack', true)); await p.keyboard.down('Space'); await adv(0.6); await p.keyboard.up('Space'); },
    regrapple: async () => key('KeyR'), switchItem: async () => key('Digit2'), forcePush: async () => key('KeyT'), attack: async () => click(), inventory: async () => key('KeyI') };
  for (const swing of [false, true]) for (const [w, f] of Object.entries(ways)) {
    await reset(); await ev((sw) => { __game.setGadget('swing', sw); __game.look(Math.atan2(4, -11), -0.05); __game.advance(0.2); }, swing);
    await key('KeyR'); await adv(swing ? 0.6 : 0.35); const a = await st();
    await f(); await adv(0.3); const c = await st(); await adv(3); const d = await st();
    await p.keyboard.down('KeyW'); await adv(0.8); const walk = (await st()).speed; await p.keyboard.up('KeyW');
    out[(swing ? 'swing-' : 'pull-') + w] = { started: a.grapple, mid: { grapple: c.grapple, mode: c.mode }, settled: { grapple: d.grapple, mode: d.mode, pose: d.pose, y: d.y, atk: d.atk }, walk, alert: await alert() };
    if (d.grapple !== 'idle' || (d.mode !== 'ground') || walk < 1) await shot(`bh-grapple-${swing ? 'swing' : 'pull'}-${w}`);
    await closeAlert(); await ev(() => __game.toggleInv(false));
  }
  note('cases', out);
};
// --- teleport orb into walls, onto roofs, under buildings, mid-fall, mid-grapple, by soldiers ---
S.teleport = async () => {
  const out = {};
  const bl = await ev(() => __game.blocks.map((b, i) => ({ i, ...b })).filter((b) => b.max[1] > 10 && Math.hypot(b.min[0], b.min[2]) < 140).slice(0, 3));
  const tall = bl[0]; const cx = (tall.min[0] + tall.max[0]) / 2, cz = (tall.min[2] + tall.max[2]) / 2;
  const cases = {
    'inside-building-centre': [cx, cz, 0], 'building-wall-at-5m': [tall.min[0] + 0.05, cz, 5], 'roof': [cx, cz, tall.max[1] + 1],
    'inside-low-block': [9, 7, 0.5], 'map-edge-2100': [2100, 0, 0],
  };
  for (const [k, [x, z, y]] of Object.entries(cases)) {
    await reset(); await ev(([x, z, y]) => { __game.teleportTo(x, z); }, [x, z, y]);
    await adv(1); const s = await st();
    const inside = await ev(([x, z]) => __game.blocks.filter((b) => { const P = __game.pos; return P[0] > b.min[0] + 0.05 && P[0] < b.max[0] - 0.05 && P[2] > b.min[2] + 0.05 && P[2] < b.max[2] - 0.05 && P[1] < b.max[1] - 0.1; }).length, [x, z]);
    await p.keyboard.down('KeyW'); await adv(1.5); const w = await st(); await p.keyboard.up('KeyW');
    out[k] = { target: [x, z], landed: s.pos, mode: s.mode, insideABox: inside, walkSpeed: w.speed, moved: +Math.hypot(w.pos[0] - s.pos[0], w.pos[2] - s.pos[2]).toFixed(2) };
    await shot('bh-tp-' + k);
  }
  // a real orb thrown at a tall wall from up close
  await reset(); await ev(([x, z]) => { __game.place(x - 4, z); __game.look(-Math.PI / 2 * -1, 0.0); __game.advance(0.3); }, [tall.min[0], cz]);
  // the orb mid-fall and mid-grapple
  await reset(); await ev(() => { __game.setMode('air', 25); __game.advance(0.2); __game.teleportTo(5, 5); __game.advance(1); }); const f = await st(); out['mid-fall'] = { mode: f.mode, y: f.y, pose: f.pose, ovr: f.ovr };
  await reset(); await ev(() => { __game.look(Math.atan2(4, -11), -0.05); __game.advance(0.2); }); await key('KeyR'); await adv(0.4); await ev(() => { __game.teleportTo(5, 5); __game.advance(1); }); const g = await st(); out['mid-grapple'] = { mode: g.mode, grapple: g.grapple, pose: g.pose };
  await reset(); await ev(() => { __game.moveEnemy(0, 6, 6, 0); __game.moveEnemy(1, 6.5, 6, 0); __game.advance(0.2); __game.teleportTo(6, 6); __game.advance(1.5); }); out['next-to-soldiers'] = { me: (await st()).pos, them: (await ev(() => __game.enemies().filter((e) => e.state !== 'dead').slice(0, 2).map((e) => [e.state, e.pos]))) };
  await shot('bh-tp-soldiers');
  note('cases', out);
};
// --- fire: stand in it, loot and throw while enemies burn ---
S.fire = async () => {
  await ev(() => { __game.setDifficulty('normal'); __game.firePatch(0, -2); }); const h0 = (await st()).hp; await adv(3); const h1 = (await st()).hp;
  note('hp standing in fire 3 s on Normal', [h0, h1]);
  const t = Date.now(); await ev(() => { for (let i = 0; i < 6; i++) __game.firePatch(5 + i, -6); __game.advance(0.1); }); note('ms to light 6 fires', Date.now() - t);
  await ev(() => { __game.setDifficulty('sandbox'); __game.moveEnemy(0, 5, -6, 0); __game.moveEnemy(1, 7, -6, 0); __game.setMind(0, 'combat', 0); __game.advance(4); });
  note('burning soldiers', await ev(() => __game.burning())); await shot('bh-fire');
  note('particles', await ev(() => __game.particles)); note('programs (shaders)', await ev(() => __game.programs));
};
// --- inventory and menus mid-combat; empty grenades and keep pressing X ---
S.inventory = async () => {
  await ev(() => { __game.moveEnemy(0, 0, -10, 0); __game.setMind(0, 'combat', 0); });
  await key('KeyI'); await adv(1); note('enemy fight continues with inventory open (pos changes)', await ev(() => __game.enemies()[0].pos));
  await p.keyboard.down('KeyW'); await adv(1); note('can walk with inventory open (speed)', (await st()).speed); await p.keyboard.up('KeyW');
  await key('KeyI'); await lock();
  // remove the active item: drag slot 1 (saber) into the backpack while it's in hand
  const r = await ev(() => { __game.selectSlot(0, true); __game.advance(1); __game.moveItem({ where: 'hot', i: 0 }, { where: 'bag', i: 19 }); __game.advance(1.5); return { gear: __game.gear, slot: __game.inv.active, hot0: __game.inv.hot[0] }; });
  note('saber moved out of the active slot', r);
  await ev(() => { __game.moveItem({ where: 'bag', i: 19 }, { where: 'hot', i: 0 }); });
  // no grenades left
  const n = await ev(() => { __game.testCfg.infiniteNades = false; const c = __game.countItem('grenade'); for (let i = 0; i < c; i++) { __game.throwKind('frag'); __game.advance(0.7); } return __game.countItem('grenade'); });
  await adv(3); for (let i = 0; i < 6; i++) { await key('KeyX'); await adv(0.1); }
  note('grenades left after throwing all, then X×6', n); note('toast', await ev(() => document.getElementById('toast').textContent)); note('alert', await alert());
  await ev(() => { __game.addItem('grenade', 5); __game.testCfg.infiniteNades = true; });
  // fill the backpack, then loot a body
  const fill = await ev(() => { let k = 0; while (__game.inv.bag.includes(null) && k++ < 40) __game.addItem('chip', 10); return __game.inv.bag.filter(Boolean).length; });
  await ev(() => { __game.moveEnemy(0, 0, -3.5, 0); __game.damageEnemy(0, 999, 'torso'); __game.advance(2); });
  await key('KeyG'); await adv(4); note('backpack full, loot', { bagUsed: fill, log: await ev(() => __game.lootLog.slice(-3)), toast: await ev(() => document.getElementById('toast').textContent) });
  await shot('bh-loot-full');
  await ev(() => { for (let i = 0; i < 20; i++) if (__game.inv.bag[i]?.id === 'chip') __game.inv.bag[i] = null; });
};
// --- reload edge cases ---
S.reload = async () => {
  await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); });
  await key('KeyZ'); await adv(0.2); note('reload a full magazine starts a reload?', (await st()).reload);
  await adv(3);
  const noAmmo = await ev(() => { __game.testCfg.infiniteAmmo = false; for (const k of ['ammo']) while (__game.countItem(k)) { const I = __game.inv; for (const arr of [I.hot, I.bag]) for (let i = 0; i < arr.length; i++) if (arr[i]?.id === k) arr[i] = null; } return __game.countItem('ammo'); });
  for (let i = 0; i < 14; i++) { await click(); await adv(0.25); }
  await key('KeyZ'); await adv(0.3); note('no spare pistol ammo: mag, reload state, toast', { ammoItems: noAmmo, mags: (await st()).mags.pistol, reload: (await st()).reload, toast: await ev(() => document.getElementById('toast').textContent) });
  await ev(() => { __game.testCfg.infiniteAmmo = true; __game.addItem('ammo', 60); });
  // switch guns mid-reload and back
  await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); }); await click(); await key('KeyZ'); await adv(0.3);
  await key('Digit4'); await adv(0.6); await key('Digit2'); await adv(0.3); const a = await st(); await adv(3); const c = await st();
  note('pistol reload → AK → pistol', { right: { reload: a.reload, gun: a.gun }, later: { reload: c.reload, mags: c.mags, pose: c.pose, pistolInHand: c.pistolInHand } });
  await shot('bh-reload-switchback');
};
// --- dying in many states (Extreme) and respawning ---
S.dieEverywhere = async () => {
  const out = {};
  const states = {
    sliding: async () => { await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(1.2); await key('KeyC', 0.1); },
    air: async () => { await key('Space'); await adv(0.2); },
    grapple: async () => { await ev(() => { __game.look(Math.atan2(4, -11), -0.05); __game.advance(0.2); }); await key('KeyR'); await adv(0.35); },
    cover: async () => { await ev(() => { __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(0.3); }); await key('KeyQ'); await adv(0.3); },
    swinging: async () => { await click(); await adv(0.1); },
    reloading: async () => { await ev(() => { __game.selectSlot(1, true); __game.advance(1.2); }); await click(); await key('KeyZ'); await adv(0.2); },
    scoped: async () => { await ev(() => { __game.selectSlot(5, true); __game.advance(1.5); }); await p.mouse.down({ button: 'right' }); await adv(0.6); },
    jetpack: async () => { await ev(() => __game.setGadget('jetpack', true)); await key('Space'); await p.keyboard.down('Space'); await adv(0.8); },
    inventoryOpen: async () => { await key('KeyI'); },
  };
  for (const [k, f] of Object.entries(states)) {
    await reset(); await ev(() => __game.setDifficulty('extreme')); await f();
    await ev(() => { __game.hurt(1.5); __game.advance(2); }); const d = await st();
    for (const kk of ['KeyW', 'ShiftLeft', 'Space']) await p.keyboard.up(kk); await p.mouse.up({ button: 'right' });
    await ev(() => __game.toggleInv(false));
    await key('Enter'); await adv(2); const r = await st();
    await p.keyboard.down('KeyW'); await adv(1); const w = (await st()).speed; await p.keyboard.up('KeyW');
    out[k] = { died: d.dead, afterRespawn: { dead: r.dead, mode: r.mode, grapple: r.grapple, cover: r.cover, reload: r.reload, atk: r.atk, fov: r.fov, gear: r.gear, pose: r.pose, hp: r.hp }, walk: w, alert: await alert() };
    if (!d.dead || r.dead || r.mode !== 'ground' || w < 1 || r.fov < 50) await shot('bh-die-' + k);
    await closeAlert();
  }
  note('cases', out);
};
// --- missions started from odd states; quit; reload the page mid-mission ---
S.missionsOdd = async () => {
  const out = {};
  for (const [k, f] of Object.entries({
    airborne: async () => { await key('Space'); await adv(0.2); },
    cover: async () => { await ev(() => { __game.place(9, 4.4); __game.look(0, 0.28); __game.advance(0.3); }); await key('KeyQ'); await adv(0.3); },
    grappling: async () => { await ev(() => { __game.look(Math.atan2(4, -11), -0.05); __game.advance(0.2); }); await key('KeyR'); await adv(0.35); },
  })) {
    await reset(); await f(); await ev(() => { __game.startMission('m1'); }); await adv(3); const s = await st();
    out[k] = { mission: s.mission && s.mission.state, mode: s.mode, grapple: s.grapple, cover: s.cover, pos: s.pos };
    await shot('bh-mission-from-' + k);
  }
  note('start from', out);
  // inventory survives a page reload mid-mission?
  await reset();
  const before = await ev(() => JSON.stringify([__game.inv.hot.map((x) => x && x.id + x.qty), __game.inv.bag.map((x) => x && x.id + x.qty)]));
  await ev(() => { __game.startMission('m1'); __game.advance(2); });
  const during = await ev(() => JSON.stringify([__game.inv.hot.map((x) => x && x.id + x.qty)]));
  await p.reload(); await p.waitForFunction(() => window.__game, null, { timeout: 180000 }); await adv(1);
  const after = await ev(() => JSON.stringify([__game.inv.hot.map((x) => x && x.id + x.qty), __game.inv.bag.map((x) => x && x.id + x.qty)]));
  note('reload mid-mission restores the sandbox inventory', { same: before === after, before, during, after });
  await lock();
};
// --- several keys at once, single-frame and 30 s holds ---
S.mash = async () => {
  for (const k of ['KeyW', 'KeyA', 'ShiftLeft', 'KeyC', 'Space']) await p.keyboard.down(k);
  await adv(2); const a = await st(); for (const k of ['KeyW', 'KeyA', 'ShiftLeft', 'KeyC', 'Space']) await p.keyboard.up(k); await adv(3); const c = await st();
  note('W+A+Shift+C+Space held 2 s', { during: { mode: a.mode, speed: a.speed, y: a.y }, after: { mode: c.mode, pose: c.pose } });
  for (let i = 0; i < 20; i++) { await p.mouse.down({ button: 'right' }); await p.mouse.down(); await adv(0.03); await p.mouse.up(); await p.mouse.up({ button: 'right' }); await adv(0.03); }
  await adv(3); const d = await st(); note('right+left click spam ×20, 3 s later', { atk: d.atk, blocking: d.blocking, pose: d.pose, guard: d.guard });
  await p.keyboard.down('KeyR'); await p.keyboard.down('KeyT'); await p.keyboard.down('KeyX'); await adv(0.1); for (const k of ['KeyR', 'KeyT', 'KeyX']) await p.keyboard.up(k); await adv(3);
  const e = await st(); note('R+T+X together', { mode: e.mode, grapple: e.grapple, pose: e.pose, alert: await alert() });
  // single-frame presses
  await reset(); for (const k of ['Space', 'KeyC', 'KeyF', 'KeyE', 'KeyE']) { await p.keyboard.down(k); await p.keyboard.up(k); } await adv(0.05); await adv(3);
  const f = await st(); note('single-frame Space, C, F, E, E', { mode: f.mode, gear: f.gear, atk: f.atk, pose: f.pose });
  // hold W + Shift 30 s, and hold C 30 s
  await reset(); await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(30); const g = await st(); await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft');
  note('sprint 30 s', { speed: g.speed, pos: g.pos, mode: g.mode, alert: await alert() }); await closeAlert();
  await reset(); await p.keyboard.down('KeyC'); await adv(30); const h = await st(); await p.keyboard.up('KeyC'); await adv(2);
  note('hold C 30 s (saber lit)', { crouch: h.crouch, mode: h.mode, pose: h.pose });
  await reset(); await p.mouse.down(); await adv(30); const i = await st(); await p.mouse.up(); await adv(3); const j = await st();
  note('hold left click 30 s with the saber', { during: { atk: i.atk, pose: i.pose }, after: { atk: j.atk, pose: j.pose } });
};
// --- resize the window mid-game ---
S.resize = async () => {
  const out = {};
  for (const [w, h] of [[1920, 1080], [375, 667], [667, 375], [1280, 720]]) {
    await p.setViewportSize({ width: w, height: h }); await adv(0.5); await p.waitForTimeout(400);
    const lay = await ev(() => { const r = (id) => { const e = document.getElementById(id); if (!e || e.hidden) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
      const over = [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.right > innerWidth + 1 || b.left < -1) && getComputedStyle(e).position !== 'absolute'; }).slice(0, 5).map((e) => e.id || e.className);
      return { canvas: r('stage') || [innerWidth, innerHeight], hotbar: r('hotbar'), help: r('help'), topbar: r('top'), scrollW: document.documentElement.scrollWidth, innerW: innerWidth, overflow: over }; });
    out[`${w}x${h}`] = lay; await p.screenshot({ path: new URL(`../../audit/shots/bh-resize-${w}x${h}.png`, import.meta.url).pathname });
  }
  note('layouts', out);
};

const only = process.argv[2];
for (const [name, f] of Object.entries(S)) {
  if (only && name !== only) continue;
  cur = res[name] = {}; const e0 = log.errors.length, r0 = log.reports.length;
  try { await reset(); await f(); } catch (e) { cur.exception = String(e.message || e).slice(0, 400); }
  cur.errors = log.errors.slice(e0); cur.reports = log.reports.slice(r0).map((r) => r.slice(0, 260));
  console.log(name, JSON.stringify(cur).slice(0, 1500));
}
fs.writeFileSync(new URL(`../../audit/bughunt${only ? '-' + only : ''}.json`, import.meta.url), JSON.stringify(res, null, 1));
await b.close();
