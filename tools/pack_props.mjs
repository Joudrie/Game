// Props that go off (v36): Quaternius "Toon Shooter Game Kit" (CC0) exploding barrel, gas tank, landmine and sign,
// packed like the world kits: each model a top-level node named "t-<name>", welded, quantized, meshopt-compressed.
// Usage: node tools/pack_props.mjs   (reads assets/weapons/quaternius-toon-shooter; writes build/props.glb)
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize, meshopt, prune, mergeDocuments, unpartition } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import fs from 'fs'; import path from 'path';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const DIR = G + 'assets/weapons/quaternius-toon-shooter/Toon Shooter Game Kit - Dec 2022/Environment/GLB/';
const PICK = ['ExplodingBarrel', 'GasTank', 'Landmine', 'Sign'];
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const out = new Document(); out.createBuffer(); const scene = out.createScene('props');
for (const name of PICK) { const d = await io.read(DIR + name + '.glb'); d.getRoot().listScenes()[0].setName('t-' + name); mergeDocuments(out, d); }
for (const sc of out.getRoot().listScenes()) {
  if (sc === scene) continue;
  const holder = out.createNode(sc.getName()); sc.listChildren().forEach((n) => { sc.removeChild(n); holder.addChild(n); }); scene.addChild(holder); sc.dispose();
}
out.getRoot().setDefaultScene(scene);
await out.transform(unpartition(), dedup(), prune(), weld(), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
await io.write(G + 'build/props.glb', out);
console.log('build/props.glb', fs.statSync(G + 'build/props.glb').size, 'bytes:', scene.listChildren().map((n) => n.getName()).join(' '));
