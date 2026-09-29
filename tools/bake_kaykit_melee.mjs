// Bake KayKit 1.1 combat clips (CC0) onto the UE5-mannequin skeleton. Output: build/extra_melee.json
import * as THREE from 'three';
import fs from 'fs';
import { loadGLB, retarget, clipJSON, floorY } from './retarget.mjs';
const G = '/home/user/game/', B = G + 'build/';
const u = await loadGLB(B + 'ual1_anims.glb');
const tgt = { root: u.scene, hips: 'pelvis', floorY: floorY(u.scene, ['ball_l', 'ball_r']) };
const g = await loadGLB(G + 'assets/deaths/kaykit_1.1/Rig_Medium_CombatMelee.glb'); const S = g.scene;
const map = { hips: 'pelvis', spine: 'spine_01', chest: 'spine_03', head: 'Head' };
for (const x of ['l', 'r']) Object.assign(map, { [`upperarm${x}`]: `upperarm_${x}`, [`lowerarm${x}`]: `lowerarm_${x}`, [`wrist${x}`]: `hand_${x}`, [`upperleg${x}`]: `thigh_${x}`, [`lowerleg${x}`]: `calf_${x}`, [`foot${x}`]: `foot_${x}`, [`toes${x}`]: `ball_${x}` });
const tpose = g.animations.find((c) => c.name === 'T-Pose');
const refPose = () => { const m = new THREE.AnimationMixer(S); m.clipAction(tpose).play(); m.setTime(0); S.updateMatrixWorld(true); };
refPose();
const fy = floorY(S, ['toesl', 'toesr']);
const JOBS = [['Melee_Unarmed_Attack_Kick', 'KK_Kick'], ['Melee_Unarmed_Attack_Punch_A', 'KK_Punch'], ['Melee_Dualwield_Attack_Chop', 'KK_Dual_Chop'],
  ['Melee_Dualwield_Attack_Slice', 'KK_Dual_Slice'], ['Melee_Dualwield_Attack_Stab', 'KK_Dual_Stab'], ['Melee_2H_Attack_Spin', 'KK_Spin'],
  ['Melee_1H_Attack_Jump_Chop', 'KK_Jump_Chop'], ['Melee_Block_Hit', 'KK_Block_Hit']];
const out = [];
for (const [name, id] of JOBS) {
  const clip = g.animations.find((c) => c.name === name);
  const c = retarget({ src: { root: S, clip, map, hips: 'hips', floorY: fy, refPose }, tgt, name: id });
  out.push(clipJSON(c)); console.log(id, c.duration.toFixed(2));
}
fs.writeFileSync(B + 'extra_melee.json', JSON.stringify(out));
