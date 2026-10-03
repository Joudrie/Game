// Render one glb (front view, or ANG=<radians> around it; ANIM=1 plays its first clip) to a PNG, for checking a model by eye.
// node tools/view_glb.mjs <in.glb> <out.png> (needs the dist server on :8766)
import { chromium } from 'playwright';
import fs from 'fs';
const [src, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 900, height: 600 } });
p.on('console', (m) => console.log('page:', m.text())); p.on('pageerror', (e) => console.log('err', e.message));
await p.goto('http://127.0.0.1:8766/three/build/three.module.js');
await p.setContent(`<body style="margin:0"><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script></body>`);
await p.evaluate(([a, g]) => { window.ANIM = a; window.ANG = g; }, [process.env.ANIM || 0, process.env.ANG || 0.45]);
await p.evaluate(async (b64) => {
  const THREE = await import('three'); const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const buf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
  const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js'); const L = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder); const g = await new Promise((res, rej) => L.parse(buf, '', res, rej));
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xdde4ee);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2.5)); const d = new THREE.DirectionalLight(0xffffff, 1.5); d.position.set(2, 3, 4); scene.add(d);
  const a = g.scene; scene.add(a); if (g.animations.length && window.ANIM) { const mx = new THREE.AnimationMixer(a); mx.clipAction(g.animations[0]).play(); mx.update(0.5); console.log('anim', g.animations[0].name, g.animations[0].duration); }
  a.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(a); const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  console.log('box', JSON.stringify(box.min), JSON.stringify(box.max));
  const r = new THREE.WebGLRenderer({ antialias: true }); r.setSize(900, 600); document.body.appendChild(r.domElement);
  const cam = new THREE.PerspectiveCamera(30, 1.5, 0.01, 100);
  const D = s.y * 2.2; const ang = +(window.ANG || 0.45); cam.position.set(c.x + D * Math.sin(ang), c.y, c.z + D * Math.cos(ang)); cam.lookAt(c); r.render(scene, cam);
}, fs.readFileSync(src).toString('base64'));
await p.screenshot({ path: out }); await b.close();
