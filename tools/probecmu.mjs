import * as THREE from 'three';
import { loadBVH } from './retarget.mjs';
const D='./assets/locomotion/cmu_bvh/';
for (const f of ['90_14','90_15','90_08','87_03','88_01','127_23']) {
  const r = loadBVH(D+f+'.bvh'); const root = new THREE.Group(); root.add(r.skeleton.bones[0]); root.updateMatrixWorld(true);
  const p = (n) => root.getObjectByName(n).getWorldPosition(new THREE.Vector3());
  if (f==='90_14') console.log('rest Larm', p('LeftHand').sub(p('LeftArm')).normalize().toArray().map(x=>+x.toFixed(2)), 'Ltoe-foot', p('LeftToeBase').sub(p('LeftFoot')).normalize().toArray().map(x=>+x.toFixed(2)), 'hipsY', p('Hips').y.toFixed(1), 'toeY', p('LeftToeBase').y.toFixed(1));
  const m = new THREE.AnimationMixer(root); m.clipAction(r.clip).play();
  const N = Math.floor(r.clip.duration*60); let line=[];
  for (let i=0;i<N;i+=6){ m.setTime(i/60); root.updateMatrixWorld(true); const t=Math.min(p('LeftToeBase').y,p('RightToeBase').y), h=Math.min(p('LeftHand').y,p('RightHand').y); line.push(`${(i/60).toFixed(1)}:${t.toFixed(0)}/${h.toFixed(0)}`); }
  console.log(f, r.clip.duration.toFixed(2)+'s', line.join(' '));
}
