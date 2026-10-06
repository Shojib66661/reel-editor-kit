"""Builds src/data/timeline.json from the EDL + analysis data.

Per OUTPUT frame: source frame, source shot index, the box of the ORIGINAL
burned-in caption (it was inpainted away; our caption + glow sits over the
leftover smear), and camera zoom. Plus caption chunks with word timings.
"""
import json, os, re
from edl import FPS, SEGMENTS, END_CARD_FRAMES, CHUNKS, WORD_FIXES, SHOTS, DISPLAY

HERE = os.path.dirname(__file__)
A = os.path.join(HERE, 'analysis')
OUT = os.path.join(HERE, '..', 'src', 'data', 'timeline.json')

words = json.load(open(os.path.join(A, 'words.json')))
for w in words:
    for (txt, t0), t in WORD_FIXES.items():
        if w['w'] == txt and abs(w['s'] - t0) < 0.015:
            w['s'] = t
            break
words.sort(key=lambda w: w['s'])

raw = json.load(open(os.path.join(A, 'capboxes.json')))
NSRC = len(raw)
band = [[b for b in bs if 670 <= (b[1] + b[3]) / 2 <= 760 and 14 <= b[3] - b[1] <= 60] for bs in raw]


def cover_box(f):
    """Same region the inpainter cleaned: union of caption boxes over +-3 frames."""
    c = [b for g in range(max(0, f - 3), min(NSRC, f + 4)) for b in band[g]]
    if not c:
        return None
    return [min(b[0] for b in c) - 10, min(b[1] for b in c) - 10, max(b[2] for b in c) + 10, max(b[3] for b in c) + 12]


def shot_of(f):
    k = 0
    for i, s in enumerate(SHOTS):
        if f >= s:
            k = i
    return k


def norm(t):
    return re.sub(r"[^a-z0-9']", '', t.lower())


segments, frames, chunks_out = [], [], []
out = 0
for sid, pieces in SEGMENTS:
    seg = {'id': sid, 'start': out, 'pieces': []}
    kept = []
    for (fi, fo) in pieces:
        i, o = fi / FPS, fo / FPS
        p = {'srcIn': fi, 'srcOut': fo, 'start': out, 'end': out + (fo - fi)}
        seg['pieces'].append(p)
        for w in words:
            if i - 0.12 <= w['s'] < o - 0.1 and w not in kept:
                kept.append({**w, 'out': max(p['start'], p['start'] + round(w['s'] * FPS) - fi)})
        for f in range(fi, fo):
            frames.append({'src': f, 'seg': sid, 'piece': len(seg['pieces']) - 1})
        out = p['end']
    seg['end'] = out
    segments.append(seg)

    toks = [c.strip() for c in CHUNKS[sid].split('|')]
    wi = 0
    seg_chunks = []
    for c in toks:
        cw = []
        # *hot air* style multi-word heroes: track open/close stars
        hero = False
        for rawt in c.split():
            starts = rawt.startswith('*')
            if starts:
                hero = True
            txt = rawt.replace('*', '')
            emph = hero
            if rawt.rstrip('.,!?').endswith('*'):
                hero = False
            if wi >= len(kept) or norm(kept[wi]['w']) != norm(txt):
                got = kept[wi]['w'] if wi < len(kept) else None
                raise SystemExit(f'[{sid}] chunk word mismatch: want {txt!r} got {got!r}')
            punct = re.sub(r"^.*?([.,!?]*)$", r"\1", txt)
            shown = DISPLAY.get(norm(txt), None)
            cw.append({'w': (shown + punct) if shown else txt, 'f': kept[wi]['out'], 'emph': emph})
            wi += 1
        seg_chunks.append({'seg': sid, 'words': cw, 'start': max(seg['start'], cw[0]['f'] - 2)})
    if wi != len(kept):
        raise SystemExit(f'[{sid}] unused words: {[k["w"] for k in kept[wi:]]}')
    seg_chunks[0]['start'] = seg['start']
    chunks_out += seg_chunks

# chunks run back to back (no caption gaps: the old caption's smear must stay covered)
for a, b in zip(chunks_out, chunks_out[1:]):
    a['end'] = b['start']
chunks_out[-1]['end'] = out

total_speech = out
total = out + END_CARD_FRAMES

# ---- zoom plan: one value per piece (punch-ins hide the two jump cuts) -------
PIECE_ZOOM = {('under', 0): 1.0, ('under', 1): 1.16, ('under', 2): 1.32}
frame_rows = []
for k, fr in enumerate(frames):
    z = PIECE_ZOOM.get((fr['seg'], fr['piece']), 1.0)
    frame_rows.append([fr['src'], shot_of(fr['src']), cover_box(fr['src']), z])

data = {
    'fps': FPS,
    'width': 1080,
    'height': 1920,
    'srcWidth': 720,
    'srcHeight': 1280,
    'totalFrames': total,
    'speechFrames': total_speech,
    'endCardStart': total_speech,
    'segments': segments,
    'chunks': chunks_out,
    # per output frame: [srcFrame, shotIndex, origCaptionBox|null, zoom]
    'frames': frame_rows,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(data, open(OUT, 'w'), separators=(',', ':'))
print(f'total {total} frames ({total / FPS:.2f}s), speech {total_speech}, chunks {len(chunks_out)}')
for s in segments:
    print(f"  {s['id']:<8} {s['start']:4d}-{s['end']:4d}  ({(s['end'] - s['start']) / FPS:.2f}s)")
for c in chunks_out:
    print(f"    {c['start']:4d}-{c['end']:4d} " + ' '.join(('*' if w['emph'] else '') + w['w'] + f"@{w['f']}" for w in c['words']))
