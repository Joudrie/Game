import fs from 'fs'; import path from 'path';
import validator from 'gltf-validator';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self = globalThis;
globalThis.ProgressEvent = class { constructor(t,o){Object.assign(this,o);this.type=t;} };
const _fetch = globalThis.fetch;
globalThis.fetch = async (req)=>{ const u = typeof req==='string'?req:req.url; if (/^(https?|data):/.test(u)) return _fetch(u); const b=fs.readFileSync(decodeURIComponent(u)); return new Response(b,{status:200}); };
globalThis.Request = class { constructor(u,o){ this.url=u; Object.assign(this,o||{}); } };
const origErr = console.error, origWarn = console.warn; 
const root = process.argv[2]; const files=[];
(function walk(d){ for (const f of fs.readdirSync(d)) { const p=path.join(d,f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(glb|gltf)$/i.test(f)) files.push(p);} })(root);
const out=[];
for (const p of files) {
  const buf = fs.readFileSync(p); const dir=path.dirname(p);
  let rep;
  try { rep = await validator.validateBytes(new Uint8Array(buf), { uri: p, maxIssues: 50,
     externalResourceFunction: (u)=> new Promise((res,rej)=>{ try{res(new Uint8Array(fs.readFileSync(path.join(dir, decodeURIComponent(u)))))}catch(e){rej(e.toString())} }) }); }
  catch(e){ rep={issues:{numErrors:'EXC',numWarnings:0}}; }
  let three='ok', clips=0, texErr=0;
  console.error = ()=>{texErr++}; console.warn=()=>{};
  try {
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength);
    const data = p.endsWith('.gltf') ? buf.toString() : ab;
    const g = await new Promise((res,rej)=> new GLTFLoader().parse(data, dir+'/', res, rej));
    clips = g.animations.length;
  } catch(e) { three = 'FAIL: '+String(e).slice(0,80); }
  console.error=origErr; console.warn=origWarn;
  out.push(`${path.relative(root,p)}\tvalidatorErrors=${rep.issues.numErrors}\tthree=${three}\tclips=${clips}${texErr?'\t(texture decode skipped in node)':''}`);
}
console.log(out.join('\n'));
