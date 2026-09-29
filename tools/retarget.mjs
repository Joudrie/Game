// Retarget clips onto the Quaternius UAL (UE mannequin) skeleton by world-space rotation deltas from matching T-poses.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader.js';
import fs from 'fs';
export const loadGLB = (f) => new Promise((res, rej) => { const b = fs.readFileSync(f); new GLTFLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '', res, rej); });
export const loadBVH = (f) => new BVHLoader().parse(fs.readFileSync(f, 'utf8'));

const SIDES = [['Left', '_l'], ['Right', '_r']];
export function mixamoMap(prefix = 'mixamorig') {
  const m = { Hips: 'pelvis', Spine: 'spine_01', Spine1: 'spine_02', Spine2: 'spine_03', Neck: 'neck_01', Head: 'Head' };
  for (const [S, s] of SIDES) {
    Object.assign(m, { [`${S}Shoulder`]: `clavicle${s}`, [`${S}Arm`]: `upperarm${s}`, [`${S}ForeArm`]: `lowerarm${s}`, [`${S}Hand`]: `hand${s}`,
      [`${S}UpLeg`]: `thigh${s}`, [`${S}Leg`]: `calf${s}`, [`${S}Foot`]: `foot${s}`, [`${S}ToeBase`]: `ball${s}` });
    for (const f of ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']) for (const i of [1, 2, 3]) m[`${S}Hand${f}${i}`] = `${f.toLowerCase()}_0${i}${s}`;
  }
  return Object.fromEntries(Object.entries(m).map(([k, v]) => [prefix + k, v]));
}

const q = () => new THREE.Quaternion(), v = () => new THREE.Vector3();
function worldQ(o) { return o.getWorldQuaternion(q()); }

// src: { root, clip, refPose(): applies reference T-pose, map: {srcName: tgtName}, hips: srcHipsName }
// tgt: { root (UAL scene at rest), hips: 'pelvis' }
export function retarget({ src, tgt, name, fps = 30, t0 = 0, t1, stripRootXZ = true, heading = 0 }) {
  const H = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -heading);
  const S = src.root, T = tgt.root;
  const pairs = Object.entries(src.map).map(([s, t]) => [S.getObjectByName(s), T.getObjectByName(t)]).filter(([a, b]) => a && b);
  const tgtByName = new Map(pairs.map(([a, b]) => [b.name, a]));
  // reference poses
  T.updateMatrixWorld(true);
  const tBones = []; T.getObjectByName('root').traverse((o) => tBones.push(o));
  const tRestLocal = new Map(tBones.map((b) => [b, b.quaternion.clone()]));
  const tRefW = new Map(tBones.map((b) => [b, worldQ(b)]));
  const tHips = T.getObjectByName(tgt.hips), tHipsRefW = tHips.getWorldPosition(v());
  const tHipsRestLocal = tHips.position.clone();
  const tHipsParentInv = tHips.parent.matrixWorld.clone().invert();
  src.refPose(); S.updateMatrixWorld(true);
  const sRefW = new Map(pairs.map(([a]) => [a, worldQ(a)]));
  const sHips = S.getObjectByName(src.hips), sHipsRef = sHips.getWorldPosition(v());
  const ratio = (tHipsRefW.y - tgt.floorY) / (sHipsRef.y - src.floorY);
  // sample
  const mixer = new THREE.AnimationMixer(S); const a = mixer.clipAction(src.clip); a.play();
  const end = t1 ?? src.clip.duration, n = Math.max(2, Math.round((end - t0) * fps) + 1);
  const times = [], tracks = new Map(tBones.map((b) => [b, []])), hipsPos = [];
  let hips0 = null, trend = null;
  if (stripRootXZ === 'trend') { mixer.setTime(t0); S.updateMatrixWorld(true); const pa = sHips.getWorldPosition(v()); mixer.setTime(end); S.updateMatrixWorld(true); const pb = sHips.getWorldPosition(v()); trend = pb.sub(pa).divideScalar(end - t0); trend.y = 0; }
  for (let i = 0; i < n; i++) {
    const t = t0 + (end - t0) * (i / (n - 1));
    mixer.setTime(t); S.updateMatrixWorld(true);
    times.push(t - t0);
    const desiredW = new Map();
    for (const b of tBones) {
      const s = tgtByName.get(b.name);
      const parentW = b === T.getObjectByName('root') ? worldQ(b.parent) : desiredW.get(b.parent);
      let w;
      if (s) { const d = H.clone().multiply(worldQ(s)).multiply(sRefW.get(s).clone().invert()); w = d.multiply(tRefW.get(b)); }
      else w = parentW.clone().multiply(tRestLocal.get(b));
      desiredW.set(b, w);
      const local = parentW.clone().invert().multiply(w);
      tracks.get(b).push(local.x, local.y, local.z, local.w);
    }
    const hp = sHips.getWorldPosition(v());
    if (!hips0) hips0 = hp.clone();
    let dlt = hp.clone().sub(sHipsRef);
    if (src.captureFloorY !== undefined) dlt.y += src.floorY - src.captureFloorY;
    if (trend) { dlt.sub(trend.clone().multiplyScalar(t - t0)).sub(hips0.clone().setY(0)).add(sHipsRef.clone().setY(0)); }
    dlt.applyQuaternion(H).multiplyScalar(ratio);
    if (stripRootXZ === true) { dlt.x = 0; dlt.z = 0; }
    if (stripRootXZ === 'all') dlt.set(0, 0, 0);
    const wpos = tHipsRefW.clone().add(dlt).applyMatrix4(tHipsParentInv);
    hipsPos.push(wpos.x, wpos.y, wpos.z);
  }
  const out = [];
  for (const [b, vals] of tracks) if (tgtByName.has(b.name)) out.push(new THREE.QuaternionKeyframeTrack(`${b.name}.quaternion`, times, vals));
  out.push(new THREE.VectorKeyframeTrack(`${tgt.hips}.position`, times, hipsPos));
  return new THREE.AnimationClip(name, times[times.length - 1], out);
}

export function clipJSON(clip) {
  clip.tracks = clip.tracks.filter((t) => !/(thumb|index|middle|ring|pinky)_0[23]_/.test(t.name));
  clip.optimize();
  const j = THREE.AnimationClip.toJSON(clip);
  for (const t of j.tracks) { t.times = t.times.map((x) => +x.toFixed(3)); t.values = t.values.map((x) => +x.toFixed(3)); }
  return j;
}
export function floorY(root, names) { root.updateMatrixWorld(true); return Math.min(...names.map((n) => root.getObjectByName(n).getWorldPosition(v()).y)); }
