// Turn downloaded gun and grenade models (TastyTony's low-poly set, Sketchfab, CC-BY) into the game's convention:
// static meshes (their rigs baked out at bind pose), barrel along +X, top up, so buildGuns() / buildPistol() can place
// them (grip and fore-grip are fractions of length from the back and of height from the top). The barrel end is found
// as the end whose cross-section is smaller (the stock or the grip is the tall end). Writes build/<out>.glb and a side
// view with a 10% grid to OUT/<out>.png for choosing the hand points by eye.
// node tools/prep_guns.mjs <in.glb>=<out> … (needs the dist server on :8766)
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const OUT = process.env.OUT || '/tmp';
const jobs = process.argv.slice(2).map((a) => a.split('='));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 900, height: 420 } });
p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.goto('http://127.0.0.1:8766/three/build/three.module.js');
await p.setContent(`<body style="margin:0;background:#eef"><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script></body>`);
for (const [src, out] of jobs) {
  const res = await p.evaluate(async (b64) => {
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const buf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
    const g = await new Promise((res, rej) => new GLTFLoader().parse(buf, '', res, rej));
    g.scene.updateMatrixWorld(true);
    // bake every mesh into world space as a plain mesh
    const meshes = [];
    g.scene.traverse((o) => {
      if (!o.isMesh) return;
      const geo = o.geometry.clone(); const pos = geo.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); if (o.isSkinnedMesh) o.applyBoneTransform(i, v); v.applyMatrix4(o.matrixWorld); pos.setXYZ(i, v.x, v.y, v.z); }
      geo.deleteAttribute('skinIndex'); geo.deleteAttribute('skinWeight'); geo.computeVertexNormals(); geo.computeBoundingBox(); geo.computeBoundingSphere(); // the clone kept the old box
      const mat = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
      meshes.push(new THREE.Mesh(geo, mat));
    });
    const grp = new THREE.Group(); for (const m of meshes) grp.add(m);
    const box = new THREE.Box3().setFromObject(grp), size = box.getSize(new THREE.Vector3());
    // longest axis becomes X (Y stays up when it isn't the longest)
    const long = size.x >= size.y && size.x >= size.z ? 'x' : size.z >= size.y ? 'z' : 'y';
    if (long === 'z') grp.rotation.y = Math.PI / 2; else if (long === 'y') grp.rotation.z = -Math.PI / 2;
    grp.updateMatrixWorld(true);
    // the barrel is the slimmer end: compare the height of the 12% at each end
    const pts = []; grp.traverse((o) => { if (!o.isMesh) return; const pp = o.geometry.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < pp.count; i++) pts.push(v.fromBufferAttribute(pp, i).applyMatrix4(o.matrixWorld).clone()); });
    const bb = new THREE.Box3().setFromPoints(pts), L = bb.max.x - bb.min.x;
    const slice = (lo, hi) => { let a = Infinity, z = -Infinity; for (const v of pts) if (v.x >= lo && v.x <= hi) { a = Math.min(a, v.y); z = Math.max(z, v.y); } return z - a; };
    const back = slice(bb.min.x, bb.min.x + 0.12 * L), front = slice(bb.max.x - 0.12 * L, bb.max.x);
    if (front > back) { grp.rotation.y += Math.PI; grp.updateMatrixWorld(true); }
    // bake the turn into the vertices, centre on the box
    const wrap = new THREE.Group();
    for (const m of [...grp.children]) { m.geometry.applyMatrix4(m.matrixWorld); m.geometry.computeVertexNormals(); m.geometry.computeBoundingBox(); m.position.set(0, 0, 0); m.rotation.set(0, 0, 0); m.updateMatrix(); wrap.add(m); }
    wrap.updateMatrixWorld(true);
    const fb = new THREE.Box3().setFromObject(wrap), c = fb.getCenter(new THREE.Vector3());
    for (const m of wrap.children) m.geometry.translate(-c.x, -c.y, -c.z);
    const fs2 = new THREE.Box3().setFromObject(wrap).getSize(new THREE.Vector3());
    // side view with a 10% grid (x from the back, y from the top)
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xeeeeff); scene.add(wrap);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 2.2)); const dl = new THREE.DirectionalLight(0xffffff, 1.5); dl.position.set(1, 2, 3); scene.add(dl);
    const w = fs2.x * 0.55, h = w * 420 / 900; const cam = new THREE.OrthographicCamera(-w, w, h, -h, -10, 10); cam.position.set(0, 0, 5);
    for (let i = 0; i <= 10; i++) {
      const x = -fs2.x / 2 + fs2.x * i / 10, y = fs2.y / 2 - fs2.y * i / 10, mat = new THREE.LineBasicMaterial({ color: i % 5 ? 0x9999cc : 0xcc3333 });
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -fs2.y / 2, 1), new THREE.Vector3(x, fs2.y / 2, 1)]), mat));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-fs2.x / 2, y, 1), new THREE.Vector3(fs2.x / 2, y, 1)]), mat));
    }
    let r = document.querySelector('canvas'); if (!r) { const rr = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); rr.setSize(900, 420); document.body.appendChild(rr.domElement); window.__r = rr; }
    window.__r.render(scene, cam);
    scene.remove(wrap);
    const glb = await new GLTFExporter().parseAsync(wrap, { binary: true });
    let s2 = ''; const u8 = new Uint8Array(glb); for (let i = 0; i < u8.length; i += 0x8000) s2 += String.fromCharCode(...u8.subarray(i, i + 0x8000));
    return { glb: btoa(s2), size: fs2.toArray().map((x) => +x.toFixed(3)), long, flipped: front > back, meshes: meshes.length };
  }, fs.readFileSync(src).toString('base64'));
  fs.writeFileSync(G + `build/${out}.glb`, Buffer.from(res.glb, 'base64'));
  await p.screenshot({ path: `${OUT}/${out}.png` });
  console.log(out, JSON.stringify({ size: res.size, long: res.long, flipped: res.flipped, meshes: res.meshes, bytes: fs.statSync(G + `build/${out}.glb`).size }));
}
await b.close();
