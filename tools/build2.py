import base64, json, pathlib, sys
B = pathlib.Path('build')
b64 = lambda f: base64.b64encode((B/f).read_bytes()).decode()
extra = json.loads((B/'extra.json').read_text()) if (B/'extra.json').exists() else {"clips": [], "moves": {}}
assets = {"hero": b64('hero.glb'), "ual1": b64('ual1_anims.glb'), "ual2": b64('ual2_anims.glb'), "rifle": b64('rifle.glb'), "pistol": b64('pistol.glb'), "second": b64('the_second_rigged.glb'), "jetpack": base64.b64encode(pathlib.Path('assets/jetpack/boba_fett_jetpack.obj').read_bytes()).decode(), "extra": extra}
src = pathlib.Path('src/game2.html').read_text()
out = src.replace('__ASSETS_JSON__', json.dumps(assets))
pathlib.Path('dist').mkdir(exist_ok=True)
pathlib.Path('dist/index.html').write_text(out)
prev = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + out + '</body></html>').replace('https://cdn.jsdelivr.net/npm/three@0.186.1/', '/three/')
pathlib.Path('dist/preview2.html').write_text(prev)
print(round(len(out)/1e6,2), 'MB')
