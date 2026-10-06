#!/usr/bin/env python3
"""Add a sound effect to the shared library (sfx/<category>/<name>.wav + sfx/index.json).

Every library SFX is made consistent so it can be dropped into any edit
without re-balancing:
  - 48 kHz, mono, 16-bit WAV
  - leading/trailing silence trimmed (below -50 dBFS)
  - hard cap of 5.0 s (with a 60 ms fade-out)
  - "punch" normalised: the loudest 100 ms window sits at -18 dBFS RMS,
    peaks limited to -1 dBFS. Mix level is decided later by mix_audio.py.

Usage:
  python3 tools/sfx_add.py in.mp3 --category paper --name rip-short \
      --tags "paper,rip,tear,transition" --source elevenlabs \
      --prompt "Single quick sheet of paper torn in half, crisp close-mic rip"
"""
import argparse, json, os, subprocess, sys
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
MAX_LEN = 5.0
TARGET_PUNCH_DB = -18.0
PEAK_DB = -1.0


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def db(x):
    return 20 * np.log10(max(x, 1e-9))


def process(a):
    # trim silence
    win = int(0.01 * SR)
    env = np.array([np.sqrt(np.mean(a[i:i + win] ** 2)) for i in range(0, max(1, len(a) - win), win)])
    loud = np.where(20 * np.log10(env + 1e-9) > -50)[0]
    if len(loud) == 0:
        raise SystemExit('clip is silent (everything below -50 dBFS); not adding it')
    a = a[max(0, loud[0] * win - int(0.005 * SR)):min(len(a), (loud[-1] + 2) * win)]
    # cap length
    if len(a) > MAX_LEN * SR:
        a = a[:int(MAX_LEN * SR)]
    fade = min(len(a) // 4, int(0.06 * SR))
    a[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)
    a[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR), dtype=np.float32)
    # punch normalise
    w = int(0.1 * SR)
    if len(a) <= w:
        punch = np.sqrt(np.mean(a ** 2))
    else:
        c = np.cumsum(np.concatenate([[0], a.astype(np.float64) ** 2]))
        punch = np.sqrt(np.max((c[w:] - c[:-w]) / w))
    a = a * (10 ** ((TARGET_PUNCH_DB - db(punch)) / 20))
    pk = np.max(np.abs(a))
    if db(pk) > PEAK_DB:
        a = a * (10 ** ((PEAK_DB - db(pk)) / 20))
    return a.astype(np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('--category', required=True, help='paper | transition | ui | trade | <new>')
    ap.add_argument('--name', required=True, help='kebab-case, e.g. rip-short')
    ap.add_argument('--tags', default='')
    ap.add_argument('--source', default='elevenlabs', help='elevenlabs | synth | <site/licence>')
    ap.add_argument('--prompt', default='')
    ap.add_argument('--credits', type=float, default=None)
    ap.add_argument('--force', action='store_true')
    a = ap.parse_args()

    idx_path = os.path.join(ROOT, 'sfx', 'index.json')
    idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {'version': 1, 'items': []}
    key = f'{a.category}/{a.name}'
    if any(i['id'] == key for i in idx['items']) and not a.force:
        raise SystemExit(f'{key} already exists (use --force to replace)')

    y = process(load(a.src))
    out = os.path.join(ROOT, 'sfx', a.category, f'{a.name}.wav')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sf.write(out, y, SR, subtype='PCM_16')

    item = {
        'id': key,
        'file': f'sfx/{a.category}/{a.name}.wav',
        'duration': round(len(y) / SR, 3),
        'tags': [t.strip() for t in a.tags.split(',') if t.strip()],
        'source': a.source,
        'prompt': a.prompt,
    }
    if a.credits is not None:
        item['credits'] = a.credits
    idx['items'] = [i for i in idx['items'] if i['id'] != key] + [item]
    idx['items'].sort(key=lambda i: i['id'])
    json.dump(idx, open(idx_path, 'w'), indent=2)
    print(f'added {key} ({item["duration"]}s)')


if __name__ == '__main__':
    main()
