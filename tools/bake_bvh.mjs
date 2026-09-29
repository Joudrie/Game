import * as THREE from 'three';
import fs from 'fs';
import { loadGLB, loadBVH, retarget, clipJSON, floorY } from './retarget.mjs';
const B = './build/', D = './assets/locomotion/100style_bvh/';
const u = await loadGLB(B + 'ual1_anims.glb');
const T = u.scene;
const tgt = { root: T, hips: 'pelvis', floorY: floorY(T, ['ball_l', 'ball_r']) };
const MAP = { Hips: 'pelvis', Chest: 'spine_01', Chest3: 'spine_02', Chest4: 'spine_03', Neck: 'neck_01', Head: 'Head' };
for (const [S, s] of [['Left', '_l'], ['Right', '_r']]) Object.assign(MAP, { [`${S}Collar`]: `clavicle${s}`, [`${S}Shoulder`]: `upperarm${s}`, [`${S}Elbow`]: `lowerarm${s}`, [`${S}Wrist`]: `hand${s}`, [`${S}Hip`]: `thigh${s}`, [`${S}Knee`]: `calf${s}`, [`${S}Ankle`]: `foot${s}`, [`${S}Toe`]: `ball${s}` });
const cuts = Object.fromEntries(fs.readFileSync(D + 'Frame_Cuts.csv', 'utf8').trim().split('\n').slice(1).map((l) => { const c = l.split(','); return [c[0], c]; }));
const COL = { BR: 1, BW: 3, FR: 5, FW: 7, ID: 9 };
const JOBS = process.argv.slice(2).map((a) => a.split(':')); // file:id
const out = [];
for (const [file, id] of JOBS) {
  const [style, kind] = file.replace('.bvh', '').split('_');
  const r = loadBVH(D + file);
  const root = new THREE.Group(); root.add(r.skeleton.bones[0]);
  const bones = r.skeleton.bones;
  const hipsB = root.getObjectByName('Hips');
  const m = new THREE.AnimationMixer(root); m.clipAction(r.clip).play();
  const c = cuts[style]; const f0 = +c[COL[kind]] + 30, f1 = +c[COL[kind] + 1] - 30;
  // sample
  const P = [], Q = [];
  for (let f = f0; f <= f1; f++) { m.setTime(f / 60); root.updateMatrixWorld(true); P.push(hipsB.getWorldPosition(new THREE.Vector3())); Q.push(bones.map((b) => b.quaternion.clone())); }
  // straightest fast stretch (1.5 s)
  const W = 90; let best = -1, bi = 0;
  const speeds = [];
  for (let i = 0; i + W < P.length; i += 3) {
    let path = 0; for (let k = i; k < i + W; k++) path += Math.hypot(P[k + 1].x - P[k].x, P[k + 1].z - P[k].z);
    const disp = Math.hypot(P[i + W].x - P[i].x, P[i + W].z - P[i].z);
    speeds.push(disp);
    const score = (disp / Math.max(path, 1e-6)) * disp;
    if (kind === 'ID') { const sc = -disp; if (sc > best || best === -1) { best = sc; bi = i; } }
    else if (score > best) { best = score; bi = i; }
  }
  // loop length by pose similarity
  const dist = (a, b) => { let d = 0; for (let j = 1; j < bones.length; j++) d += 1 - Math.abs(Q[a][j].dot(Q[b][j])); return d + Math.abs(P[a].y - P[b].y) * 0.01; };
  let bl = null;
  const [Lmin, Lmax] = kind === 'ID' ? [90, 240] : [27, 90];
  for (let s0 = bi; s0 < bi + 20; s0++) for (let L = Lmin; L <= Lmax && s0 + L < P.length; L++) {
    const d = dist(s0, s0 + L) + L * 0.00002;
    if (!bl || d < bl.d) bl = { d, s0, L };
  }
  const t0 = (f0 + bl.s0) / 60, t1 = (f0 + bl.s0 + bl.L) / 60;
  const a = P[bl.s0], b = P[bl.s0 + bl.L];
  const heading = kind === 'ID' ? 0 : Math.atan2(b.x - a.x, b.z - a.z);
  root.updateMatrixWorld(true);
  const refPose = () => { m.stopAllAction(); for (const bn of bones) bn.quaternion.identity(); hipsB.position.set(0, 0, 0); root.updateMatrixWorld(true); };
  refPose(); const fy = floorY(root, ['LeftToe', 'RightToe']);
  m.clipAction(r.clip).play();
  // capture floor: lowest toe height across the chosen window
  let cf = Infinity; for (let k = bl.s0; k <= bl.s0 + bl.L; k++) { m.setTime((f0 + k) / 60); root.updateMatrixWorld(true); cf = Math.min(cf, root.getObjectByName('LeftToe').getWorldPosition(new THREE.Vector3()).y, root.getObjectByName('RightToe').getWorldPosition(new THREE.Vector3()).y); }
  const src = { root, clip: r.clip, map: MAP, hips: 'Hips', floorY: fy, captureFloorY: cf, refPose: () => { const saved = bones.map((bn) => bn.quaternion.clone()); refPose(); } };
  // refPose must not stop the sampling mixer: rebuild mixer afterwards
  const clip = retarget({ src, tgt, name: id, t0, t1, stripRootXZ: kind === 'ID' ? true : 'trend', heading });
  const spd = Math.hypot(b.x - a.x, b.z - a.z) / (t1 - t0) / 100;
  console.log(id, 'window', (t1 - t0).toFixed(2) + 's', 'loopErr', bl.d.toFixed(3), 'mocap speed', spd.toFixed(2), 'm/s');
  out.push(clipJSON(clip));
}
fs.writeFileSync(B + 'extra_bvh.json', JSON.stringify(out));
console.log((fs.statSync(B + 'extra_bvh.json').size / 1024).toFixed(0), 'KB');
