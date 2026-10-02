// v35: drop keyframes from the animation libraries that interpolation already reproduces (within 1e-4), and share
// identical key time arrays. build/ual1_anims.glb + ual2_anims.glb went from 6.8 MB to 1.6 MB with no visible change;
// the 16 MB play-link cap needed the room. Safe to run again (a second pass changes nothing).
// Usage: node tools/shrink_anims.mjs
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { resample, prune, dedup } from '@gltf-transform/functions';
import fs from 'fs'; import path from 'path';
const G = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..') + '/';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const f of ['build/ual1_anims.glb', 'build/ual2_anims.glb']) {
  const before = fs.statSync(G + f).size, d = await io.read(G + f);
  await d.transform(resample({ tolerance: 1e-4 }), dedup(), prune({ keepLeaves: true }));
  await io.write(G + f, d);
  console.log(f, before, '->', fs.statSync(G + f).size, 'bytes,', d.getRoot().listAnimations().length, 'clips');
}
