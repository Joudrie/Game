import fs from 'fs'; import path from 'path';
import * as THREE from 'three';
globalThis.ProgressEvent ??= class extends Event{constructor(t,o={}){super(t);Object.assign(this,o);}};
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader.js';
function loadGLTFNoTex(file){
  let buf=fs.readFileSync(file); let json, bin=null;
  if(buf.readUInt32LE(0)===0x46546c67){ const jl=buf.readUInt32LE(12); json=JSON.parse(buf.slice(20,20+jl).toString()); const bo=20+jl; bin=buf.slice(bo+8, bo+8+buf.readUInt32LE(bo)); }
  else { json=JSON.parse(buf.toString()); }
  delete json.images; delete json.textures; delete json.samplers;
  for(const m of json.materials||[]){ const p=m.pbrMetallicRoughness||{}; delete p.baseColorTexture; delete p.metallicRoughnessTexture; delete m.normalTexture; delete m.occlusionTexture; delete m.emissiveTexture; if(m.extensions) delete m.extensions; }
  json.extensionsUsed=(json.extensionsUsed||[]).filter(e=>!e.startsWith('KHR_texture')&&!e.startsWith('KHR_materials')); json.extensionsRequired=[];
  // embed buffers as data URIs
  json.buffers.forEach((b,i)=>{ const data = b.uri ? fs.readFileSync(path.join(path.dirname(file),decodeURIComponent(b.uri))) : bin; b.uri='data:application/octet-stream;base64,'+Buffer.from(data).toString('base64'); });
  return new Promise((res,rej)=>new GLTFLoader().parse(JSON.stringify(json),'',res,rej));
}
const [mode,...files]=process.argv.slice(2);
if(mode==='gltf'){
  for(const f of files){ const g=await loadGLTFNoTex(f); let bones=0; g.scene.traverse(o=>{if(o.isBone)bones++;});
    console.log(`OK ${path.basename(f)}: ${g.animations.length} clips, ${bones} bones`); }
}
if(mode==='compat'){ // compat <character> <animfile>...
  const ch=await loadGLTFNoTex(files[0]); const names=new Set(); ch.scene.traverse(o=>names.add(o.name));
  for(const f of files.slice(1)){ const g=await loadGLTFNoTex(f); let miss=new Set(), tot=0;
    for(const c of g.animations) for(const t of c.tracks){ tot++; const n=THREE.PropertyBinding.parseTrackName(t.name).nodeName; if(!names.has(n)) miss.add(n); }
    // try playing one clip
    const mixer=new THREE.AnimationMixer(ch.scene); const a=mixer.clipAction(g.animations.find(c=>/Sprint|Run|Jog/i.test(c.name))||g.animations[0]); a.play(); mixer.update(0.3);
    console.log(`${path.basename(files[0])} <- ${path.basename(f)}: ${g.animations.length} clips, ${tot} tracks, unresolved nodes: ${[...miss].join(',')||'none'}; mixer played '${a.getClip().name}' OK`); }
}
if(mode==='bvh'){ for(const f of files){ const r=new BVHLoader().parse(fs.readFileSync(f,'utf8')); console.log(`OK ${path.basename(f)}: ${r.skeleton.bones.length} bones, clip ${r.clip.duration.toFixed(2)}s, ${r.clip.tracks.length} tracks`);} }
