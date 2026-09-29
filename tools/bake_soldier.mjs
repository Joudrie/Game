import * as THREE from 'three';
import fs from 'fs';
import { loadGLB, retarget, mixamoMap, clipJSON, floorY } from './retarget.mjs';
const B = './build/';
const u = await loadGLB(B + 'ual1_anims.glb');
const s = await loadGLB(B + 'soldier_notex.glb');
const T = u.scene; const S = s.scene; S.rotation.y = Math.PI;
const tpose = s.animations.find((c) => c.name === 'TPose');
const refPose = () => { const m = new THREE.AnimationMixer(S); m.clipAction(tpose).play(); m.setTime(0); S.updateMatrixWorld(true); };
refPose();
const src = { root: S, map: mixamoMap('mixamorig'), hips: 'mixamorigHips', refPose, floorY: floorY(S, ['mixamorigLeftToeBase', 'mixamorigRightToeBase']) };
const tgt = { root: T, hips: 'pelvis', floorY: floorY(T, ['ball_l', 'ball_r']) };
const out = [];
for (const [name, id] of [['Walk', 'MX_Walk'], ['Run', 'MX_Run'], ['Idle', 'MX_Idle']]) {
  src.clip = s.animations.find((c) => c.name === name);
  const c = retarget({ src, tgt, name: id });
  console.log(id, c.duration.toFixed(2), c.tracks.length, 'tracks');
  out.push(clipJSON(c));
}
fs.writeFileSync(B + 'extra_soldier.json', JSON.stringify(out));
console.log((fs.statSync(B + 'extra_soldier.json').size / 1024).toFixed(0), 'KB');
