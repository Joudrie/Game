// Contact sheet for a rigged character on the hero skeleton (MODEL=build/x.glb; default The Second): rest pose coloured by bone, then the poses that exposed bad weights
// (arms folded, jumps, sprint, saber swing). Needs the dist server on :8766.
// Usage: node tools/posesheet_second.mjs [out.png] [front|side]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const OUT = process.argv[2] || 'posesheet_second.png', VIEW = process.argv[3] || 'front';
const b64 = (f) => fs.readFileSync(G + f).toString('base64');
const POSES = process.env.POSES ? JSON.parse(process.env.POSES) : [['bones', 0], ['Idle_FoldArms_Loop', 1.0], ['Jump_Loop', 0.2], ['NinjaJump_Idle_Loop', 0.2], ['Sprint_Loop', 0.25], ['Sword_Regular_C', 0.9], ['Punch_Cross', 0.25], ['M2M_Levitate_Idle', 0.5]];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.goto('http://127.0.0.1:8766/three/build/three.module.js');
await p.setContent(`<style>body{margin:0}</style><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>`);
const info = await p.evaluate(async ([rig, u1, u2, extra, poses, view]) => {
  const THREE = await import('three');
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const buf = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
  const load = (s) => new Promise((res, rej) => new GLTFLoader().parse(buf(s), '', res, rej));
  const [g, a1, a2] = await Promise.all([load(rig), load(u1), load(u2)]);
  const clips = new Map([...a1.animations, ...a2.animations].map((c) => [c.name, c]));
  for (const j of JSON.parse(extra).clips) { const c = THREE.AnimationClip.parse(j); clips.set(c.name, c); }
  const W = 1600, H = 900, cols = 4, rows = Math.ceil(poses.length / cols), cw = W / cols, ch = H / rows;
  const r = new THREE.WebGLRenderer({ antialias: true }); r.setSize(W, H); document.body.appendChild(r.domElement);
  r.setScissorTest(true);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xd8d8d8);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2.2)); const d = new THREE.DirectionalLight(0xffffff, 2.2); d.position.set(1, 3, 4); scene.add(d);
  const M = g.scene; scene.add(M);
  let sk = null; M.traverse((o) => { if (o.isSkinnedMesh) sk = o; });
  if (!sk.geometry.attributes.normal) sk.geometry.computeVertexNormals();
  const texMat = sk.material;
  // bone colours: one hue per dominant bone
  const si = sk.geometry.attributes.skinIndex, sw = sk.geometry.attributes.skinWeight, colArr = new Float32Array(si.count * 3), c = new THREE.Color();
  for (let i = 0; i < si.count; i++) {
    let best = 0; for (let k = 1; k < 4; k++) if (sw.getComponent(i, k) > sw.getComponent(i, best)) best = k;
    const bi = si.getComponent(i, best); c.setHSL(((bi * 0.618) % 1), 0.75, 0.5); colArr.set([c.r, c.g, c.b], i * 3);
  }
  const ownColor = sk.geometry.attributes.color; // a vertex-coloured model keeps its colours outside the bone view
  sk.geometry.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
  const boneMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });
  const mixer = new THREE.AnimationMixer(M);
  const missing = [];
  poses.forEach(([name, t], i) => {
    mixer.stopAllAction();
    sk.skeleton.pose();
    if (name === 'bones') sk.material = boneMat;
    else { sk.material = texMat; if (ownColor) sk.geometry.setAttribute('color', ownColor); const cl = clips.get(name); if (!cl) missing.push(name); else { const a = mixer.clipAction(cl); a.reset().play(); mixer.setTime(t); } }
    M.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(sk, true), cen = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    const half = Math.max(size.y, size.x * ch / cw, size.z * ch / cw) * 0.55;
    const cam = new THREE.OrthographicCamera(-half * cw / ch, half * cw / ch, half, -half, -10, 10);
    const dir = view === 'side' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    cam.position.copy(cen).addScaledVector(dir, 3); cam.lookAt(cen);
    const x = (i % cols) * cw, y = H - (Math.floor(i / cols) + 1) * ch;
    r.setViewport(x, y, cw, ch); r.setScissor(x, y, cw, ch); r.render(scene, cam);
  });
  return { missing };
}, [b64(process.env.MODEL || 'build/the_second_rigged.glb'), b64('build/ual1_anims.glb'), b64('build/ual2_anims.glb'), fs.readFileSync(G + 'build/extra.json', 'utf8'), POSES, VIEW]);
console.log(JSON.stringify(info), POSES.map((x) => x[0]).join(' | '));
await p.screenshot({ path: OUT });
await b.close();
