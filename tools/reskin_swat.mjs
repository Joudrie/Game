// Put the Quaternius SWAT officer (CC0) on the game's skeleton, for the enemy soldiers.
//  - SWAT bones map to the UE-mannequin bones by name (Hips→pelvis, UpperArm.L→upperarm_l …); the artist's own
//    skin weights are kept, only the bone indices change
//  - the hero skeleton's joints move to the SWAT joints (animations only rotate bones; root and pelvis are the only
//    translated ones), after scaling the SWAT so his hip height equals the hero's (clips set the pelvis height)
//  - his 5 meshes and 7 flat colours merge into one mesh with vertex colours: one draw call per soldier
// Runs in headless Chromium (GLTFExporter). Needs the dist server on :8766. Output: build/enemy_swat.glb
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const b64 = (f) => fs.readFileSync(G + f).toString('base64');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage();
p.on('console', (m) => { if (!/404/.test(m.text())) console.log('page:', m.text()); });
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.goto('http://127.0.0.1:8766/three/build/three.module.js');
await p.setContent(`<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>`);
const out = await p.evaluate(async ([heroB64, swatB64]) => {
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
  const buf = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
  const load = (s) => new Promise((res, rej) => new GLTFLoader().parse(buf(s), '', res, rej));
  const V = () => new THREE.Vector3();
  const [hg, sg] = await Promise.all([load(heroB64), load(swatB64)]);
  const log = {};
  // hero skeleton at rest
  const H = hg.scene; let body = null; H.traverse((o) => { if (o.isSkinnedMesh && (!body || o.geometry.attributes.position.count > body.geometry.attributes.position.count)) body = o; });
  body.skeleton.pose(); H.updateMatrixWorld(true);
  const hb = body.skeleton.bones, hByName = new Map(hb.map((x) => [x.name, x]));
  // SWAT at bind pose
  // his own pistol is left out: the game hands every soldier its pistol model
  const S = sg.scene, sMeshes = []; S.traverse((o) => { if (o.isSkinnedMesh && o.parent?.name !== 'Pistol') sMeshes.push(o); });
  sMeshes[0].skeleton.pose(); S.updateMatrixWorld(true);
  // GLTFLoader strips dots from node names (UpperArm.L → UpperArmL); key them by the original spelling
  const sByName = new Map(); S.traverse((o) => { if (o.isBone) { sByName.set(o.name, o); sByName.set(o.name.replace(/(L|R)$/, '.$1'), o); } });
  // name map SWAT → hero
  const MAP = { Root: 'pelvis', Body: 'pelvis', Hips: 'pelvis', Abdomen: 'spine_01', Torso: 'spine_02', Chest: 'spine_03', Neck: 'neck_01', Head: 'Head' };
  const FING = { Index: 'index', Middle: 'middle', Ring: 'ring', Pinky: 'pinky', Thumb: 'thumb' };
  for (const [S1, s] of [['L', 'l'], ['R', 'r']]) {
    Object.assign(MAP, { [`Shoulder.${S1}`]: `clavicle_${s}`, [`UpperArm.${S1}`]: `upperarm_${s}`, [`LowerArm.${S1}`]: `lowerarm_${s}`, [`Wrist.${S1}`]: `hand_${s}`,
      [`UpperLeg.${S1}`]: `thigh_${s}`, [`LowerLeg.${S1}`]: `calf_${s}`, [`Foot.${S1}`]: `foot_${s}`, [`PT.${S1}`]: `foot_${s}` });
    for (const [a, h] of Object.entries(FING)) for (let k = 1; k <= 4; k++) MAP[`${a}${k}.${S1}`] = k === 4 ? `${h}_04_leaf_${s}` : `${h}_0${k}_${s}`;
  }
  const W = (o) => o.getWorldPosition(V());
  // orientation: turn the SWAT so he faces the hero's way (+Z for the hero: toes ahead of ankles) and his .L is the hero's _l side
  const heroFwd = Math.sign(W(hByName.get('ball_l')).z - W(hByName.get('foot_l')).z);
  let visor = null; for (const m of sMeshes) if (/visor/i.test(m.material.name)) visor = m;
  const vc = visor ? new THREE.Box3().setFromObject(visor).getCenter(V()) : W(sByName.get('Head')).add(new THREE.Vector3(0, 0, 1));
  const faceZ = Math.sign(vc.z - W(sByName.get('Head')).z);
  const T = new THREE.Matrix4();
  if (faceZ !== heroFwd) T.makeRotationY(Math.PI);
  // scale: hip height equal to the hero's; feet on the hero's floor; centred over the hero's pelvis
  const hHip = W(hByName.get('pelvis')), sHip = W(sByName.get('Hips')).applyMatrix4(T);
  const floorS = Math.min(W(sByName.get('Foot.L')).applyMatrix4(T).y, W(sByName.get('Foot.R')).applyMatrix4(T).y);
  const floorH = Math.min(W(hByName.get('foot_l')).y, W(hByName.get('foot_r')).y);
  const k = (hHip.y - floorH) / (sHip.y - floorS);
  const X = new THREE.Matrix4().makeTranslation(hHip.x, floorH, hHip.z).multiply(new THREE.Matrix4().makeScale(k, k, k))
    .multiply(new THREE.Matrix4().makeTranslation(-sHip.x, -floorS, -sHip.z)).multiply(T);
  const sw = (name) => W(sByName.get(name)).applyMatrix4(X);
  const sideCheck = sw('UpperArm.L').x - hHip.x, heroSide = W(hByName.get('upperarm_l')).x - hHip.x;
  log.scale = +k.toFixed(4); log.turned = faceZ !== heroFwd; log.leftMatches = Math.sign(sideCheck) === Math.sign(heroSide);
  if (!log.leftMatches) for (const key of Object.keys(MAP)) if (/\.(L|R)$/.test(key)) MAP[key] = MAP[key].replace(/_l$|_r$/, (m) => (m === '_l' ? '_r' : '_l'));
  // move the hero joints onto the SWAT joints (top-down, keeping the hero's rest rotations)
  const heroToSwat = {}; for (const [s, h] of Object.entries(MAP)) if (!['Root', 'Body'].includes(s) && !/^PT/.test(s) && sByName.has(s)) heroToSwat[h] = s;
  const order = []; hByName.get('root').traverse((o) => { if (o.isBone) order.push(o); });
  for (const bone of order) {
    const s = heroToSwat[bone.name];
    if (s) { const wp = sw(s); bone.parent.updateMatrixWorld(true); bone.position.copy(wp.applyMatrix4(bone.parent.matrixWorld.clone().invert())); }
    bone.updateMatrixWorld(true);
  }
  log.moved = Object.keys(heroToSwat).length;
  // merge the SWAT meshes (bind-pose world positions, transformed by X) into one vertex-coloured geometry
  const P = [], N = [], C = [], SI = [], SWt = [], I = []; let base = 0; const col = new THREE.Color(), nm = new THREE.Matrix3();
  const hIndex = new Map(hb.map((x, i) => [x.name, i]));
  for (const m of sMeshes) {
    const g = m.geometry, pos = g.attributes.position, nor = g.attributes.normal, si = g.attributes.skinIndex, swt = g.attributes.skinWeight;
    const MW = X.clone().multiply(m.matrixWorld); nm.getNormalMatrix(MW);
    col.copy(m.material.color || new THREE.Color(1, 1, 1));
    const v = V();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i); m.applyBoneTransform(i, v); v.applyMatrix4(X.clone().multiply(m.matrixWorld)); P.push(v.x, v.y, v.z);
      v.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z);
      C.push(col.r, col.g, col.b);
      for (let c = 0; c < 4; c++) {
        const sb = m.skeleton.bones[si.getComponent(i, c)], h = (sb && (MAP[sb.name] || MAP[sb.name.replace(/(L|R)$/, '.$1')])) || 'pelvis';
        SI.push(hIndex.get(h) ?? hIndex.get('pelvis')); SWt.push(swt.getComponent(i, c));
      }
    }
    const idx = g.index ? g.index.array : [...Array(pos.count).keys()];
    for (const x of idx) I.push(x + base); base += pos.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  // bytes instead of floats for colours and weights (normalised), to keep the play link under its size cap
  const q8 = (a) => Uint8Array.from(a, (x) => Math.round(Math.min(1, Math.max(0, x)) * 255));
  const W8 = q8(SWt); for (let i = 0; i < W8.length; i += 4) { const d = 255 - (W8[i] + W8[i + 1] + W8[i + 2] + W8[i + 3]); W8[i] += d; } // weights still sum to 1
  geo.setAttribute('color', new THREE.BufferAttribute(q8(C), 3, true));
  geo.setAttribute('skinIndex', new THREE.Uint8BufferAttribute(SI, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(W8, 4, true));
  geo.setIndex(base > 65535 ? I : new THREE.Uint16BufferAttribute(I, 1));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0.05, name: 'SWAT' });
  const arm = body.parent; const olds = []; H.traverse((o) => { if (o.isMesh) olds.push(o); }); olds.forEach((o) => o.removeFromParent());
  const mesh = new THREE.SkinnedMesh(geo, mat); mesh.name = 'SWAT'; arm.add(mesh); H.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(hb), mesh.matrixWorld);
  log.verts = base; log.tris = I.length / 3; log.materials = sMeshes.map((m) => m.material.name);
  const box = new THREE.Box3().setFromBufferAttribute(geo.attributes.position); log.height = +(box.max.y - box.min.y).toFixed(3);
  const glb = await new GLTFExporter().parseAsync(H, { binary: true, animations: [] });
  let s2 = ''; const u8 = new Uint8Array(glb); for (let i = 0; i < u8.length; i += 0x8000) s2 += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return { glb: btoa(s2), log };
}, [b64('build/hero.glb'), b64('build/swat_notex.glb')]);
fs.writeFileSync(G + 'build/enemy_swat.glb', Buffer.from(out.glb, 'base64'));
console.log(JSON.stringify(out.log));
await b.close();
