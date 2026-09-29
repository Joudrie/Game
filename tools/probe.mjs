import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
const load = (f) => new Promise((res, rej) => { const b = fs.readFileSync(f); new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '', res, rej); });
const B = './build/';
const u = await load(B + 'ual1_anims.glb');
const s = await load(B + 'soldier_notex.glb');
function armDir(root, up, hand, clip, t = 0) {
  if (clip) { const m = new THREE.AnimationMixer(root); m.clipAction(clip).play(); m.setTime(t); }
  root.updateMatrixWorld(true);
  const a = root.getObjectByName(up).getWorldPosition(new THREE.Vector3()), b = root.getObjectByName(hand).getWorldPosition(new THREE.Vector3());
  return b.sub(a).normalize().toArray().map(v => +v.toFixed(2));
}
console.log('UAL rest arm_l', armDir(u.scene, 'upperarm_l', 'hand_l'));
console.log('UAL A_TPose arm_l', armDir(u.scene, 'upperarm_l', 'hand_l', u.animations.find(c => c.name === 'A_TPose'), 0));
const tp = s.animations.find(c => c.name === 'TPose');
console.log('Soldier TPose arm_l', armDir(s.scene, 'mixamorigLeftArm', 'mixamorigLeftHand', tp, 0));
const legs = (root, a, b) => { root.updateMatrixWorld(true); return root.getObjectByName(b).getWorldPosition(new THREE.Vector3()).sub(root.getObjectByName(a).getWorldPosition(new THREE.Vector3())).toArray().map(v=>+v.toFixed(2)); };
console.log('UAL hips->head', legs(u.scene,'pelvis','Head'), 'soldier', legs(s.scene,'mixamorigHips','mixamorigHead'));
