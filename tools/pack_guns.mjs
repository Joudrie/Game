// Compress the prepared gun and grenade models (build/tt_*.glb from tools/prep_guns.mjs) for the play link:
// one vertex-coloured material, weld, quantize and meshopt-compress (the game's GLTF loader has the meshopt decoder), into the names the game loads.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, weld, quantize, meshopt, prune, flatten, join } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import fs from 'fs';
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const MAP = { tt_g17: 'pistol', tt_akm: 'gun_ak', tt_m4a1: 'gun_ar', tt_r870: 'gun_shotgun', tt_l115: 'gun_sniper', tt_m67: 'nade_frag' };
for (const [src, dst] of Object.entries(MAP)) {
  const doc = await io.read(`build/${src}.glb`);
  // one material per model: each part's flat colour goes into vertex colours (they have no textures), so a gun is one
  // shader and one draw call (v48: eleven materials meant eleven shader variants on the first draw)
  const one = doc.createMaterial('gun').setBaseColorFactor([1, 1, 1, 1]).setRoughnessFactor(0.55).setMetallicFactor(0.35);
  for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
    const m = prim.getMaterial(), c = m ? m.getBaseColorFactor() : [0.5, 0.5, 0.5, 1], n = prim.getAttribute('POSITION').getCount();
    const col = new Float32Array(n * 4); for (let i = 0; i < n; i++) col.set([c[0], c[1], c[2], 1], i * 4);
    prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC4').setArray(col).setBuffer(doc.getRoot().listBuffers()[0]));
    prim.setMaterial(one);
  }
  await doc.transform(dedup(), flatten(), join(), weld(), prune(), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await io.write(`build/${dst}.glb`, doc);
  console.log(src, '→', dst, fs.statSync(`build/${src}.glb`).size, '→', fs.statSync(`build/${dst}.glb`).size, 'bytes');
}
