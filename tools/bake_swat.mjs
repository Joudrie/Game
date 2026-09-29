import * as THREE from 'three';
import fs from 'fs';
import { loadGLB, retargetDir, clipJSON, floorY } from './retarget.mjs';
const B = './build/';
const u = await loadGLB(B + 'ual1_anims.glb'), s = await loadGLB(B + 'swat_notex.glb');
const T = u.scene, S = s.scene;
const map = { pelvis: 'Hips', spine_01: 'Abdomen', spine_02: 'Torso', spine_03: 'Chest', neck_01: 'Neck', Head: 'Head' };
const aims = { pelvis: ['spine_01', 'Abdomen'], spine_01: ['spine_02', 'Torso'], spine_02: ['spine_03', 'Chest'], spine_03: ['neck_01', 'Neck'], neck_01: ['Head', 'Head'] };
const sides = { pelvis: [['thigh_l', 'thigh_r'], ['UpperLegL', 'UpperLegR']], spine_03: [['clavicle_l', 'clavicle_r'], ['ShoulderL', 'ShoulderR']] };
for (const [x, X] of [['l', 'L'], ['r', 'R']]) {
  Object.assign(map, { [`clavicle_${x}`]: `Shoulder${X}`, [`upperarm_${x}`]: `UpperArm${X}`, [`lowerarm_${x}`]: `LowerArm${X}`, [`hand_${x}`]: `Wrist${X}`, [`thigh_${x}`]: `UpperLeg${X}`, [`calf_${x}`]: `LowerLeg${X}` });
  Object.assign(aims, { [`clavicle_${x}`]: [`upperarm_${x}`, `UpperArm${X}`], [`upperarm_${x}`]: [`lowerarm_${x}`, `LowerArm${X}`], [`lowerarm_${x}`]: [`hand_${x}`, `Wrist${X}`],
    [`hand_${x}`]: [`middle_01_${x}`, `Middle1${X}`], [`thigh_${x}`]: [`calf_${x}`, `LowerLeg${X}`], [`calf_${x}`]: [`foot_${x}`, `Foot${X}`] });
  sides[`hand_${x}`] = [[`pinky_01_${x}`, `index_01_${x}`], [`Pinky1${X}`, `Index1${X}`]];
  for (const f of ['index', 'middle', 'ring', 'pinky', 'thumb']) {
    const F = f[0].toUpperCase() + f.slice(1);
    for (const k of [1, 2]) { map[`${f}_0${k}_${x}`] = `${F}${k}${X}`; aims[`${f}_0${k}_${x}`] = [`${f}_0${k + 1}_${x}`, `${F}${k + 1}${X}`]; }
  }
}
const restQ = new Map(); S.traverse((o) => restQ.set(o, [o.quaternion.clone(), o.position.clone()]));
const refPose = () => { for (const [o, [qq, pp]] of restQ) { o.quaternion.copy(qq); o.position.copy(pp); } S.updateMatrixWorld(true); };
const src = { root: S, hips: 'Hips', refPose, floorY: floorY(S, ['FootL', 'FootR']) };
const tgt = { root: T, hips: 'pelvis', floorY: floorY(T, ['foot_l', 'foot_r']) };
const out = [];
for (const name of (process.argv[2] || '').split(',')) {
  src.clip = s.animations.find((c) => c.name === name); if (!src.clip) { console.log('missing', name); continue; }
  refPose();
  const c = retargetDir({ src, tgt, name: 'SW_' + name, map, aims, sides });
  out.push(clipJSON(c)); console.log('SW_' + name, c.duration.toFixed(2), c.tracks.length);
}
fs.writeFileSync(B + 'extra_swat.json', JSON.stringify(out));
console.log((fs.statSync(B + 'extra_swat.json').size / 1024).toFixed(0), 'KB');
