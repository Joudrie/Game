import base64, pathlib
src = pathlib.Path('src/game.html').read_text()
b64 = base64.b64encode(pathlib.Path('build/Soldier.glb').read_bytes()).decode()
out = src.replace('__SOLDIER_B64__', b64)
pathlib.Path('dist').mkdir(exist_ok=True)
pathlib.Path('dist/v1.html').write_text(out)
# local preview wrapper mimicking the publish skeleton
pathlib.Path('dist/preview.html').write_text(('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>' + out + '</body></html>').replace('https://cdn.jsdelivr.net/npm/three@0.186.1/', '/three/'))
print(len(out)//1024, 'KB')
