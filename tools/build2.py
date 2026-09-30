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
assets = {"hero": b64('hero.glb'), "ual1": b64('ual1_anims.glb'), "ual2": b64('ual2_anims.glb'), "rifle": b64('rifle.glb'), "pistol": b64('pistol.glb'), "enemy": b64('enemy_swat.glb'), "guns": {k: b64(f'gun_{k}.glb') for k in ("ak", "shotgun", "sniper", "ar")}, "att": {k: b64(f'att_{k}.glb') for k in ("suppressor", "scope")}, "tex": {"flames": b64('fx_flames.png'), "smoke": b64('fx_smoke.png')}, "sfx": {f.stem: base64.b64encode(f.read_bytes()).decode() for f in sorted((B/"sfx").glob("*.ogg"))}, "jetpack": base64.b64encode(pathlib.Path('assets/jetpack/boba_fett_jetpack.obj').read_bytes()).decode(), "extra": extra}
src = pathlib.Path('src/game2.html').read_text()
out = src.replace('__ASSETS_JSON__', json.dumps(assets, separators=(',', ':')))
pathlib.Path('dist').mkdir(exist_ok=True)
pathlib.Path('dist/index.html').write_text(out)
prev = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + out + '</body></html>').replace('https://cdn.jsdelivr.net/npm/three@0.186.1/', '/three/')
pathlib.Path('dist/preview2.html').write_text(prev)
print(round(len(out)/1e6,2), 'MB')
