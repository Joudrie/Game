import * as THREE from 'three';
import fs from 'fs';
import { loadGLB, retarget, clipJSON, floorY } from './retarget.mjs';
const B = './build/';
const u = await loadGLB(B + 'ual1_anims.glb');
const s = await loadGLB(B + 'm2m_notex.glb');
const T = u.scene, S = s.scene;
const tgt = { root: T, hips: 'pelvis', floorY: floorY(T, ['ball_l', 'ball_r']) };
// same UE-style names; only the head differs in case
const map = {};
T.getObjectByName('root').traverse((o) => { const n = o.name === 'Head' ? 'head' : o.name; if (S.getObjectByName(n) && o.name !== 'root') map[n] = o.name; });
const p = (r, n) => r.getObjectByName(n).getWorldPosition(new THREE.Vector3());
S.updateMatrixWorld(true); T.updateMatrixWorld(true);
console.log('mapped', Object.keys(map).length, 'rest arm S', p(S,'hand_l').sub(p(S,'upperarm_l')).normalize().toArray().map(x=>+x.toFixed(2)), 'T', p(T,'hand_l').sub(p(T,'upperarm_l')).normalize().toArray().map(x=>+x.toFixed(2)));
console.log('toe dir S', p(S,'ball_l').sub(p(S,'foot_l')).normalize().toArray().map(x=>+x.toFixed(2)), 'T', p(T,'ball_l').sub(p(T,'foot_l')).normalize().toArray().map(x=>+x.toFixed(2)));
const restQ = new Map(); S.traverse((o) => restQ.set(o, [o.quaternion.clone(), o.position.clone()]));
const refPose = () => { for (const [o, [q, pp]] of restQ) { o.quaternion.copy(q); o.position.copy(pp); } S.updateMatrixWorld(true); };
const src = { root: S, map, hips: 'pelvis', refPose, floorY: floorY(S, ['ball_l', 'ball_r']) };
const JOBS = (process.argv[2] || '').split(',').filter(Boolean);
const out = [];
for (const name of JOBS) {
  const clip = s.animations.find((c) => c.name === name); if (!clip) { console.log('missing', name); continue; }
  src.clip = clip; refPose();
  const loop = /Run|Walk|Strafe|Idle|Levitate Idle|Glide|Flying/.test(name) && !/Run Jump/.test(name);
  const id = 'M2M_' + name.replace(/[^A-Za-z0-9]+/g, '_');
  const c = retarget({ src, tgt, name: id, stripRootXZ: /Backflip|Run Jump|Jump_2/.test(name) ? 'all' : true, fps: 30 });
  out.push(clipJSON(c)); console.log(id, c.duration.toFixed(2));
}
fs.writeFileSync(B + 'extra_m2m.json', JSON.stringify(out));
console.log((fs.statSync(B + 'extra_m2m.json').size / 1024).toFixed(0), 'KB');
