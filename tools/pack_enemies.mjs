// Compress enemy bodies from tools/reskin_enemy.mjs in place for the play link (v49): weld, quantize (scene volume:
// a skinned mesh ignores its node's transform, see the v34 note in CLAUDE.md), meshopt, and textures as JPEG at 1024 px
// at most. node tools/pack_enemies.mjs build/enemy_x.glb …
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, quantize, meshopt, prune, dedup, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs';
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
for (const f of process.argv.slice(2)) {
  const before = fs.statSync(f).size, doc = await io.read(f);
  await doc.transform(dedup(), weld(), prune(), textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [1024, 1024], quality: 80 }),
    quantize({ quantizationVolume: 'scene' }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await io.write(f, doc);
  console.log(f, before, '→', fs.statSync(f).size, 'bytes');
}
