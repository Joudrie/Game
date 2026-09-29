import * as THREE from 'three';
import { loadBVH } from './retarget.mjs';
const r = loadBVH('./assets/locomotion/100style_bvh/HighKnees_FR.bvh');
const root = new THREE.Group(); root.add(r.skeleton.bones[0]); root.updateMatrixWorld(true);
const p = (n) => root.getObjectByName(n).getWorldPosition(new THREE.Vector3());
console.log('rest L arm dir', p('LeftWrist').sub(p('LeftShoulder')).normalize().toArray().map(x=>+x.toFixed(2)));
console.log('rest hips', p('Hips').toArray().map(x=>+x.toFixed(1)), 'head', p('Head').toArray().map(x=>+x.toFixed(1)), 'Ltoe', p('LeftToe').toArray().map(x=>+x.toFixed(1)), 'Lankle', p('LeftAnkle').toArray().map(x=>+x.toFixed(1)));
console.log('clip dur', r.clip.duration, 'tracks', r.clip.tracks.length, r.clip.tracks.slice(0,3).map(t=>t.name));
// hips trajectory within FR range 278..4865 @60fps
const m = new THREE.AnimationMixer(root); m.clipAction(r.clip).play();
for (let f = 300; f < 4865; f += 240) { m.setTime(f/60); root.updateMatrixWorld(true); console.log(f, p('Hips').toArray().map(x=>+x.toFixed(0)).join(',')); }
