// Mirror Quaternius UAL sword clips (CC0) left↔right so the left hand gets its own strikes (dual sabers).
// Works in world space: each bone's rotation away from the rest pose is reflected across the body's
// side-to-side (X) plane and applied to the opposite bone. Output: build/extra_mirror.json, merged into build/extra.json
import * as THREE from 'three';
import fs from 'fs';
import path from 'path';
import { loadGLB, clipJSON } from './retarget.mjs';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/', B = G + 'build/';
const JOBS = [['ual2', 'Sword_Regular_A'], ['ual2', 'Sword_Regular_A_Rec'], ['ual2', 'Sword_Regular_B'], ['ual2', 'Sword_Regular_B_Rec'],
  ['ual2', 'Sword_Regular_C'], ['ual1', 'Sword_Attack']];
const swap = (n) => n.replace(/_([lr])$/, (_, s) => (s === 'l' ? '_r' : '_l'));
const mirrorQ = (d) => new THREE.Quaternion(d.x, -d.y, -d.z, d.w);
const FPS = 30, out = [];
const src = { ual1: await loadGLB(B + 'ual1_anims.glb'), ual2: await loadGLB(B + 'ual2_anims.glb') };
for (const [lib, name] of JOBS) {
  const g = src[lib], S = g.scene, clip = g.animations.find((c) => c.name === name);
  const bones = []; S.getObjectByName('root').traverse((o) => bones.push(o));
  const byName = new Map(bones.map((b) => [b.name, b]));
  const mixer = new THREE.AnimationMixer(S); mixer.stopAllAction(); mixer.setTime(0);
  for (const b of bones) b.quaternion.copy(b.userData.rest ??= b.quaternion.clone());
  // rest pose (bind), before any clip plays
  S.updateMatrixWorld(true);
  const restW = new Map(bones.map((b) => [b, b.getWorldQuaternion(new THREE.Quaternion())]));
  const pelvis = byName.get('pelvis');
  const act = mixer.clipAction(clip); act.play();
  const n = Math.max(2, Math.round(clip.duration * FPS) + 1), times = [];
  const tracks = new Map(bones.map((b) => [b, []])), hips = [];
  for (let i = 0; i < n; i++) {
    const t = clip.duration * (i / (n - 1)); times.push(t);
    mixer.setTime(t); S.updateMatrixWorld(true);
    const want = new Map();
    for (const b of bones) {
      const s = byName.get(swap(b.name)) || b;
      const d = s.getWorldQuaternion(new THREE.Quaternion()).multiply(restW.get(s).clone().invert());
      want.set(b, mirrorQ(d).multiply(restW.get(b)));
    }
    for (const b of bones) {
      const parentW = b.name === 'root' ? b.parent.getWorldQuaternion(new THREE.Quaternion()) : want.get(b.parent);
      const l = parentW.clone().invert().multiply(want.get(b));
      tracks.get(b).push(l.x, l.y, l.z, l.w);
    }
    // pelvis: reflect its world position across X, then express it in its parent's space
    const w = pelvis.getWorldPosition(new THREE.Vector3()); w.x = -w.x;
    const p = w.applyMatrix4(pelvis.parent.matrixWorld.clone().invert()); hips.push(p.x, p.y, p.z);
  }
  const kt = [...tracks].filter(([b]) => b.name !== 'root').map(([b, v]) => new THREE.QuaternionKeyframeTrack(`${b.name}.quaternion`, times, v));
  kt.push(new THREE.VectorKeyframeTrack('pelvis.position', times, hips));
  const id = 'MR_' + name;
  out.push(clipJSON(new THREE.AnimationClip(id, clip.duration, kt)));
  console.log(id, clip.duration.toFixed(2));
}
fs.writeFileSync(B + 'extra_mirror.json', JSON.stringify(out));
// merge into build/extra.json (replacing earlier bakes of the same clips)
const ex = JSON.parse(fs.readFileSync(B + 'extra.json', 'utf8')), ids = new Set(out.map((c) => c.name));
ex.clips = ex.clips.filter((c) => !ids.has(c.name)).concat(out);
ex.library = ex.library.filter((n) => !ids.has(n)).concat(out.filter((c) => !/_Rec$/.test(c.name)).map((c) => c.name));
fs.writeFileSync(B + 'extra.json', JSON.stringify(ex));
