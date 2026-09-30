// Rig The Second: skin build/the_second.glb (static, A-pose, from tools/bake_the_second.py) to the hero skeleton
// (Quaternius Superhero, UE5 mannequin names) so every animation in the game drives it.
//  1. scale the mesh to the hero's height, bend the skeleton's arms down to the mesh's A-pose
//  2. weight each vertex to its nearest bone segments, smooth the weights over the mesh
//  3. pose the skeleton back to its rest T-pose and bake the skinned vertices, so the final bind pose is the
//     same T-pose as the old hero (grips, holsters and IK in the game are measured from it)
// Runs in headless Chromium (GLTFExporter needs a canvas). Needs the dist server on :8766 (see CLAUDE.md).
// Output: build/the_second_rigged.glb
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const b64 = (f) => fs.readFileSync(G + f).toString('base64');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage();
p.on('console', (m) => console.log('page:', m.text()));
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.goto('http://127.0.0.1:8766/three/build/three.module.js'); // same origin as the modules
await p.setContent(`<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>`);
const out = await p.evaluate(async ([heroB64, meshB64]) => {
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
  const buf = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
  const load = (s) => new Promise((res, rej) => new GLTFLoader().parse(buf(s), '', res, rej));
  const V = () => new THREE.Vector3();
  const [hg, mg] = await Promise.all([load(heroB64), load(meshB64)]);
  const H = hg.scene; let oldSk = null; H.traverse((o) => { if (o.isSkinnedMesh && (!oldSk || o.geometry.attributes.position.count > oldSk.geometry.attributes.position.count)) oldSk = o; }); // the body, not the eyebrows
  oldSk.skeleton.pose(); H.updateMatrixWorld(true);
  // bounding box of the hero as it actually renders (skinned vertices in world space)
  const heroBox = new THREE.Box3(), hv = new THREE.Vector3(), hp = oldSk.geometry.attributes.position;
  for (let i = 0; i < hp.count; i++) { hv.fromBufferAttribute(hp, i); oldSk.applyBoneTransform(i, hv); heroBox.expandByPoint(hv.applyMatrix4(oldSk.matrixWorld)); }
  const bones = oldSk.skeleton.bones, byName = new Map(bones.map((b) => [b.name, b]));
  const rest = new Map(bones.map((b) => [b, b.quaternion.clone()]));
  const P = (n) => byName.get(n).getWorldPosition(V());
  // facing: toes in front of the ankle
  const fwdZ = Math.sign(P('ball_l').z - P('foot_l').z);
  // the static mesh, scaled to the hero's height, centred under the pelvis, facing the same way
  let src = null; mg.scene.traverse((o) => { if (!src && o.isMesh) src = o; });
  const geo = src.geometry.clone(); geo.computeBoundingBox();
  const mh = geo.boundingBox.max.y - geo.boundingBox.min.y, hh = heroBox.max.y - heroBox.min.y;
  const s = hh / mh; geo.scale(s, s, s); if (fwdZ < 0) geo.rotateY(Math.PI);
  geo.computeBoundingBox(); const bb = geo.boundingBox, pel = P('pelvis');
  geo.translate(pel.x - (bb.min.x + bb.max.x) / 2, heroBox.min.y - bb.min.y, pel.z - (bb.min.z + bb.max.z) / 2);
  geo.computeBoundingBox();
  const pos = geo.attributes.position, n = pos.count, hgt = geo.boundingBox.max.y - geo.boundingBox.min.y, y0 = geo.boundingBox.min.y;
  // 1. arms down to the mesh's A-pose: find each hand (the part of the mesh hanging outside the legs at hand height)
  const log = {};
  for (const side of ['l', 'r']) {
    const sx = Math.sign(P('hand_' + side).x - pel.x), c = V(); let k = 0;
    for (let i = 0; i < n; i++) {
      const x = pos.getX(i) - pel.x, y = (pos.getY(i) - y0) / hgt;
      if (x * sx > 0.15 * hgt / 1.8 && y > 0.40 && y < 0.52) { c.x += pos.getX(i); c.y += pos.getY(i); c.z += pos.getZ(i); k++; }
    }
    c.divideScalar(Math.max(k, 1));
    const up = byName.get('upperarm_' + side), sh = up.getWorldPosition(V());
    const palm = P('hand_' + side).lerp(P('middle_01_' + side), 0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(palm.sub(sh).normalize(), c.clone().sub(sh).normalize());
    const pw = up.parent.getWorldQuaternion(new THREE.Quaternion());
    const w = q.multiply(up.getWorldQuaternion(new THREE.Quaternion()));
    up.quaternion.copy(pw.invert().multiply(w)); H.updateMatrixWorld(true);
    log['hand_' + side] = { verts: k, at: c.toArray().map((v) => +v.toFixed(3)), palmNow: P('hand_' + side).lerp(P('middle_01_' + side), 0.5).toArray().map((v) => +v.toFixed(3)) };
  }
  // 2. weights: distance to bone segments
  const SEG = [['pelvis', 'spine_01'], ['spine_01', 'spine_02'], ['spine_02', 'spine_03'], ['spine_03', 'neck_01'], ['neck_01', 'Head'], ['Head', null, 0.28]];
  for (const x of ['l', 'r']) SEG.push([`clavicle_${x}`, `upperarm_${x}`], [`upperarm_${x}`, `lowerarm_${x}`], [`lowerarm_${x}`, `hand_${x}`],
    [`hand_${x}`, `middle_02_${x}`], [`thigh_${x}`, `calf_${x}`], [`calf_${x}`, `foot_${x}`], [`foot_${x}`, `ball_${x}`], [`ball_${x}`, `ball_leaf_${x}`]);
  const segs = SEG.map(([a, bn, len]) => { const A = P(a), B = bn ? P(bn) : A.clone().add(new THREE.Vector3(0, len * hgt / 1.8, 0)); return { bone: bones.indexOf(byName.get(a)), name: a, A, B }; });
  const side = (name) => (/_l$/.test(name) ? Math.sign(P('hand_l').x - pel.x) : /_r$/.test(name) ? -Math.sign(P('hand_l').x - pel.x) : 0);
  const NB = segs.length, W = new Float32Array(n * NB), v = V(), ab = V(), av = V();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i);
    const d = segs.map((sg) => {
      ab.subVectors(sg.B, sg.A); av.subVectors(v, sg.A);
      const t = Math.min(1, Math.max(0, av.dot(ab) / ab.lengthSq()));
      let dist = av.sub(ab.multiplyScalar(t)).length();
      const sd = side(sg.name); if (sd && (v.x - pel.x) * sd < -0.04) dist += 1; // never across the body
      return dist;
    });
    const order = d.map((x, j) => j).sort((a, b) => d[a] - d[b]);
    const [a, b] = order;
    if (d[b] < d[a] * 1.35) { const wa = 1 / d[a] ** 4, wb = 1 / d[b] ** 4; W[i * NB + a] = wa / (wa + wb); W[i * NB + b] = wb / (wa + wb); }
    else W[i * NB + a] = 1;
  }
  // UV seams split vertices; copies at the same spot must end with the same weights, or the mesh cracks when it bends
  const canon = new Int32Array(n), seen = new Map();
  for (let i = 0; i < n; i++) { const key = [pos.getX(i), pos.getY(i), pos.getZ(i)].map((x) => Math.round(x * 1e5)).join(','); if (!seen.has(key)) seen.set(key, i); canon[i] = seen.get(key); }
  // smooth the weights along mesh edges (softer joints), over the welded mesh
  const idx = geo.index.array, nbr = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < idx.length; t += 3) for (const [a, b] of [[idx[t], idx[t + 1]], [idx[t + 1], idx[t + 2]], [idx[t + 2], idx[t]]]) { const ca = canon[a], cb = canon[b]; if (ca !== cb) { nbr[ca].add(cb); nbr[cb].add(ca); } }
  for (let it = 0; it < 3; it++) {
    const W2 = new Float32Array(W.length);
    for (let i = 0; i < n; i++) {
      if (canon[i] !== i) continue;
      const ns = [...nbr[i]]; const k = 1 / (ns.length + 1);
      for (let j = 0; j < NB; j++) { let sum = W[i * NB + j]; for (const m of ns) sum += W[m * NB + j]; W2[i * NB + j] = sum * k; }
    }
    W.set(W2);
  }
  for (let i = 0; i < n; i++) if (canon[i] !== i) for (let j = 0; j < NB; j++) W[i * NB + j] = W[canon[i] * NB + j];
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), usage = {};
  for (let i = 0; i < n; i++) {
    const order = [...Array(NB).keys()].sort((a, b) => W[i * NB + b] - W[i * NB + a]).slice(0, 4);
    let tot = 0; for (const j of order) tot += W[i * NB + j];
    order.forEach((j, k) => { si[i * 4 + k] = segs[j].bone; sw[i * 4 + k] = W[i * NB + j] / tot; });
    usage[segs[order[0]].name] = (usage[segs[order[0]].name] || 0) + 1;
  }
  log.usage = usage;
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  // 3. bind in the A-pose, bake into the rest T-pose, bind again there
  const mat = src.material;
  const tmp = new THREE.SkinnedMesh(geo, mat); oldSk.parent.add(tmp); H.updateMatrixWorld(true);
  tmp.bind(new THREE.Skeleton(bones), tmp.matrixWorld);
  for (const b of bones) b.quaternion.copy(rest.get(b)); H.updateMatrixWorld(true); tmp.skeleton.update();
  const baked = geo.clone(), bp = baked.attributes.position, tv = V();
  for (let i = 0; i < n; i++) { tv.fromBufferAttribute(pos, i); tmp.applyBoneTransform(i, tv); bp.setXYZ(i, tv.x, tv.y, tv.z); }
  baked.computeVertexNormals(); tmp.removeFromParent();
  // the old hero meshes go; the new one takes their place on the same armature
  const arm = oldSk.parent; const olds = []; H.traverse((o) => { if (o.isMesh) olds.push(o); }); olds.forEach((o) => o.removeFromParent());
  // smaller file: 16-bit indices, normals recomputed by the game on load
  baked.setIndex(new THREE.Uint16BufferAttribute(Uint16Array.from(baked.index.array), 1)); baked.deleteAttribute('normal');
  const final = new THREE.SkinnedMesh(baked, mat); final.name = 'TheSecond'; arm.add(final); H.updateMatrixWorld(true);
  final.bind(new THREE.Skeleton(bones), final.matrixWorld);
  if (mat.map) mat.map.userData.mimeType = 'image/jpeg'; // a fraction of the PNG size; the play link has a 16 MB cap
  const glb = await new GLTFExporter().parseAsync(H, { binary: true, animations: [] });
  let s2 = ''; const u8 = new Uint8Array(glb); for (let i = 0; i < u8.length; i += 0x8000) s2 += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return { glb: btoa(s2), log: { ...log, scale: s, heroHeight: hh, fwdZ, verts: n } };
}, [b64('build/hero.glb'), b64('build/the_second.glb')]);
fs.writeFileSync(G + 'build/the_second_rigged.glb', Buffer.from(out.glb, 'base64'));
console.log(JSON.stringify(out.log, null, 1));
await b.close();
