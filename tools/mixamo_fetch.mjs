// Download Mixamo motions as FBX into assets/mixamo/ (unofficial API, see CLAUDE.md).
// The proxy injects the Authorization header; the token expires after about a day (401 → ask the owner to refresh it).
// Usage: node tools/mixamo_fetch.mjs "Dual Weapon Combo" ["Another Name" ...]
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://www.mixamo.com/api/v1';
const H = { 'X-Api-Key': 'mixamo2', 'Content-Type': 'application/json', Accept: 'application/json' };
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../assets/mixamo');

async function api(p, opts = {}) {
  const r = await fetch(API + p, { ...opts, headers: H });
  const t = await r.text();
  if (!r.ok) throw new Error(`${opts.method || 'GET'} ${p} → ${r.status} ${t.slice(0, 200)}`);
  return JSON.parse(t);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const names = process.argv.slice(2);
if (!names.length) { console.error('usage: node tools/mixamo_fetch.mjs "<motion name>" ...'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const char = (await api('/characters/primary')).primary_character_id;
console.log('character', char);

for (const name of names) {
  const q = encodeURIComponent(name);
  const res = await api(`/products?page=1&limit=48&type=Motion%2CMotionPack&query=${q}`);
  const hit = res.results.find((r) => r.name.toLowerCase() === name.toLowerCase()) || res.results[0];
  if (!hit) { console.warn('not found:', name); continue; }
  const prod = await api(`/products/${hit.id}?similar=0&character_id=${char}`);
  const hashes = prod.type === 'MotionPack'
    ? prod.details.motions.map((m) => ({ ...m.gms_hash, params: m.gms_hash.params.map((p) => p[1]).join(',') }))
    : [{ ...prod.details.gms_hash, params: prod.details.gms_hash.params.map((p) => p[1]).join(',') }];
  await api('/animations/export', {
    method: 'POST',
    body: JSON.stringify({
      character_id: char, product_name: prod.name, type: prod.type,
      preferences: { format: 'fbx7_2019', skin: 'false', fps: '30', reducekf: '0' },
      gms_hash: hashes,
    }),
  });
  let mon;
  for (let i = 0; i < 90; i++) {
    await sleep(2000);
    mon = await api(`/characters/${char}/monitor`);
    if (mon.status === 'completed' || mon.status === 'failed') break;
  }
  if (mon?.status !== 'completed') { console.warn('export failed:', name, JSON.stringify(mon).slice(0, 300)); continue; }
  const file = path.join(OUT, `${prod.name}${prod.type === 'MotionPack' ? '.zip' : '.fbx'}`);
  const bin = Buffer.from(await (await fetch(mon.job_result)).arrayBuffer());
  fs.writeFileSync(file, bin);
  fs.writeFileSync(path.join(OUT, 'SOURCE.txt'),
    (fs.existsSync(path.join(OUT, 'SOURCE.txt')) ? fs.readFileSync(path.join(OUT, 'SOURCE.txt'), 'utf8') : '') +
    `${path.basename(file)}: Mixamo (Adobe) "${prod.name}" (${prod.id}), downloaded ${new Date().toISOString().slice(0, 10)}. Mixamo licence: royalty-free use in games; do not redistribute as standalone animation files.\n`);
  console.log('saved', file, bin.length, 'bytes');
}
