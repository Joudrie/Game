// Put bumstrum's "terrorist" (Sketchfab, CC-BY) on the game's skeleton, for the enemy soldiers (v48).
// Same idea as tools/reskin_swat.mjs, for a textured model with its own bone names:
//  - his bones map to the UE-mannequin bones by name (hip→pelvis, L_arm→upperarm_l, L_point1→index_01_l …); the
//    artist's skin weights are kept, only the bone indices change
//  - he's scaled so his hip height equals the hero's, turned to face the hero's way, and his limbs are first bent into
//    the hero's rest pose (he's modelled in a T-pose), so animations made for the hero fit him
//  - the hero skeleton's joints then move to his joints (clips only rotate bones)
//  - his body meshes merge into one textured mesh (his own pistol is left out: the game gives soldiers their guns);
//    textures go out as JPEG at 1024 px at most
// Runs in headless Chromium (GLTFExporter). Needs the dist server on :8766. Output: build/enemy.glb
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const b64 = (f) => fs.readFileSync(G + f).toString('base64');
const SRC = process.argv[2] || 'assets/characters/enemies/terrorist/terrorist.glb';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage();
p.on('console', (m) => { if (!/404/.test(m.text())) console.log('page:', m.text()); });
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.goto('http://127.0.0.1:8766/three/build/three.module.js');
await p.setContent(`<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>`);
const out = await p.evaluate(async ([heroB64, srcB64]) => {
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
  const buf = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
  const load = (s) => new Promise((res, rej) => new GLTFLoader().parse(buf(s), '', res, rej));
  const V = () => new THREE.Vector3();
  const [hg, sg] = await Promise.all([load(heroB64), load(srcB64)]);
  const log = {};
  const H = hg.scene; let body = null; H.traverse((o) => { if (o.isSkinnedMesh && (!body || o.geometry.attributes.position.count > body.geometry.attributes.position.count)) body = o; });
  body.skeleton.pose(); H.updateMatrixWorld(true);
  const hb = body.skeleton.bones, hByName = new Map(hb.map((x) => [x.name, x]));
  const W = (o) => o.getWorldPosition(V());
  // his meshes (not the pistol) at bind pose
  const S = sg.scene, sMeshes = []; S.traverse((o) => { if (o.isSkinnedMesh && !/pistol/i.test(o.material.name)) sMeshes.push(o); });
  S.updateMatrixWorld(true); // already in his bind pose as loaded (skeleton.pose() would apply the Sketchfab root rotation twice)
  // his bone names: L_arm_015 → "L_arm"; map to the hero's
  const BASE = { hip: 'pelvis', spine: 'spine_01', chest: 'spine_03', neck: 'neck_01', head: 'Head', eye: 'Head', top: 'Head', _rootJoint: 'pelvis' };
  const SIDE = { shoulder: 'clavicle', arm: 'upperarm', elbow: 'lowerarm', wrist: 'hand', leg: 'thigh', knee: 'calf', ankle: 'foot', foot: 'ball', toes: 'ball' };
  const FING = { thumb: 'thumb', point: 'index', middle: 'middle', ring: 'ring', pink: 'pinky' };
  const heroOf = (name) => {
    const n = name.replace(/_\d+$/, '');
    let m = n.match(/^([LR])_([a-z]+?)(\d?)$/);
    if (m) {
      const s = m[1] === 'L' ? 'l' : 'r', part = m[2], k = m[3];
      if (SIDE[part]) return `${SIDE[part]}_${s}`;
      if (part === 'eye') return 'Head';
      if (FING[part]) return k ? `${FING[part]}_0${k}_${s}` : `${FING[part]}_03_${s}`;
    }
    return BASE[n] || null;
  };
  const sBones = sMeshes[0].skeleton.bones;
  const sByHero = new Map(); // hero bone name → his bone (the first one that maps there)
  for (const sb of sBones) { const h = heroOf(sb.name); if (h && hByName.has(h) && !sByHero.has(h) && !sb.name.startsWith('_')) sByHero.set(h, sb); } // his root joint sits on the floor: the hip is the pelvis
  log.mapped = sByHero.size; log.unmapped = sBones.filter((x) => !heroOf(x.name)).map((x) => x.name);
  // orientation, scale, position: put him into the hero's world (a transform on his scene root)
  const heroFwd = Math.sign(W(hByName.get('ball_l')).z - W(hByName.get('foot_l')).z);
  const sFwd = Math.sign(W(sByHero.get('ball_l')).z - W(sByHero.get('foot_l')).z);
  if (sFwd !== heroFwd) S.rotateY(Math.PI);
  S.updateMatrixWorld(true);
  const hHip = W(hByName.get('pelvis')), floorH = Math.min(W(hByName.get('foot_l')).y, W(hByName.get('foot_r')).y);
  const sHip0 = W(sByHero.get('pelvis')), floorS0 = Math.min(W(sByHero.get('foot_l')).y, W(sByHero.get('foot_r')).y);
  const k = (hHip.y - floorH) / (sHip0.y - floorS0);
  S.scale.multiplyScalar(k); S.updateMatrixWorld(true);
  const sHip = W(sByHero.get('pelvis')), floorS = Math.min(W(sByHero.get('foot_l')).y, W(sByHero.get('foot_r')).y);
  S.position.add(new THREE.Vector3(hHip.x - sHip.x, floorH - floorS, hHip.z - sHip.z)); S.updateMatrixWorld(true);
  log.scale = +k.toFixed(4); log.turned = sFwd !== heroFwd;
  log.leftMatches = Math.sign(W(sByHero.get('upperarm_l')).x - hHip.x) === Math.sign(W(hByName.get('upperarm_l')).x - hHip.x);
  // bend his limbs into the hero's rest pose: each bone turns so it points where the hero's does
  const CHAINS = [];
  for (const s of ['l', 'r']) CHAINS.push([`clavicle_${s}`, `upperarm_${s}`], [`upperarm_${s}`, `lowerarm_${s}`], [`lowerarm_${s}`, `hand_${s}`], [`hand_${s}`, `middle_01_${s}`],
    [`thigh_${s}`, `calf_${s}`], [`calf_${s}`, `foot_${s}`], [`foot_${s}`, `ball_${s}`]);
  const q = new THREE.Quaternion(), pq = new THREE.Quaternion(), wq = new THREE.Quaternion();
  let bent = 0;
  for (const [a, c] of CHAINS) {
    const sa = sByHero.get(a), sc = sByHero.get(c); if (!sa || !sc) continue;
    S.updateMatrixWorld(true);
    const dS = W(sc).sub(W(sa)).normalize(), dH = W(hByName.get(c)).sub(W(hByName.get(a))).normalize();
    q.setFromUnitVectors(dS, dH);
    sa.getWorldQuaternion(wq); sa.parent.getWorldQuaternion(pq);
    sa.quaternion.copy(pq.clone().invert().multiply(q).multiply(wq)); bent++;
  }
  S.updateMatrixWorld(true); log.bent = bent;
  // move the hero joints onto his (now bent) joints, top-down
  const order = []; hByName.get('root').traverse((o) => { if (o.isBone) order.push(o); });
  let moved = 0;
  for (const bone of order) {
    const sb = sByHero.get(bone.name);
    if (sb && !/^(ball|index|middle|ring|pinky|thumb)/.test(bone.name) || (sb && /^(index|middle|ring|pinky|thumb)_01/.test(bone.name))) { bone.parent.updateMatrixWorld(true); bone.position.copy(W(sb).applyMatrix4(bone.parent.matrixWorld.clone().invert())); moved++; }
    bone.updateMatrixWorld(true);
  }
  log.moved = moved;
  // merge his meshes, posed as above, into one geometry (uv kept for the texture)
  const P = [], N = [], UV = [], SI = [], SWt = [], I = []; let base = 0; const nm = new THREE.Matrix3();
  const hIndex = new Map(hb.map((x, i) => [x.name, i]));
  let mat = null;
  for (const m of sMeshes) {
    const g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, si = g.attributes.skinIndex, swt = g.attributes.skinWeight;
    if (!mat && m.material.map) mat = m.material;
    const v = V(), bm = new THREE.Matrix4();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i); m.applyBoneTransform(i, v); v.applyMatrix4(m.matrixWorld); P.push(v.x, v.y, v.z); // applyBoneTransform gives the mesh's local space
      // normals: the blended bone matrix of this vertex
      bm.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      for (let c = 0; c < 4; c++) { const w = swt.getComponent(i, c); if (!w) continue; const j = si.getComponent(i, c); const mm = new THREE.Matrix4().multiplyMatrices(m.skeleton.bones[j].matrixWorld, m.skeleton.boneInverses[j]).multiply(m.bindMatrix); for (let e = 0; e < 16; e++) bm.elements[e] += mm.elements[e] * w; }
      nm.getNormalMatrix(bm); v.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z);
      UV.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
      for (let c = 0; c < 4; c++) { const sb = m.skeleton.bones[si.getComponent(i, c)]; const h = (sb && heroOf(sb.name)) || 'pelvis'; SI.push(hIndex.get(h) ?? hIndex.get('pelvis')); SWt.push(swt.getComponent(i, c)); }
    }
    const idx = g.index ? g.index.array : [...Array(pos.count).keys()];
    for (const x of idx) I.push(x + base); base += pos.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
  const q8 = (a) => Uint8Array.from(a, (x) => Math.round(Math.min(1, Math.max(0, x)) * 255));
  const W8 = q8(SWt); for (let i = 0; i < W8.length; i += 4) { const d = 255 - (W8[i] + W8[i + 1] + W8[i + 2] + W8[i + 3]); W8[i] += d; }
  geo.setAttribute('skinIndex', new THREE.Uint8BufferAttribute(SI, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(W8, 4, true));
  geo.setIndex(base > 65535 ? I : new THREE.Uint16BufferAttribute(I, 1));
  // one textured material: base colour, normals and roughness/metalness as JPEG
  const out = new THREE.MeshStandardMaterial({ name: 'Enemy', map: mat.map, normalMap: mat.normalMap || null, roughnessMap: mat.roughnessMap || null, metalnessMap: mat.metalnessMap || null,
    roughness: mat.roughnessMap ? 1 : 0.8, metalness: mat.metalnessMap ? 1 : 0.05 });
  for (const t of [out.map, out.normalMap, out.roughnessMap, out.metalnessMap]) if (t) t.userData.mimeType = 'image/jpeg';
  log.maps = { map: !!out.map, normal: !!out.normalMap, rough: !!out.roughnessMap, metal: !!out.metalnessMap, size: out.map?.image?.width };
  const arm = body.parent; const olds = []; H.traverse((o) => { if (o.isMesh) olds.push(o); }); olds.forEach((o) => o.removeFromParent());
  const mesh = new THREE.SkinnedMesh(geo, out); mesh.name = 'Enemy'; arm.add(mesh); H.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(hb), mesh.matrixWorld);
  log.verts = base; log.tris = I.length / 3;
  const box = new THREE.Box3().setFromBufferAttribute(geo.attributes.position); log.height = +(box.max.y - box.min.y).toFixed(3);
  const glb = await new GLTFExporter().parseAsync(H, { binary: true, animations: [], maxTextureSize: 1024 });
  let s2 = ''; const u8 = new Uint8Array(glb); for (let i = 0; i < u8.length; i += 0x8000) s2 += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return { glb: btoa(s2), log };
}, [b64('build/hero.glb'), b64(SRC)]);
fs.writeFileSync(G + 'build/enemy.glb', Buffer.from(out.glb, 'base64'));
console.log(JSON.stringify(out.log), '→ build/enemy.glb', fs.statSync(G + 'build/enemy.glb').size, 'bytes');
await b.close();
