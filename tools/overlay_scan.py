#!/usr/bin/env python3
"""Find the original editor's big bright overlays (logo stickers, photo insets, counters,
text-message bubbles) frame by frame, so nothing slips between contact-sheet tiles.

Prints time windows where a large near-white, low-chroma blob is on screen, with its box.
Real white things (pillars, clouds, a white truck) show up too: look at a frame of each window.
On Ruff Roofing a 1.3 s "Can someone come check my roof?" bubble fell between the 1.5 s
contact-sheet tiles and was only caught on the render's QA sheet.

usage: python3 tools/overlay_scan.py video.mp4 [--y 200,1150] [--min-area 2500] [--end 51.5]
"""
import sys
import cv2
import numpy as np

src = sys.argv[1]
arg = lambda k, d: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
y0, y1 = [int(v) for v in arg('--y', '200,1150').split(',')]
min_area = int(arg('--min-area', '2500'))
end = float(arg('--end', '1e9'))

cap = cv2.VideoCapture(src)
fps = cap.get(5) or 30
f = 0
win = None  # [start, last, union box]


def flush():
    if win:
        s, e, b = win
        print(f'{s / fps:6.2f}-{(e + 1) / fps:6.2f}s  box x{b[0]}-{b[2]} y{b[1]}-{b[3]}')


while True:
    ok, fr = cap.read()
    if not ok or f / fps >= end:
        break
    x = fr[y0:y1].astype(np.int16)
    mn, mx = x.min(2), x.max(2)
    w = cv2.morphologyEx(((mn > 225) & (mx - mn < 20)).astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, _, st, _ = cv2.connectedComponentsWithStats(w)
    big = [s for s in st[1:] if s[4] > min_area]
    if big:
        b = [min(s[0] for s in big), min(s[1] for s in big) + y0, max(s[0] + s[2] for s in big), max(s[1] + s[3] for s in big) + y0]
        if win and f - win[1] <= 3:
            win[1] = f
            win[2] = [min(win[2][0], b[0]), min(win[2][1], b[1]), max(win[2][2], b[2]), max(win[2][3], b[3])]
        else:
            flush()
            win = [f, f, b]
    f += 1
flush()
