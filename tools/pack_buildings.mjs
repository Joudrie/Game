// Pack Kenney kits (CC0) into small GLBs for the sandbox world (v31): each model becomes a named top-level node;
// geometry is welded, quantized and meshopt-compressed (the game loads them with MeshoptDecoder).
// Usage: node tools/pack_buildings.mjs   (reads assets/world/kenney/*.zip; writes build/world_buildings.glb, build/world_nature.glb)
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize, meshopt, prune, mergeDocuments, unpartition } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const PACKS = {
  'build/world_buildings.glb': [
    { k: 'c', zip: 'kenney_city-kit-commercial_2.1.zip', dir: 'Models/GLB format', pick: ['building-a', 'building-c', 'building-e', 'building-h', 'building-k', 'building-n', 'building-skyscraper-a', 'building-skyscraper-c', 'building-skyscraper-e'] },
    { k: 'i', zip: 'kenney_city-kit-industrial_2.0.zip', dir: 'Models/GLB format', pick: ['building-b', 'building-d', 'building-h', 'building-k', 'building-q'] }],
  'build/world_nature.glb': [
    { k: 'n', zip: 'kenney_nature-kit.zip', dir: 'Models/GLTF format', pick: ['grass', 'grass_large', 'grass_leafs', 'plant_bush', 'plant_bushSmall', 'flower_redA', 'flower_yellowA', 'flower_purpleA',
      'rock_smallA', 'rock_smallC', 'rock_tallB', 'tree_palmTall', 'tree_palmDetailedShort', 'tree_oak', 'tree_default', 'path_stone', 'path_stoneCircle'] }],
};
const tmp = '/tmp/kenney_pack'; fs.rmSync(tmp, { recursive: true, force: true });
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
for (const [file, kits] of Object.entries(PACKS)) {
  const out = new Document(); out.createBuffer();
  const outScene = out.createScene('models');
  for (const kit of kits) {
    const dir = `${tmp}/${kit.k}`; fs.mkdirSync(dir, { recursive: true });
    execSync(`cd ${dir} && unzip -q -o "${G}assets/world/kenney/${kit.zip}" "${kit.dir}/*"`);
    for (const name of kit.pick) {
      const doc = await io.read(`${dir}/${kit.dir}/${name}.glb`);
      doc.getRoot().listScenes()[0].setName(`${kit.k}-${name}`);
      mergeDocuments(out, doc);
    }
  }
  for (const sc of out.getRoot().listScenes()) { // one scene: every model a top-level node named "<kit>-<name>"
    if (sc === outScene) continue;
    const holder = out.createNode(sc.getName()); sc.listChildren().forEach((n) => { sc.removeChild(n); holder.addChild(n); }); outScene.addChild(holder); sc.dispose();
  }
  out.getRoot().setDefaultScene(outScene);
  await out.transform(unpartition(), dedup(), prune(), weld(), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
  await io.write(G + file, out);
  console.log(file, fs.statSync(G + file).size, 'bytes:', outScene.listChildren().map((n) => n.getName()).join(' '));
}
