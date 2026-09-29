import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const [src, dst] = process.argv.slice(2);
const d = await io.read(src);
for (const t of d.getRoot().listTextures()) t.dispose();
await d.transform(prune({ keepLeaves: true }));
await io.write(dst, d);
