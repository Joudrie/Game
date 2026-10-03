// Convert a glb that uses KHR_materials_pbrSpecularGlossiness (three.js can't read it) to metal/rough.
// node tools/convert_specgloss.mjs in.glb out.glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough } from '@gltf-transform/functions';
const [src, dst] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(src);
await doc.transform(metalRough());
await io.write(dst, doc);
console.log('converted', src, '→', dst);
