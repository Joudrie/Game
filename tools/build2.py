import base64, json, pathlib, sys
B = pathlib.Path('build')
b64 = lambda f: base64.b64encode((B/f).read_bytes()).decode()
extra = json.loads((B/'extra.json').read_text()) if (B/'extra.json').exists() else {"clips": [], "moves": {}}
# v27: pack the clips for the 16 MB cap. A track that never changes keeps one key; the keyframe times most tracks
# share are stored once per clip as "T" (the game puts them back before parsing).
for c in extra["clips"]:
    for t in c["tracks"]:
        n, vs = len(t["times"]), t["values"]; w = len(vs) // n if n else 0
        if n > 1 and w and all(abs(vs[i] - vs[i % w]) < 1e-4 for i in range(len(vs))): t["times"], t["values"] = [0], vs[:w]
    counts = {}
    for t in c["tracks"]: k = json.dumps(t["times"]); counts[k] = counts.get(k, 0) + 1
    if counts:
        common = max(counts, key=counts.get); c["T"] = json.loads(common)
        for t in c["tracks"]:
            if json.dumps(t["times"]) == common: del t["times"]
assets = {"hero": b64('hero_dressed.glb'), "ual1": b64('ual1_anims.glb'), "ual2": b64('ual2_anims.glb'), "rifle": b64('rifle.glb'), "pistol": b64('pistol.glb'), "enemy": b64('enemy.glb'), "enemies": {k: b64(f'enemy_{k}.glb') for k in ("swat", "milsol", "insurgent", "american")}, "civ": b64('civilians.glb'), "props": b64('props.glb'), "guns": {k: b64(f'gun_{k}.glb') for k in ("ak", "shotgun", "sniper", "ar")}, "nades": {"frag": b64('nade_frag.glb')}, "att": {k: b64(f'att_{k}.glb') for k in ("suppressor", "scope")}, "tex": {"flames": b64('fx_flames.png'), "smoke": b64('fx_smoke.png'), "splat": b64('fx_splat.png'), "grass": b64('ground_grass.webp'), "water": b64('water_normals.webp')}, "world": {"buildings": b64('world_buildings.glb'), "nature": b64('world_nature.glb'), "roads": b64('world_roads.glb')}, "sfx": {f.stem: base64.b64encode(f.read_bytes()).decode() for f in sorted((B/"sfx").glob("*.ogg"))}, "vo": {d.name: {f.stem: base64.b64encode(f.read_bytes()).decode() for f in sorted(d.glob("*.ogg"))} for d in sorted((B/"vo").glob("v*")) if d.is_dir()}, "jetpack": base64.b64encode(pathlib.Path('assets/jetpack/boba_fett_jetpack.obj').read_bytes()).decode(), "extra": extra}
src = pathlib.Path('src/game2.html').read_text()
# v50: three.js is bundled into the page (esbuild, from node_modules) instead of loaded from cdn.jsdelivr.net through an
# import map: on friends' phones the page sat on "Loading" when any of the ten CDN files failed, and iPhones before iOS
# 16.4 can't read import maps at all. The game script targets Safari 15 (iOS 15) and up. Needs `npm install`.
import re, subprocess
m = re.search(r'<script type="module">\n(.*?)</script>', src, re.S)
tmp = pathlib.Path('build/_game_module.mjs'); tmp.write_text(m.group(1))
bundle = subprocess.run(['npx', 'esbuild', str(tmp), '--bundle', '--format=esm', '--target=es2022,safari15', '--minify-whitespace', '--minify-syntax',
                         '--legal-comments=none', '--log-level=warning'], capture_output=True, text=True, check=True).stdout
tmp.unlink()
src = src[:m.start()] + '<script type="module">\n' + bundle.replace('</script', '<\\/script') + '</script>' + src[m.end():]
src = re.sub(r'<script type="importmap">.*?</script>\n', '', src, flags=re.S)
out = src.replace('__ASSETS_JSON__', json.dumps(assets, separators=(',', ':')))
pathlib.Path('dist').mkdir(exist_ok=True)
pathlib.Path('dist/index.html').write_text(out)
prev = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + out + '</body></html>')
pathlib.Path('dist/preview2.html').write_text(prev)
print(round(len(out)/1e6,2), 'MB')
