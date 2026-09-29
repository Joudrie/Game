"""Trim a snap-back at the end of baked clips.

Some source clips (the SWAT and Mesh2Motion deaths) end with a keyframe that jumps back
to the standing pose, so a body that has fallen pops upright on its last frame. This finds,
in the final 20% of each clip, the first key where any bone rotates more than 45 degrees
in one step, and cuts every track just before it.

Only one-shot clips (deaths, landings, dodges, throws, jumps) are touched.

usage: python3 tools/trim_snap.py build/extra.json [more.json ...]   (edits in place; --dry to only report)
"""
import json, math, re, sys

LIMIT = 45.0
# one-shot clips only: loops (runs) and flips have large steps on purpose
ONLY = re.compile(r'Death|Land|Throw|Dodge|Jump')

def ang(a, b):
    return 2 * math.degrees(math.acos(min(1.0, abs(sum(x * y for x, y in zip(a, b))))))

def snap_time(clip):
    dur = clip['duration']
    cut = None
    for t in clip['tracks']:
        if not t['name'].endswith('quaternion'):
            continue
        ts, v = t['times'], t['values']
        for i in range(len(ts) - 1):
            if ts[i + 1] < dur * 0.8:
                continue
            if ang(v[i * 4:i * 4 + 4], v[i * 4 + 4:i * 4 + 8]) > LIMIT:
                cut = ts[i] if cut is None else min(cut, ts[i])
                break
    return cut

def trim(clip, cut):
    for t in clip['tracks']:
        n = len(t['values']) // max(1, len(t['times']))
        keep = [i for i, x in enumerate(t['times']) if x <= cut + 1e-6] or [0]
        t['times'] = [t['times'][i] for i in keep]
        t['values'] = [x for i in keep for x in t['values'][i * n:(i + 1) * n]]
    clip['duration'] = cut

dry = '--dry' in sys.argv
for path in [a for a in sys.argv[1:] if not a.startswith('--')]:
    data = json.load(open(path))
    clips = data['clips'] if isinstance(data, dict) else data
    for c in clips:
        if not ONLY.search(c['name']):
            continue
        cut = snap_time(c)
        if cut is not None and cut > 0:
            print(f"{path}: {c['name']} {c['duration']:.2f}s -> {cut:.2f}s")
            if not dry:
                trim(c, cut)
    if not dry:
        json.dump(data, open(path, 'w'), separators=(',', ':'))
