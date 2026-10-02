#!/usr/bin/env python3
"""Cut a voice recording into the game's voice clips (build/vo/<voice>/<category>_<n>.ogg).

  python3 tools/make_voice.py v1 assets/voice/raw/v1_owner_session1.m4a assets/voice/v1_takes.txt

The takes file lists "category start end" (seconds). Each take gets a little padding, a high-pass (rumble; the room was quiet enough that noise reduction only smeared consonants),
the silence after it trimmed (never the start: it eats soft first consonants),
its loudness evened out from the loud part of the take (ffmpeg's loudnorm misbehaves on one-second clips) with a
peak limit, short fades, and Opus mono 24 kHz (a few KB a line). Needs ffmpeg and numpy.
Finding the takes: quiet speech is the spoken labels ("this is me saying reloading"), loud speech the takes;
check them with faster-whisper (see v37 in CHANGELOG.md).
"""
import subprocess, sys, pathlib, collections
import numpy as np
voice, src, takes = sys.argv[1], sys.argv[2], sys.argv[3]
SR = 24000
out = pathlib.Path('build/vo') / voice; out.mkdir(parents=True, exist_ok=True)
for f in out.glob('*.ogg'): f.unlink()
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-af', 'highpass=f=90', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                     check=True, capture_output=True, stdin=subprocess.DEVNULL).stdout
x = np.frombuffer(pcm, np.float32)
QUIET = {'sus', 'giveup', 'whatthe'}  # spoken, not yelled: kept a little quieter
n = collections.Counter()
for line in open(takes):
    line = line.split('#')[0].split()
    if len(line) != 3: continue
    cat, a, b = line[0], float(line[1]) - 0.07, float(line[2]) + 0.16
    n[cat] += 1
    y = x[int(max(0, a) * SR):int(b * SR)].copy()
    hop = SR // 100; fr = np.sqrt(np.mean(y[:len(y) // hop * hop].reshape(-1, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(fr); loud = db > db.max() - 30
    last = np.nonzero(loud)[0][-1]; y = y[:min(len(y), (last + 12) * hop)]  # 120 ms after the last loud frame
    act = fr[loud]; level = 20 * np.log10(np.sqrt(np.mean(act ** 2)))
    y *= 10 ** (((-20 if cat in QUIET else -15) - level) / 20)
    pk = np.abs(y).max(); lim = 10 ** (-1.5 / 20)
    if pk > lim: y *= lim / pk  # the loudest yells: peak-limited rather than clipped
    fi, fo = int(0.01 * SR), int(0.05 * SR); y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                    '-c:a', 'libopus', '-b:a', '32k', str(out / f'{cat}_{n[cat]}.ogg')], input=y.astype(np.float32).tobytes(), check=True)
tot = sum(f.stat().st_size for f in out.glob('*.ogg'))
print(f'{sum(n.values())} clips in {len(n)} categories, {tot / 1024:.0f} KB:', dict(n))
