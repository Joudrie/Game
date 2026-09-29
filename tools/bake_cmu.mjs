import * as THREE from 'three';
import fs from 'fs';
import { loadGLB, loadBVH, retarget, clipJSON, floorY } from './retarget.mjs';
const B = './build/', D = './assets/locomotion/cmu_bvh/';
const u = await loadGLB(B + 'ual1_anims.glb');
const tgt = { root: u.scene, hips: 'pelvis', floorY: floorY(u.scene, ['ball_l', 'ball_r']) };
const MAP = { Hips: 'pelvis', LowerBack: 'spine_01', Spine: 'spine_02', Spine1: 'spine_03', Neck: 'neck_01', Head: 'Head' };
for (const [S, s] of [['Left', '_l'], ['Right', '_r']]) Object.assign(MAP, { [`${S}Shoulder`]: `clavicle${s}`, [`${S}Arm`]: `upperarm${s}`, [`${S}ForeArm`]: `lowerarm${s}`, [`${S}Hand`]: `hand${s}`, [`${S}UpLeg`]: `thigh${s}`, [`${S}Leg`]: `calf${s}`, [`${S}Foot`]: `foot${s}`, [`${S}ToeBase`]: `ball${s}` });
const JOBS = [['87_03', 'CMU_Backflip_A', 1.05, 1.62], ['88_01', 'CMU_Backflip_B', 0.28, 0.82], ['90_08', 'CMU_SideFlip', 1.55, 2.08]];
const out = [];
for (const [f, id, t0, t1] of JOBS) {
  const r = loadBVH(D + f + '.bvh'); const root = new THREE.Group(); root.add(r.skeleton.bones[0]);
  const bones = r.skeleton.bones, hips = root.getObjectByName('Hips');
  // facing at takeoff = average toe direction
  const m = new THREE.AnimationMixer(root); m.clipAction(r.clip).play(); m.setTime(t0); root.updateMatrixWorld(true);
  const p = (n) => root.getObjectByName(n).getWorldPosition(new THREE.Vector3());
  const dir = p('LeftToeBase').sub(p('LeftFoot')).add(p('RightToeBase').sub(p('RightFoot')));
  const heading = Math.atan2(dir.x, dir.z);
  m.stopAllAction();
  const refPose = () => { for (const b of bones) b.quaternion.identity(); hips.position.set(0, 0, 0); root.updateMatrixWorld(true); };
  refPose();
  const src = { root, clip: r.clip, map: MAP, hips: 'Hips', floorY: floorY(root, ['LeftToeBase', 'RightToeBase']), refPose };
  const clip = retarget({ src, tgt, name: id, t0, t1, stripRootXZ: 'all', heading, fps: 60 });
  console.log(id, clip.duration.toFixed(2), 'heading', (heading * 57.3).toFixed(0));
  out.push(clipJSON(clip));
}
fs.writeFileSync(B + 'extra_cmu.json', JSON.stringify(out));
console.log((fs.statSync(B + 'extra_cmu.json').size / 1024).toFixed(0), 'KB');
