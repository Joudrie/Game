// Audit 3c, part A: movement, camera, saber, dismemberment, the Force, saber + blaster, guns.
// Measures numbers and takes screenshots for every feature. Usage: node tools/audit/systems-a.mjs [only]
import fs from 'fs';
import { open, park } from './lib.mjs';

const { b, p, ev, log, alert, closeAlert, shot } = await open();
const adv = (s) => ev((s) => __game.advance(s), s);
const lock = async () => { if (!(await ev(() => document.pointerLockElement === document.querySelector('canvas')))) { await p.mouse.click(640, 300); await p.waitForTimeout(150); } };
const key = async (k, hold = 0.08) => { await p.keyboard.down(k); await adv(hold); await p.keyboard.up(k); };
const click = async (button = 'left', hold = 0.05) => { await p.mouse.down({ button }); await adv(hold); await p.mouse.up({ button }); };
async function reset() {
  for (const m of ['left', 'right', 'middle']) await p.mouse.up({ button: m }).catch(() => {});
  for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space', 'KeyC', 'KeyH']) await p.keyboard.up(k).catch(() => {});
  await ev(() => { const g = __game; if (g.dead) g.respawn(); g.closeMoves(); g.toggleInv(false); for (const id of ['weapon', 'missions', 'mdone', 'deathpanel']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    if (g.mission) g.endMission('quit'); g.leaveCover('audit'); if (g.grappleState === 'pull' || g.grappleState === 'fire') g.grapplePress(); g.setGadget('jetpack', false); g.setGadget('swing', false);
    g.setSneak(false); g.setDifficulty('sandbox'); g.setRmb(false); g.setAim(false); g.blockRelease(); g.attackRelease(); g.zapEnd(); g.holdFire(false); g.setClass('light'); g.setMode('ground', 0); g.place(0, -2); g.look(Math.PI, 0.28);
    g.selectSlot(0, true); g.setGear('lit'); g.setDebugCam(null); g.advance(2); });
  await park(ev); await closeAlert(); await lock();
}
// point the camera at a world point (the shot leaves along the camera's view)
const aimAt = (x, y, z) => ev(([x, y, z]) => { for (let i = 0; i < 3; i++) { const c = __game.camPos, dx = x - c[0], dy = y - c[1], dz = z - c[2]; __game.look(Math.atan2(dx, dz), -Math.atan2(dy, Math.hypot(dx, dz))); __game.advance(0.05); } }, [x, y, z]);
const living = () => ev(() => __game.enemies().filter((e) => e.state !== 'dead'));
const swapIn = (id, slot = 4) => ev(([id, slot]) => { const I = __game.inv; let bi = I.bag.findIndex((x) => x && x.id === id); if (bi < 0) { const hi = I.hot.findIndex((x) => x && x.id === id); if (hi >= 0) { __game.selectSlot(hi, true); __game.advance(1.3); return; } __game.addItem(id, 1); bi = I.bag.findIndex((x) => x && x.id === id); } const t = I.hot[slot]; I.hot[slot] = I.bag[bi]; I.bag[bi] = t; __game.selectSlot(slot, true); __game.advance(1.3); }, [id, slot]);
const restoreHot = () => ev(() => { const want = ['saber', 'pistol', 'grenade', 'ak', 'shotgun', 'sniper'], I = __game.inv; want.forEach((id, s) => { if (I.hot[s]?.id === id) return; const bi = I.bag.findIndex((x) => x && x.id === id); if (bi >= 0) { const t = I.hot[s]; I.hot[s] = I.bag[bi]; I.bag[bi] = t; } }); __game.selectSlot(0, true); });
const res = {}; let cur; const note = (k, v) => { cur[k] = v; };
const S = {};

S.movement = async () => {
  const out = {};
  for (const k of ['light', 'force', 'heavy']) {
    await reset(); await ev((k) => __game.setClass(k), k);
    const sp = {};
    await ev(() => __game.setSneak(true)); await p.keyboard.down('KeyW'); await adv(1.5); sp.sneak = await ev(() => +__game.speed.toFixed(2)); await p.keyboard.up('KeyW'); await ev(() => __game.setSneak(false)); await adv(1);
    await p.keyboard.down('KeyW'); await adv(1.5); sp.jog = await ev(() => +__game.speed.toFixed(2));
    await p.keyboard.down('ShiftLeft'); await adv(2); sp.sprint = await ev(() => +__game.speed.toFixed(2));
    const x0 = await ev(() => __game.pos); await key('KeyC', 0.1); const sl = await ev(() => __game.slide); let peak = 0; for (let i = 0; i < 20; i++) { await adv(0.05); peak = Math.max(peak, await ev(() => __game.speed)); }
    const x1 = await ev(() => __game.pos); sp.slide = { startSpeed: sl.speed, dur: sl.dur, peak: +peak.toFixed(2), dist1s: +Math.hypot(x1[0] - x0[0], x1[2] - x0[2]).toFixed(2) };
    await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft'); await adv(2);
    // jump heights with infinite jumps off (the class's own limits)
    await ev(() => { __game.testCfg.infiniteJumps = false; });
    const heights = [];
    for (let n = 1; n <= 4; n++) { await reset(); await ev((k) => { __game.setClass(k); __game.testCfg.infiniteJumps = false; }, k); let top = 0; for (let j = 0; j < n; j++) { await key('Space', 0.05); for (let t = 0; t < 12; t++) { await adv(0.05); top = Math.max(top, await ev(() => __game.y)); } } heights.push(+top.toFixed(2)); }
    sp.jumpPeak1to4 = heights; await ev(() => { __game.testCfg.infiniteJumps = true; });
    out[k] = sp;
  }
  note('by class', out);
  // air control: jump straight up next to the low block and steer onto it
  await reset(); await ev(() => { __game.place(9, 4.2); __game.look(0, 0.28); __game.advance(0.3); }); await key('Space', 0.05); await p.keyboard.down('KeyW'); await adv(1.2); await p.keyboard.up('KeyW'); await adv(1);
  note('air control: jump by the 1.4 m block and steer on (y after)', await ev(() => __game.y));
  // infinite jumps (on by default): how high can you go
  await reset(); for (let i = 0; i < 25; i++) { await key('Space', 0.05); await adv(0.25); } note('25 jumps with the default infinite jumps: height', await ev(() => __game.y)); await shot('sa-infinite-jumps');
  // wall run: sprint along a wall with the Force class and jump
  await reset(); await ev(() => { __game.setClass('force'); __game.place(0.2, -9); __game.look(Math.PI / 2 * -1 + Math.PI, 0.28); __game.advance(0.2); });
  const blk = await ev(() => __game.blocks[2]); note('wall block', blk);
  await ev(([b]) => { __game.place(b.min[0] - 0.6, b.min[2] - 6); __game.look(0, 0.28); __game.advance(0.2); }, [blk]);
  await ev(() => __game.look(0, 0.28)); // camera yaw 0 = facing +z (along the wall's west face)
  await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(1.2); await key('Space', 0.05); let wr = false; for (let i = 0; i < 20; i++) { await adv(0.05); wr = wr || await ev(() => __game.wallRun); }
  await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft'); note('wall run triggered running along a wall (Force class)', wr); await shot('sa-wallrun');
  // ground pound
  await reset(); await ev(() => { __game.moveEnemy(0, 0, -6, 0); __game.moveEnemy(1, 2, -5, 0); __game.advance(0.2); }); await key('Space', 0.05); await adv(0.3); await key('Space', 0.05); await adv(0.2); await click(); await adv(1.5);
  note('ground pound: soldiers hit', await ev(() => __game.enemies().filter((e) => e.state === 'dead' || e.state === 'knock').length)); await shot('sa-groundpound');
  // fall damage on Normal: drop from 8, 12, 20 m; and with the blue berry
  const falls = {};
  for (const h of [6, 9, 14, 25]) { await reset(); await ev((h) => { __game.setDifficulty('normal'); __game.setHp(1); __game.setMode('air', h); __game.advance(4); }, h); falls[h + 'm'] = await ev(() => ({ hp: __game.hp, dead: !!__game.dead })); }
  note('fall damage on Normal (hp after)', falls);
  await reset(); await ev(() => { __game.setDifficulty('normal'); __game.setHp(1); __game.addItem('berry', 1); }); await swapIn('berry'); await click(); await adv(0.3); await ev(() => { __game.setMode('air', 25); __game.advance(4); });
  note('25 m fall with the blue berry', await ev(() => ({ hp: __game.hp, dead: !!__game.dead, safe: __game.fallSafeT }))); await shot('sa-berry-aura'); await restoreHot();
  // jetpack: how high in 20 s held, and fuel?
  await reset(); await ev(() => __game.setGadget('jetpack', true)); await key('Space', 0.05); await p.keyboard.down('Space'); await adv(20); const jy = await ev(() => [__game.y, __game.mode]); await p.keyboard.up('Space'); await adv(1);
  await p.keyboard.down('KeyC'); await adv(5); const hy = await ev(() => [__game.y, __game.mode]); await p.keyboard.up('KeyC');
  note('jetpack: held 20 s (height, mode), then hover 5 s', { held: jy, hover: hy }); await shot('sa-jetpack');
  await adv(30); note('after letting go: mode, y', await ev(() => [__game.mode, __game.y]));
  // map edge
  await reset(); await ev(() => { __game.place(1990, 0); __game.look(Math.PI / 2, 0.2); __game.advance(0.2); }); await p.keyboard.down('KeyD'); await p.keyboard.down('ShiftLeft'); await adv(6); await p.keyboard.up('KeyD'); await p.keyboard.up('ShiftLeft');
  note('walk past the 4 km ground plane edge: pos, mode', await ev(() => [__game.pos, __game.mode])); await shot('sa-map-edge');
};

S.camera = async () => {
  const d = (c, p) => +Math.hypot(c[0] - p[0], c[1] - p[1] - 1.55, c[2] - p[2]).toFixed(2);
  const base = await ev(() => [__game.camPos, __game.pos]);
  await key('KeyB'); await adv(1); const sw = await ev(() => [__game.camPos, __game.pos]); await key('KeyB'); await adv(1);
  note('shoulder swap moves the camera sideways (m)', +Math.hypot(sw[0][0] - base[0][0], sw[0][2] - base[0][2]).toFixed(2));
  await p.keyboard.down('ShiftLeft'); for (let i = 0; i < 10; i++) await p.mouse.wheel(0, 400); await p.keyboard.up('ShiftLeft'); await adv(1); const far = await ev(() => [__game.camPos, __game.pos]);
  await p.keyboard.down('ShiftLeft'); for (let i = 0; i < 20; i++) await p.mouse.wheel(0, -400); await p.keyboard.up('ShiftLeft'); await adv(1); const near = await ev(() => [__game.camPos, __game.pos]);
  note('zoom range: camera distance near / default / far', [d(...near), d(...base), d(...far)]); await shot('sa-cam-near');
  await p.keyboard.down('ShiftLeft'); for (let i = 0; i < 4; i++) await p.mouse.wheel(0, 400); await p.keyboard.up('ShiftLeft');
  // the rifle offset and scope
  await ev(() => { __game.selectSlot(3, true); __game.advance(1.5); }); await shot('sa-cam-rifle'); await p.mouse.down({ button: 'right' }); await adv(0.6); await shot('sa-cam-rifle-aim'); await p.mouse.up({ button: 'right' });
  await ev(() => { __game.selectSlot(5, true); __game.advance(1.5); }); await p.mouse.down({ button: 'right' }); await adv(0.6); note('sniper scope fov', await ev(() => __game.fov)); await shot('sa-cam-scope'); await p.mouse.up({ button: 'right' });
  // camera against buildings: back up into a wall and look around
  await reset(); await ev(() => { __game.place(4, -9.5); __game.look(0, 0.2); __game.advance(1); }); await shot('sa-cam-wall-behind');
  for (const [yaw, pitch, n] of [[Math.PI, 0.1, 'facing-wall'], [1.2, 0.9, 'looking-down'], [0.3, -0.4, 'looking-up']]) { await ev(([y, pp]) => { __game.look(y, pp); __game.advance(0.6); }, [yaw, pitch]); await shot('sa-cam-' + n); }
  // a tree: does the camera go through trunks?
};

S.saber = async () => {
  // combo by clicks, timed at 0.25 s intervals
  await ev(() => { __game.moveEnemy(0, 0, -20, 0); __game.advance(0.1); });
  const chain = []; for (let i = 0; i < 8; i++) { await click(); await adv(0.25); chain.push(await ev(() => __game.atk)); }
  note('combo hit index after each click (0.25 s apart)', chain); await adv(2);
  const t0 = []; await click(); for (let i = 0; i < 40; i++) { await adv(0.05); t0.push(await ev(() => __game.atk)); } note('one click: swing length (s)', (t0.findIndex((x) => x === null) + 1) * 0.05);
  await p.mouse.down(); await adv(0.6); note('hold click: heavy', await ev(() => __game.atk)); await p.mouse.up(); await adv(3);
  // draw and holster timing
  await key('KeyE'); let tt = 0; while (tt < 3 && (await ev(() => __game.drawing))) { await adv(0.05); tt += 0.05; } note('holster time (s)', +tt.toFixed(2));
  await key('KeyE'); tt = 0; await adv(0.02); while (tt < 3 && (await ev(() => __game.drawing))) { await adv(0.05); tt += 0.05; } note('draw time (s)', +tt.toFixed(2)); await shot('sa-saber-lit');
  // blocking a bolt from the front, side and back; parry timing; guard break
  const blocks = {};
  for (const [nm, x, z, yw] of [['front', 0, -8, 0], ['side', 8, -2, -Math.PI / 2], ['back', 0, 6, Math.PI]]) {
    await reset(); await ev(([x, z, yw]) => { __game.moveEnemy(0, x, z, yw); __game.setMind(0, 'combat', 0); __game.advance(0.1); }, [x, z, yw]);
    await p.mouse.down({ button: 'right' }); await adv(0.3); const b0 = await ev(() => __game.blockedShots); await ev(() => { __game.enemyBolt(0); __game.advance(1); }); blocks[nm] = (await ev(() => __game.blockedShots)) - b0; await p.mouse.up({ button: 'right' });
  }
  note('bolts blocked (1 each) by direction', blocks);
  await reset(); await ev(() => { __game.moveEnemy(0, 0, -8, 0); __game.setMind(0, 'combat', 0); __game.advance(0.1); });
  const p0 = await ev(() => __game.parries); await ev(() => __game.enemyBolt(0)); await adv(0.35); await p.mouse.down({ button: 'right' }); await adv(1); await p.mouse.up({ button: 'right' });
  note('parry by blocking just before arrival (0.35 s after the shot)', (await ev(() => __game.parries)) - p0);
  await p.mouse.down({ button: 'right' }); await adv(0.2); let br = 0; for (let i = 0; i < 14; i++) { await ev(() => { __game.enemyBolt(0); __game.advance(0.25); }); if (await ev(() => __game.guardBrokenT) > 0) { br = i + 1; break; } }
  note('bolts until the guard breaks', br); await shot('sa-guardbreak'); await p.mouse.up({ button: 'right' });
  // a soldier walking into the lit blade gets cut
  await reset(); await ev(() => { __game.moveEnemy(0, 0, -6, Math.PI); __game.setMind(0, 'combat', 0); __game.advance(0.05); });
  await p.mouse.down({ button: 'right' }); for (let i = 0; i < 40; i++) { await adv(0.1); if ((await ev(() => __game.enemies()[0].state)) === 'dead') break; } await p.mouse.up({ button: 'right' });
  note('soldier walking at you while you guard: cut? (state, cuts)', await ev(() => [__game.enemies()[0].state, __game.cuts()[0].severed, __game.cuts()[0].label])); await shot('sa-walk-into-blade');
  // a real swing at a soldier in front: what comes off
  const cutsSeen = [];
  for (let i = 0; i < 6; i++) { await reset(); await ev(() => { __game.moveEnemy(0, 0, -3.3, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.1); }); await click(); await adv(0.6); await click(); await adv(0.6); await click(); await adv(1); cutsSeen.push(await ev(() => { const c = __game.cuts()[0]; return [c.state, c.severed.join('+'), c.label]; })); if (i === 1) await shot('sa-swing-cut'); }
  note('three swings at a soldier in front, six tries: [state, severed, label]', cutsSeen);
  // dash strike
  await reset(); await ev(() => { __game.moveEnemy(0, 0, -14, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.1); });
  const d0 = await ev(() => __game.dashes); await p.keyboard.down('KeyW'); await p.keyboard.down('ShiftLeft'); await adv(0.8); await click(); await adv(1); await p.keyboard.up('KeyW'); await p.keyboard.up('ShiftLeft');
  note('dash strike: dashes, soldier state', [(await ev(() => __game.dashes)) - d0, await ev(() => __game.enemies()[0].state)]); await shot('sa-dash');
  // saber throw
  await reset(); await ev(() => { __game.moveEnemy(0, 0, -8, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.1); }); await aimAt(0, 1.2, -8);
  await key('KeyY'); await adv(0.3); await shot('sa-saberthrow'); await adv(2); note('saber throw at a soldier 6 m ahead: state, cut', await ev(() => [__game.enemies()[0].state, __game.cuts()[0].severed, __game.forceState().thrown]));
  // ember and blood
  await reset(); await ev(() => { for (let i = 0; i < 4; i++) { __game.moveEnemy(i, -1 + i * 0.7, -3.5, 0); __game.setMind(i, 'patrol', 999); } __game.cutEnemy(0, 'head'); __game.cutEnemy(0, 'upperarm_l'); __game.cutEnemy(0, 'thigh_r'); __game.cutEnemy(0, 'spine_02'); __game.advance(2); __game.setDebugCam([1.5, 1.6, -0.5], [0.5, 0.5, -3.5]); __game.advance(0.1); });
  await shot('sa-dismember-close'); note('cuts applied', await ev(() => __game.cuts().slice(0, 4))); note('blood', await ev(() => __game.blood())); await ev(() => __game.setDebugCam(null));
  // dual combos via Moves are in test23; record the move pool sizes
  note('move pools', await ev(() => { const o = {}; for (const s of ['idle', 'walk', 'jog', 'sprint', 'jump', 'slide', 'combo', 'dual', 'fists', 'heavy', 'draw', 'holster']) { try { o[s] = __game.pool(s).length; } catch (_) { o[s] = 'n/a'; } } return o; }));
};

S.force = async () => {
  await swapIn('force');
  await ev(() => { __game.moveEnemy(0, 0, -9, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.3); });
  await aimAt(0, 1.2, -9); await adv(0.3); note('marker on the soldier', await ev(() => __game.forceState())); await shot('sa-force-marker');
  await click(); await adv(1.2); note('pull: soldier ends where (m from you), state', await ev(() => { const e = __game.enemies()[0], P = __game.pos; return [+Math.hypot(e.pos[0] - P[0], e.pos[2] - P[2]).toFixed(2), e.state, __game.cuts()[0].severed]; })); await shot('sa-force-pull');
  await reset(); await swapIn('force'); await ev(() => { __game.moveEnemy(0, 0, -7, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.3); }); await aimAt(0, 1.2, -7);
  await p.mouse.down({ button: 'right' }); await adv(1.0); await shot('sa-force-choke'); const ch = await ev(() => [__game.forceState().choke, __game.enemies()[0].state, __game.enemies()[0].pos]);
  await p.keyboard.down('KeyW'); await adv(1.0); await p.keyboard.up('KeyW'); await click(); await adv(0.6); await click(); await adv(1);
  note('choke: [held, state, pos] then walk up and click twice → state, cut', [ch, await ev(() => [__game.enemies()[0].state, __game.cuts()[0].severed, __game.forceState().choke])]); await p.mouse.up({ button: 'right' });
  await reset(); await swapIn('force'); await ev(() => { __game.moveEnemy(0, 0, -7, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.3); }); await aimAt(0, 1.2, -7);
  await p.mouse.down({ button: 'right' }); await adv(6); note('choke held 6 s: still choking, soldier state', await ev(() => [__game.forceState().choke, __game.enemies()[0].state, __game.enemies()[0].death])); await p.mouse.up({ button: 'right' });
  await reset(); await swapIn('force'); await ev(() => { __game.moveEnemy(0, 0, -7, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.3); }); await aimAt(0, 1.2, -7);
  await p.keyboard.down('KeyH'); let zt = 0; for (; zt < 6; zt += 0.1) { await adv(0.1); if ((await ev(() => __game.enemies()[0].state)) === 'dead') break; } await shot('sa-force-zap'); await p.keyboard.up('KeyH');
  note('lightning: seconds to kill, zap left', [+zt.toFixed(1), await ev(() => __game.forceState().zapLeft)]);
  await reset(); await ev(() => { for (let i = 0; i < 3; i++) { __game.moveEnemy(i, -1 + i, -5, 0); __game.setMind(i, 'patrol', 999); } __game.advance(0.2); }); await aimAt(0, 1, -5); await key('KeyT'); await adv(2);
  note('Force push at 3 soldiers 3 m ahead: states', await ev(() => __game.enemies().slice(0, 3).map((e) => [e.state, e.pos]))); await shot('sa-force-push');
  await restoreHot();
};

S.saberBlaster = async () => {
  await swapIn('saberblaster');
  await ev(() => { __game.moveEnemy(0, 0, -12, 0); __game.setMind(0, 'patrol', 999); __game.advance(0.3); }); await aimAt(0, 1.3, -12);
  await shot('sa-blaster-hold');
  const heat = []; for (let i = 0; i < 9; i++) { await click(); await adv(0.12); const f = await ev(() => __game.forceState()); heat.push([+f.heat.toFixed(2), +f.overheat.toFixed(2)]); }
  note('heat / overheat after each of 9 quick shots', heat); note('soldier', await ev(() => __game.enemies()[0].state));
  await adv(3); await click('right'); await adv(0.2); note('right click swings the saber', await ev(() => __game.atk)); await shot('sa-blaster-swing');
  await restoreHot();
};

S.guns = async () => {
  const out = {};
  for (const [slot, kind] of [[1, 'pistol'], [3, 'ak'], [4, 'shotgun'], [5, 'sniper'], ['ar', 'ar']]) {
    await reset();
    if (slot === 'ar') await swapIn('ar'); else await ev((s) => { __game.selectSlot(s, true); __game.advance(1.5); }, slot);
    const r = { gun: await ev(() => __game.gunKind) };
    // shots to kill at 15 m: torso and head, by real clicks with the crosshair on him
    for (const zone of ['torso', 'head', 'legs']) {
      await ev(() => { __game.fillEnemies(); __game.advance(0.1); __game.moveEnemy(0, 0, -17, 0); __game.setMind(0, 'patrol', 999); __game.faceEnemy(0, 0); __game.advance(0.4); });
      const id = (await living())[0].id; const zy = { torso: 1.25, head: 1.62, legs: 0.6 }[zone];
      await aimAt(0, zy, -17); await adv(0.1);
      let n = 0; for (; n < 40; n++) { await ev(() => __game.holdFire(false)); await click(); await adv(kind === 'sniper' ? 1.4 : kind === 'shotgun' ? 1.0 : 0.25); const e = await ev((id) => __game.enemies().find((x) => x.id === id), id); if (!e || e.state === 'dead') break; await aimAt(0, zy, -17); }
      r['shotsToKill15m_' + zone] = n + 1; r['deathType_' + zone] = (await ev((id) => __game.enemies().find((x) => x.id === id)?.death, id));
      if (zone === 'torso') await shot(`sa-gun-${kind}-kill`);
    }
    // recoil: how far the view climbs over 5 shots
    await ev(() => __game.look(Math.PI, 0.0)); await adv(0.3); const pa = await ev(() => __game.aimProbe());
    for (let i = 0; i < 5; i++) { await click(); await adv(kind === 'sniper' ? 1.3 : kind === 'shotgun' ? 0.9 : 0.12); } const pb = await ev(() => __game.aimProbe());
    r.camPitchAfter5Shots = +(pb.camPitch - pa.camPitch).toFixed(3); r.barrelVsCamDeg = pb.off;
    // reload time and the gun staying in the hands
    await adv(1.5); const m0 = (await ev(() => __game.ammoMags()))[kind]; await key('KeyZ'); let t = 0; await adv(0.05); while (t < 5 && (await ev(() => __game.reload))) { await adv(0.05); t += 0.05; if (Math.abs(t - 0.6) < 0.03) await shot(`sa-gun-${kind}-reload`); }
    r.reloadSeconds = +t.toFixed(2); r.magBefore = m0; r.magAfter = (await ev(() => __game.ammoMags()))[kind]; r.droppedMags = await ev(() => __game.mags);
    await p.mouse.down({ button: 'right' }); await adv(0.6); r.aimFov = await ev(() => __game.fov); await shot(`sa-gun-${kind}-aim`); await p.mouse.up({ button: 'right' });
    out[kind] = r;
  }
  note('by gun', out);
  // attachments: suppressor noise radius and the scope
  await reset(); await ev(() => { __game.setAtt('pistol', 'suppressor', true); __game.selectSlot(1, true); __game.advance(1.2); __game.fillEnemies(); for (let i = 0; i < 4; i++) { __game.moveEnemy(i, 0, -4 - i * 6, 0); __game.setMind(i, 'patrol', 999); __game.faceEnemy(i, 0); } __game.advance(0.3); });
  await ev(() => __game.look(0, 0.1)); await click(); await adv(1); note('suppressed pistol shot fired away from 4 soldiers at 2–20 m behind: minds', await ev(() => __game.minds().filter((m) => m.state !== 'dead').slice(0, 4).map((m) => m.mind)));
  await ev(() => { __game.setAtt('pistol', 'suppressor', false); for (let i = 0; i < 4; i++) __game.setMind(i, 'patrol', 999); }); await click(); await adv(1);
  note('unsuppressed: minds', await ev(() => __game.minds().filter((m) => m.state !== 'dead').slice(0, 4).map((m) => m.mind)));
  await ev(() => __game.setAtt('pistol', 'scope', true)); await p.mouse.down({ button: 'right' }); await adv(0.6); note('pistol scope fov', await ev(() => __game.fov)); await shot('sa-pistol-scope'); await p.mouse.up({ button: 'right' }); await ev(() => __game.setAtt('pistol', 'scope', false));
  // picking a gun up off the ground: kill an AK soldier, walk over it
  await reset(); await ev(() => { __game.setLoadout(0, 'shotgun'); __game.moveEnemy(0, 0, -4, 0); __game.damageEnemy(0, 999, 'torso'); __game.advance(2); });
  const g0 = await ev(() => __game.gunsNear()); await ev(() => { __game.place(0, -4); __game.advance(0.5); }); await key('KeyG'); await adv(3);
  note('dropped guns near, then walk over + G: loot log', { guns: g0, after: await ev(() => __game.gunsNear()), log: await ev(() => __game.lootLog.slice(-4)) });
};

const only = process.argv[2];
for (const [name, f] of Object.entries(S)) {
  if (only && name !== only) continue;
  cur = res[name] = {}; const e0 = log.errors.length, r0 = log.reports.length;
  try { await reset(); await f(); } catch (e) { cur.exception = String(e.stack || e).slice(0, 600); }
  cur.errors = log.errors.slice(e0); cur.reports = log.reports.slice(r0).map((r) => r.slice(0, 260)); cur.alert = await alert();
  console.log(name, JSON.stringify(cur).slice(0, 3000));
}
fs.writeFileSync(new URL(`../../audit/systems-a${only ? '-' + only : ''}.json`, import.meta.url), JSON.stringify(res, null, 1));
await b.close();
