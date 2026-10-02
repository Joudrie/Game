// Civilians (v35): a man and a woman from Quaternius' "Universal Base Characters" (CC0), dressed in the Peasant outfits
// from "Modular Character Outfits - Fantasy" (CC0), with a few hairstyles each ("Rigged to Head Bone" versions).
// Both use the hero's UE-mannequin joint names, so every clip in the game plays on them.
//  - each body keeps only what the clothes don't cover: the head and neck (and the woman's hands; the man's outfit has
//    its own); eyes and eyebrows stay
//  - outfit and hair meshes are bound to the body's own skin, joints remapped by name
//  - one scene with two roots, `civ_m` and `civ_f`; hair nodes are named `hair_<style>` so the game picks one per person
//  - colour maps only, small WebP; welded, quantized and meshopt-compressed
// Usage: node tools/make_civilians.mjs <Universal Base Characters zip> <Modular Character Outfits - Fantasy zip>
// Writes build/civilians.glb.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, weld, quantize, meshopt, prune, mergeDocuments, unpartition, compactPrimitive, simplifyPrimitive } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const [ubcZip, outfitZip] = process.argv.slice(2);
if (!ubcZip || !outfitZip) { console.log('usage: node tools/make_civilians.mjs <Universal Base Characters zip> <Modular Character Outfits - Fantasy zip>'); process.exit(1); }
const tmp = '/tmp/make_civilians'; fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
execSync(`cd ${tmp} && unzip -q -o "${path.resolve(ubcZip)}" "*Base Characters/Godot - UE/*" "*Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)/*"`);
execSync(`cd ${tmp} && unzip -q -o "${path.resolve(outfitZip)}" "*glTF (Godot-Unreal)/Outfits/*"`);
// a few textures the glTF files name are missing from the zips (normal maps we drop anyway): stand-ins so they load
const stub = execSync(`find ${tmp} -name "*.png" | head -1`).toString().trim();
for (const f of execSync(`find ${tmp} -name "*.gltf"`).toString().trim().split('\n')) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const im of j.images || []) { const p = path.join(path.dirname(f), decodeURIComponent(im.uri || '')); if (im.uri && !fs.existsSync(p)) fs.copyFileSync(stub, p); }
}
const find = (name) => execSync(`find ${tmp} -name "${name}"`).toString().trim().split('\n')[0];
await MeshoptEncoder.ready; await MeshoptDecoder.ready; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

async function person(body, outfit, hairs, keep) {
  const doc = await io.read(find(body)), root = doc.getRoot();
  const skin = root.listSkins()[0], joints = skin.listJoints(), jName = joints.map((j) => j.getName());
  const top = root.listScenes()[0].listChildren()[0];
  // the body: keep the triangles whose vertices all lean on the kept bones
  const bodyNode = root.listNodes().find((n) => n.getMesh() && /Superhero/i.test(n.getName()));
  for (const prim of bodyNode.getMesh().listPrimitives()) {
    const J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0'), idx = prim.getIndices(), keepTri = [];
    const kept = (v) => { const j = J.getElement(v, []), w = W.getElement(v, []); let h = 0; for (let k = 0; k < 4; k++) if (keep(jName[j[k]])) h += w[k]; return h > 0.5; };
    for (let t = 0; t < idx.getCount(); t += 3) { const a = idx.getScalar(t), b = idx.getScalar(t + 1), c = idx.getScalar(t + 2); if (kept(a) && kept(b) && kept(c)) keepTri.push(a, b, c); }
    prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(keepTri)).setBuffer(root.listBuffers()[0]));
    compactPrimitive(prim); // drop the vertices nothing uses any more
  }
  bodyNode.setName('body');
  const index = new Map(jName.map((n, i) => [n, i]));
  for (const [file, label] of [[outfit, 'outfit'], ...hairs.map((h) => [h + '.gltf', 'hair_' + h.replace(/^Hair_/, '')])]) {
    const before = new Set(root.listNodes());
    mergeDocuments(doc, await io.read(find(file)));
    const added = root.listNodes().filter((n) => !before.has(n)), meshes = added.filter((n) => n.getMesh());
    for (const n of meshes) {
      const sk = n.getSkin(); if (!sk) continue;
      const map = sk.listJoints().map((j) => { const i = index.get(j.getName()); if (i === undefined) throw new Error('no joint ' + j.getName()); return i; });
      for (const pr of n.getMesh().listPrimitives()) { const JA = pr.getAttribute('JOINTS_0'), v = []; for (let k = 0; k < JA.getCount(); k++) { JA.getElement(k, v); JA.setElement(k, v.map((x) => map[x])); } }
      n.setSkin(skin); n.setName(label === 'outfit' ? 'outfit_' + n.getName() : label); top.addChild(n);
    }
    for (const s of root.listScenes().slice(1)) s.dispose();
    for (const n of added) if (!meshes.includes(n)) n.dispose();
  }
  for (const s of root.listSkins()) if (s !== skin) s.dispose();
  return doc;
}
const HEAD = (n) => n === 'Head' || n === 'neck_01';
const HANDS = (n) => HEAD(n) || /^hand_|^(thumb|index|middle|ring|pinky)_/.test(n);
const male = await person('Superhero_Male_FullBody.gltf', 'Male_Peasant.gltf', ['Hair_SimpleParted', 'Hair_Buzzed', 'Hair_Beard'], HEAD);
const female = await person('Superhero_Female_FullBody.gltf', 'Female_Peasant.gltf', ['Hair_Long', 'Hair_Buns', 'Hair_BuzzedFemale'], HANDS);
male.getRoot().listScenes()[0].listChildren()[0].setName('civ_m');
female.getRoot().listScenes()[0].listChildren()[0].setName('civ_f');
const out = male, scene = out.getRoot().listScenes()[0];
mergeDocuments(out, female);
for (const s of out.getRoot().listScenes()) if (s !== scene) { for (const n of s.listChildren()) scene.addChild(n); s.dispose(); }
// fewer triangles: a crowd of eight costs about what four soldiers do (the clothes and long hair were 3-5k vertices
// each); the error bound keeps the silhouettes
await out.transform(weld());
for (const n of out.getRoot().listNodes()) {
  if (!n.getMesh() || !/^(outfit_|hair_)/.test(n.getName())) continue;
  for (const pr of n.getMesh().listPrimitives()) if (pr.getAttribute('POSITION').getCount() > 1200) simplifyPrimitive(pr, { simplifier: MeshoptSimplifier, ratio: 0.45, error: 0.002 });
}
// colour maps only, small
for (const m of out.getRoot().listMaterials()) {
  m.setNormalTexture(null); m.setMetallicRoughnessTexture(null); m.setOcclusionTexture(null); m.setMetallicFactor(0); m.setRoughnessFactor(0.9);
  const t = m.getBaseColorTexture(); if (!t) continue;
  const px = /Peasant|Superhero|Regular/.test(m.getName()) ? 256 : /Eye/.test(m.getName()) ? 64 : 128;
  t.setImage(await sharp(Buffer.from(t.getImage())).resize(px, px).webp({ quality: 80 }).toBuffer()).setMimeType('image/webp').setURI(t.getName() + '.webp');
}
await out.transform(unpartition(), prune(), dedup(), weld(), quantize({ quantizationVolume: 'scene', quantizeTexcoord: 12 }), meshopt({ encoder: MeshoptEncoder, level: 'high', quantizationVolume: 'scene' }));
// quantizing leaves a copy of the bind matrices behind for every mesh; only the two skins' own are used
const ibms = new Set(out.getRoot().listSkins().map((sk) => sk.getInverseBindMatrices()));
for (const a of out.getRoot().listAccessors()) if (a.getType() === 'MAT4' && !ibms.has(a)) a.dispose();
await out.transform(prune());
await io.write(G + 'build/civilians.glb', out);
for (const t of out.getRoot().listTextures()) console.log('  texture', t.getName(), t.getImage().byteLength);
for (const n of out.getRoot().listNodes()) if (n.getMesh()) console.log('  mesh', n.getName(), n.getMesh().listPrimitives().map((p) => p.getAttribute('POSITION').getCount()).join('+'), 'verts');
console.log('wrote build/civilians.glb', fs.statSync(G + 'build/civilians.glb').size, 'bytes:', scene.listChildren().map((r) => r.getName() + ' [' + r.listChildren().filter((n) => n.getMesh()).map((n) => n.getName()).join(' ') + ']').join('  '));
