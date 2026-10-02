// Dress the hero (v34): the Quaternius Superhero (build/hero.glb) plus the Ranger outfit from Quaternius'
// "Modular Character Outfits - Fantasy" (CC0, made for the same UE-mannequin skeleton and base body).
//  - the outfit meshes are bound to the hero's own joints (same 65 names; their own inverse bind matrices, so they
//    follow the hero's slightly broader proportions)
//  - the Superhero body is split into two primitives, head and the rest, so the game can show either look:
//    the Ranger hides the bare body and the hair (the hood covers the head); the Superhero hides the outfit
//  - textures: the outfit's colour map at 512 px (WebP), the hands' at 256 px; no normal or ORM maps
//  - welded, quantized and meshopt-compressed (the game's loader has MeshoptDecoder)
// Usage: node tools/dress_hero.mjs <outfits.zip from https://quaternius.com/packs/modularcharacteroutfitsfantasy.html>
// Writes build/hero_dressed.glb (embedded as the hero by tools/build2.py).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize, meshopt, prune, mergeDocuments, unpartition } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const zip = process.argv[2]; if (!zip) { console.log('usage: node tools/dress_hero.mjs <Modular Character Outfits - Fantasy zip>'); process.exit(1); }
const tmp = '/tmp/dress_hero'; fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
execSync(`cd ${tmp} && unzip -q -o "${path.resolve(zip)}" "*glTF (Godot-Unreal)/Outfits/Male_Ranger*" "*glTF (Godot-Unreal)/Outfits/T_Ranger_*" "*glTF (Godot-Unreal)/Outfits/T_Regular_Male*"`);
const dir = execSync(`find ${tmp} -name Male_Ranger.gltf`).toString().trim();
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const hero = await io.read(G + 'build/hero.glb'), out = hero.getRoot();
const ranger = await io.read(dir);

// 1. split the bare body into head and rest (by each triangle's strongest bones)
const heroSkin = out.listSkins()[0], heroJoints = heroSkin.listJoints(), jName = heroJoints.map((j) => j.getName());
const HEAD = new Set(['Head', 'neck_01']);
const body = out.listMeshes().find((m) => m.getName() === 'Sphere.005_Retopology.004'), prim = body.listPrimitives()[0];
const J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0'), idx = prim.getIndices();
const headVert = (v) => { const j = J.getElement(v, []), w = W.getElement(v, []); let h = 0; for (let k = 0; k < 4; k++) if (HEAD.has(jName[j[k]])) h += w[k]; return h > 0.5; };
const keepHead = [], keepRest = [];
for (let t = 0; t < idx.getCount(); t += 3) { const a = idx.getScalar(t), b = idx.getScalar(t + 1), c = idx.getScalar(t + 2); (headVert(a) && headVert(b) && headVert(c) ? keepHead : keepRest).push(a, b, c); }
const restPrim = prim.clone(); restPrim.setIndices(hero.createAccessor('rest').setType('SCALAR').setArray(new Uint32Array(keepRest)).setBuffer(out.listBuffers()[0]));
prim.setIndices(hero.createAccessor('head').setType('SCALAR').setArray(new Uint32Array(keepHead)).setBuffer(out.listBuffers()[0]));
body.addPrimitive(restPrim); // primitive 0: head (always shown), primitive 1: the rest of the bare body
console.log('body split: head', keepHead.length / 3, 'tris, rest', keepRest.length / 3);

// 2. the outfit: merge, then point its skin at the hero's joints
const before = new Set(out.listNodes());
mergeDocuments(hero, ranger);
const added = out.listNodes().filter((n) => !before.has(n));
const outfitNodes = added.filter((n) => n.getMesh());
const byName = new Map(heroJoints.map((j) => [j.getName(), j]));
const scene = out.listScenes()[0], heroRoot = scene.listChildren()[0];
// the hero's own skin (one skin for everything: quantization rescales a skin's bind matrices per mesh, so separate
// skins sharing one matrix accessor came out a hundred times too big); joint indices are remapped by name
const heroIndex = new Map(jName.map((n, i) => [n, i]));
for (const n of outfitNodes) {
  const sk = n.getSkin(); if (!sk) continue;
  const map = sk.listJoints().map((j) => { const i = heroIndex.get(j.getName()); if (i === undefined) throw new Error('no hero joint ' + j.getName()); return i; });
  for (const pr of n.getMesh().listPrimitives()) { const JA = pr.getAttribute('JOINTS_0'), v = []; for (let k = 0; k < JA.getCount(); k++) { JA.getElement(k, v); JA.setElement(k, v.map((x) => map[x])); } }
  n.setSkin(heroSkin); n.setName('outfit_' + n.getName()); heroRoot.addChild(n);
}
for (const s of out.listScenes()) if (s !== scene) s.dispose();
for (const n of added) if (!outfitNodes.includes(n)) n.dispose(); // the outfit's own armature and scene root
for (const s of out.listSkins()) if (s !== heroSkin && !outfitNodes.some((n) => n.getSkin() === s)) s.dispose();
console.log('outfit meshes', outfitNodes.map((n) => n.getName()).join(', '));

// 3. textures: colour maps only, small WebP
for (const m of out.listMaterials()) {
  if (!/Ranger|Regular/.test(m.getName())) continue;
  m.setNormalTexture(null); m.setMetallicRoughnessTexture(null); m.setOcclusionTexture(null); m.setMetallicFactor(0); m.setRoughnessFactor(0.9);
  const t = m.getBaseColorTexture(); if (!t) continue;
  const px = /Ranger/.test(m.getName()) ? 512 : 256;
  t.setImage(await sharp(Buffer.from(t.getImage())).resize(px, px).webp({ quality: 82 }).toBuffer()).setMimeType('image/webp').setURI(t.getName() + '.webp');
}
await hero.transform(unpartition(), prune(), dedup(), weld(), quantize({ quantizationVolume: 'scene', quantizeTexcoord: 12 }), meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizationVolume: 'scene' }));
await io.write(G + 'build/hero_dressed.glb', hero);
console.log('wrote build/hero_dressed.glb', fs.statSync(G + 'build/hero_dressed.glb').size, 'bytes (hero.glb was', fs.statSync(G + 'build/hero.glb').size + ')');
