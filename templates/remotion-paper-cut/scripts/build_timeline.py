"""Builds src/data/timeline.json from the EDL + analysis data.

Everything Remotion needs is resolved here per OUTPUT frame so the React side
stays declarative:
  - which source frame to show (jump cuts),
  - layout: 'full' talking head, 'collage' (rebuilt split-screen) or 'end',
  - the bounding box of the ORIGINAL burned-in caption on that frame (our
    paper caption is drawn over it so it is hidden),
  - camera zoom (punch-ins that hide the jump cuts),
  - caption chunks and word timings for karaoke highlighting.
"""
import json, os, re
from edl import FPS, SEGMENTS, END_CARD_FRAMES, CHUNKS, WORD_FIXES, SPLITS

HERE = os.path.dirname(__file__)
A = os.path.join(HERE, 'analysis')
OUT = os.path.join(HERE, '..', 'src', 'data', 'timeline.json')

words = json.load(open(os.path.join(A, 'words_raw.json')))
for w in words:
    for (txt, t0), t in WORD_FIXES.items():
        if w['w'] == txt and abs(w['s'] - t0) < 0.015:
            w['s'] = t
            break
words.sort(key=lambda w: w['s'])

cap_raw = json.load(open(os.path.join(A, 'capboxes.json')))
NSRC = len(cap_raw)


def caption_box(f):
    """Pick the dominant caption cluster on a source frame (ignores stray hits)."""
    bs = cap_raw[f]
    if not bs:
        return None
    clusters = []
    for b in sorted(bs, key=lambda b: (b[1] + b[3]) / 2):
        cy = (b[1] + b[3]) / 2
        if clusters and abs(cy - clusters[-1]['cy']) < 90:
            c = clusters[-1]
            c['b'] = [min(c['b'][0], b[0]), min(c['b'][1], b[1]), max(c['b'][2], b[2]), max(c['b'][3], b[3])]
            c['w'] += b[2] - b[0]
            c['cy'] = cy  # chain line to line (multi-line captions)
        else:
            clusters.append({'cy': cy, 'b': list(b[:4]), 'w': b[2] - b[0]})
    best = max(clusters, key=lambda c: c['w'])
    return best['b']


boxes = [caption_box(f) for f in range(NSRC)]
# hold boxes across 1-3 frame detection dropouts
held = list(boxes)
for f in range(NSRC):
    if held[f] is None:
        for d in (1, -1, 2, -2, 3, -3):
            g = f + d
            if 0 <= g < NSRC and boxes[g] is not None:
                held[f] = boxes[g]
                break


def split_of(f):
    for s in SPLITS:
        if s['ext'][0] <= f <= s['ext'][1]:
            return s
    return None


def norm(t):
    return re.sub(r"[^a-z0-9']", '', t.lower())


segments, frames, chunks_out = [], [], []
out = 0
for sid, pieces in SEGMENTS:
    seg = {'id': sid, 'start': out, 'pieces': []}
    kept = []
    for (i, o) in pieces:
        fi, fo = round(i * FPS), round(o * FPS)
        p = {'srcIn': fi, 'srcOut': fo, 'start': out, 'end': out + (fo - fi)}
        seg['pieces'].append(p)
        for w in words:
            if i - 0.12 <= w['s'] < o - 0.1 and w not in kept:
                kept.append({**w, 'out': max(p['start'], p['start'] + round(w['s'] * FPS) - fi)})
        for k, f in enumerate(range(fi, fo)):
            frames.append({'src': f, 'seg': sid, 'piece': len(seg['pieces']) - 1})
        out = p['end']
    seg['end'] = out
    segments.append(seg)

    # caption chunks
    toks = [c.strip() for c in CHUNKS[sid].split('|')]
    wi = 0
    seg_chunks = []
    for c in toks:
        cw = []
        for raw in c.split():
            emph = raw.startswith('*') or raw.endswith('*') or raw.endswith('*,') or raw.endswith('*.') or raw.endswith('*!')
            txt = raw.replace('*', '')
            if wi >= len(kept) or norm(kept[wi]['w']) != norm(txt):
                got = kept[wi]['w'] if wi < len(kept) else None
                raise SystemExit(f'[{sid}] chunk word mismatch: want {txt!r} got {got!r}')
            cw.append({'w': txt, 'f': kept[wi]['out'], 'emph': emph})
            wi += 1
        seg_chunks.append({'seg': sid, 'words': cw, 'start': max(seg['start'], cw[0]['f'] - 2)})
    if wi != len(kept):
        raise SystemExit(f'[{sid}] unused words: {[k["w"] for k in kept[wi:]]}')
    seg_chunks[0]['start'] = seg['start']
    for a, b in zip(seg_chunks, seg_chunks[1:]):
        a['end'] = b['start']
    seg_chunks[-1]['end'] = seg['end']
    chunks_out += seg_chunks

total_speech = out
end_start = out
total = out + END_CARD_FRAMES

# ---- per-frame layout ----------------------------------------------------
layout = []
for k, fr in enumerate(frames):
    s = split_of(fr['src'])
    layout.append('collage' if s else 'full')
# absorb layout runs shorter than 8 frames into the previous run
runs = []
for k, l in enumerate(layout):
    if runs and runs[-1][0] == l:
        runs[-1][2] = k
    else:
        runs.append([l, k, k])
for r in range(1, len(runs)):
    l, a, b = runs[r]
    if b - a + 1 < 8:
        for k in range(a, b + 1):
            layout[k] = layout[a - 1]

# ---- zoom plan -------------------------------------------------------------
ZOOMS = [1.0, 1.14, 1.05, 1.22]
zoom_events = []  # (frame, zoom)
zi = 0
last = -999
piece_starts = {p['start'] for s in segments for p in s['pieces']}
chunk_by_start = {c['start']: c for c in chunks_out}
for k in range(total_speech):
    if k in piece_starts:
        zi += 1
        zoom_events.append((k, ZOOMS[zi % len(ZOOMS)]))
        last = k
    elif k in chunk_by_start and k - last > 45 and any(w['emph'] for w in chunk_by_start[k]['words']):
        zi += 1
        zoom_events.append((k, ZOOMS[zi % len(ZOOMS)]))
        last = k



def cover_box(k):
    """Union of the old caption's boxes over +-6 frames (same piece), padded.

    The original captions animate line by line, so a single frame's box can
    miss a line that appears a moment later; the union keeps it covered.
    """
    fr = frames[k]
    seg = next(s for s in segments if s['id'] == fr['seg'])
    p = seg['pieces'][fr['piece']]
    me = held[fr['src']]
    cands = []
    for g in range(max(p['srcIn'], fr['src'] - 6), min(p['srcOut'], fr['src'] + 7)):
        b = boxes[g]
        if b is None:
            continue
        if me is not None and abs((b[1] + b[3]) / 2 - (me[1] + me[3]) / 2) > 170:
            continue
        cands.append(b)
    if me is not None:
        cands.append(me)
    if not cands:
        return None
    u = [min(b[0] for b in cands), min(b[1] for b in cands), max(b[2] for b in cands), max(b[3] for b in cands)]
    return [u[0] - 12, u[1] - 16, u[2] + 12, u[3] + 16]


frame_rows = []
ev = 0
cur = 1.0
for k, fr in enumerate(frames):
    while ev < len(zoom_events) and zoom_events[ev][0] <= k:
        cur = zoom_events[ev][1]
        ev += 1
    s = split_of(fr['src'])
    top = None
    if s:
        top = min(max(fr['src'], s['run'][0]), s['run'][1])
    frame_rows.append([fr['src'], layout[k][0], cover_box(k), round(cur, 3), top])

data = {
    'fps': FPS,
    'width': 1080,
    'height': 1920,
    'srcWidth': 720,
    'srcHeight': 1280,
    'totalFrames': total,
    'speechFrames': total_speech,
    'endCardStart': end_start,
    'segments': segments,
    'chunks': chunks_out,
    # per output frame: [srcFrame, layout 'f'|'c', origCaptionBox|null, zoom, collageTopSrc|null]
    'frames': frame_rows,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(data, open(OUT, 'w'), separators=(',', ':'))
print(f'total {total} frames ({total / FPS:.2f}s), speech {total_speech}, chunks {len(chunks_out)}')
for s in segments:
    print(f"  {s['id']:<11} {s['start']:5d}-{s['end']:5d}  ({(s['end'] - s['start']) / FPS:.2f}s)")
