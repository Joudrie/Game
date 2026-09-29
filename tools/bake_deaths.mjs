// Bake free death clips onto the UE5-mannequin skeleton: CMU falls (BVH) and the
// KayKit Adventurers 1.1 rig (own names, has a T-Pose clip). Output: build/extra_deaths2.json
import * as THREE from 'three';
import fs from 'fs';
import { loadGLB, loadBVH, retarget, mixamoMap, clipJSON, floorY } from './retarget.mjs';
const G = '/home/user/game/', B = G + 'build/', D = G + 'assets/deaths/';
const u = await loadGLB(B + 'ual1_anims.glb');
const tgt = { root: u.scene, hips: 'pelvis', floorY: floorY(u.scene, ['ball_l', 'ball_r']) };
const out = [];
const keep = (c) => { out.push(clipJSON(c)); console.log(c.name, c.duration.toFixed(2)); };

// CMU falls (frame 0 of each file is a T-pose; windows picked from the fall analysis in assets/deaths/_tools)
const CMU = { Hips: 'pelvis', LowerBack: 'spine_01', Spine: 'spine_02', Spine1: 'spine_03', Neck: 'neck_01', Head: 'Head' };
for (const [S, s] of [['Left', '_l'], ['Right', '_r']]) Object.assign(CMU, { [`${S}Shoulder`]: `clavicle${s}`, [`${S}Arm`]: `upperarm${s}`, [`${S}ForeArm`]: `lowerarm${s}`, [`${S}Hand`]: `hand${s}`, [`${S}UpLeg`]: `thigh${s}`, [`${S}Leg`]: `calf${s}`, [`${S}Foot`]: `foot${s}`, [`${S}ToeBase`]: `ball${s}` });
const JOBS = [['90_18', 'CMU_Fall_Back', 0.6, 2.0], ['90_16', 'CMU_Fall_Forward', 2.95, 4.4],
  ['90_12', 'CMU_Crash_A', 3.35, 5.0], ['90_13', 'CMU_Crash_B', 3.7, 5.4]];
for (const [f, id, t0, t1] of JOBS) {
  const r = loadBVH(D + 'cmu_bvh/' + f + '.bvh'); const root = new THREE.Group(); root.add(r.skeleton.bones[0]);
  const bones = r.skeleton.bones, hips = root.getObjectByName('Hips');
  const m = new THREE.AnimationMixer(root); m.clipAction(r.clip).play(); m.setTime(t0); root.updateMatrixWorld(true);
  const p = (n) => root.getObjectByName(n).getWorldPosition(new THREE.Vector3());
  const dir = p('LeftToeBase').sub(p('LeftFoot')).add(p('RightToeBase').sub(p('RightFoot')));
  const heading = Math.atan2(dir.x, dir.z);
  const cf = Math.min(p('LeftToeBase').y, p('RightToeBase').y); // floor under the standing start frame
  m.stopAllAction();
  const refPose = () => { for (const b of bones) b.quaternion.identity(); hips.position.set(0, 0, 0); root.updateMatrixWorld(true); };
  refPose();
  keep(retarget({ src: { root, clip: r.clip, map: CMU, hips: 'Hips', floorY: floorY(root, ['LeftToeBase', 'RightToeBase']), captureFloorY: cf, refPose }, tgt, name: id, t0, t1, stripRootXZ: true, heading, fps: 30 }));
}

// KayKit 1.1 medium rig (CC0): its own bone names and a T-Pose clip for the reference pose
{
  const g = await loadGLB(D + 'kaykit_1.1/Rig_Medium_General.glb'); const S = g.scene;
  const map = { hips: 'pelvis', spine: 'spine_01', chest: 'spine_03', head: 'Head' };
  for (const x of ['l', 'r']) Object.assign(map, { [`upperarm${x}`]: `upperarm_${x}`, [`lowerarm${x}`]: `lowerarm_${x}`, [`wrist${x}`]: `hand_${x}`, [`upperleg${x}`]: `thigh_${x}`, [`lowerleg${x}`]: `calf_${x}`, [`foot${x}`]: `foot_${x}`, [`toes${x}`]: `ball_${x}` });
  const tpose = g.animations.find((c) => c.name === 'T-Pose');
  const refPose = () => { const m = new THREE.AnimationMixer(S); m.clipAction(tpose).play(); m.setTime(0); S.updateMatrixWorld(true); };
  refPose();
  const fy = floorY(S, ['toesl', 'toesr']);
  for (const [name, id] of [['Death_B', 'KK_Death_B'], ['Hit_A', 'KK_Hit_A'], ['Hit_B', 'KK_Hit_B']]) {
    const clip = g.animations.find((c) => c.name === name);
    keep(retarget({ src: { root: S, clip, map, hips: 'hips', floorY: fy, refPose }, tgt, name: id }));
  }
}
fs.writeFileSync(B + 'extra_deaths2.json', JSON.stringify(out));
console.log((fs.statSync(B + 'extra_deaths2.json').size / 1024).toFixed(0), 'KB');
