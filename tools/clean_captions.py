"""Remove burned-in captions with TEMPORAL fill (+ spatial inpaint fallback).

The old captions change every few frames, so most pixels under a word are visible
in a nearby frame of the same shot. For every masked pixel we take the median of
the closest unmasked frames (same shot, within +-MAXD frames); pixels never
uncovered, or on the person (--person masks), fall back to cv2.inpaint.

Where to look for captions:
  default        caption_detect.py boxes (capboxes.json) with centre y in --band (needs a dark halo)
  --zones z.json fixed caption zones of their edit: [[t0, t1, [x0, y0, x1, y1]], ...] (seconds).
                 Use this when words sit on bright decking / sky: the detector misses them there.
  --extra e.json coloured words / icons: [[t0, t1, [x0, y0, x1, y1], mode], ...]
                 mode letters: w white glyphs, W raw white (icons), c cyan, o orange/red.
Glyphs inside a zone = white, low-chroma connected components of text size.
Still cover the zone in the edit (opaque caption strip): leftovers survive on bright backgrounds.

usage: clean_captions.py src.mp4 capboxes.json out.mp4 [--shots 0,38,...] [--person masks_s_dir]
       [--zones z.json] [--extra e.json] [--band 670,760] [--png dir --frames a,b]
"""
import cv2, json, subprocess, sys
import numpy as np

src, boxes_p, out = sys.argv[1], sys.argv[2], sys.argv[3]
arg = lambda k: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else None
SHOTS = [int(x) for x in arg('--shots').split(',')] if arg('--shots') else [0]
pngdir = arg('--png')
only = set(int(x) for x in arg('--frames').split(',')) if arg('--frames') else None
MAXD, K = 24, 5
PERSON = arg('--person')  # dir of person masks (%05d.png); body pixels use spatial inpaint

B = json.load(open(boxes_p))
N = len(B)
BAND = [int(x) for x in arg('--band').split(',')] if arg('--band') else [670, 760]
ZONES = json.load(open(arg('--zones'))) if arg('--zones') else None
EXTRA = json.load(open(arg('--extra'))) if arg('--extra') else []
ys_all = [z[2][1] for z in (ZONES or [])] + [e[2][1] for e in EXTRA] + [BAND[0] - 70]
ye_all = [z[2][3] for z in (ZONES or [])] + [e[2][3] for e in EXTRA] + [BAND[1] + 80]
Y0, Y1 = max(0, min(ys_all)), max(ye_all)
band = [[b for b in bs if BAND[0] <= (b[1] + b[3]) / 2 <= BAND[1] and 14 <= b[3] - b[1] <= 70] for bs in B]

cap = cv2.VideoCapture(src)
W, H = int(cap.get(3)), int(cap.get(4))
frames = []
while True:
    ok, fr = cap.read()
    if not ok:
        break
    frames.append(fr)
assert len(frames) == N, (len(frames), N)


def region(f):
    if ZONES is not None:
        t = f / 30
        for t0, t1, box in ZONES:
            if t0 <= t < t1:
                return box
        return None
    c = [b for g in range(max(0, f - 3), min(N, f + 4)) for b in band[g]]
    if not c:
        return None
    return [max(0, min(b[0] for b in c) - 10), max(Y0, min(b[1] for b in c) - 10), min(W, max(b[2] for b in c) + 10), min(Y1, max(b[3] for b in c) + 12)]


def glyphs(roi, mode):
    mn, mx = roi.min(2), roi.max(2)
    b, g, r = roi[..., 0], roi[..., 1], roi[..., 2]
    m = np.zeros(roi.shape[:2], bool)
    if 'w' in mode:
        w = ((mn > 180) & (mx - mn < 50)).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(w, 8)
        ok = np.zeros(n, bool)
        for i in range(1, n):
            x, y, ww, hh, a = st[i]
            ok[i] = hh <= 62 and ww <= 260 and a <= 5200 and a >= 6
        m |= ok[lab]
    if 'W' in mode:  # raw white, no glyph-size filter (icons)
        m |= (mn > 175) & (mx - mn < 60)
    if 'c' in mode:
        m |= (b > 190) & (g > 160) & (r < 140)
    if 'o' in mode:
        m |= (r > 150) & (r - b > 110) & (g < 185) & (b < 110) & (r > g + 40)
    return m.astype(np.uint8)


# per-frame mask of the old caption (glyphs + shadow halo), band rows only
masks = np.zeros((N, Y1 - Y0, W), np.uint8)
for f in range(N):
    regs = []
    r = region(f)
    if r:
        regs.append((r, 'w'))
    regs += [(bx, md) for t0, t1, bx, md in EXTRA if t0 * 30 <= f < t1 * 30]
    for (x0, y0, x1, y1), md in regs:
        roi = frames[f][y0:y1, x0:x1].astype(np.int16)
        g = cv2.dilate(glyphs(roi, md), np.ones((5, 5), np.uint8))
        sh = np.zeros_like(g)
        sh[3:, 3:] = g[:-3, :-3]
        m = cv2.dilate(g | sh, np.ones((15, 15), np.uint8))
        masks[f, y0 - Y0:y1 - Y0, x0:x1] |= m

shot_of = lambda f: max(i for i, s in enumerate(SHOTS) if f >= s)

enc = None
if not only:
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                            '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
for f in range(N):
    fr = frames[f].copy()
    m = masks[f]
    if (only is None or f in only) and m.any():
        sh = shot_of(f)
        cand = [g for g in sorted(range(max(0, f - MAXD), min(N, f + MAXD + 1)), key=lambda g: abs(g - f)) if g != f and shot_of(g) == sh]
        ys, xs = np.nonzero(m)
        vals = np.zeros((len(ys), K, 3), np.float32)
        cnt = np.zeros(len(ys), np.int32)
        for g in cand:
            free = masks[g][ys, xs] == 0
            take = free & (cnt < K)
            if take.any():
                idx = np.nonzero(take)[0]
                vals[idx, cnt[idx]] = frames[g][ys[idx] + Y0, xs[idx]]
                cnt[idx] += 1
            if (cnt >= K).all():
                break
        # temporal samples only for static background: off the person, and samples agree
        sd = np.zeros(len(ys), np.float32)
        for i in range(K):
            pass
        vv = vals.copy()
        for k in range(K):
            vv[cnt <= k, k] = np.nan
        with np.errstate(all='ignore'):
            sd = np.nanmax(np.nanstd(vv, axis=1), axis=1)
        filled = (cnt >= 2) & (sd < 14)
        if PERSON:
            pm = cv2.imread(f'{PERSON}/{f:05d}.png', 0)
            pm = cv2.dilate(pm, np.ones((15, 15), np.uint8))
            filled &= pm[ys + Y0, xs] < 60
        out_band = fr[Y0:Y1].copy()
        if filled.any():
            v = vals[filled]
            c = cnt[filled]
            # median over the available samples
            with np.errstate(all='ignore'):
                med = np.nanmedian(vv[filled], axis=1)
            out_band[ys[filled], xs[filled]] = np.clip(med, 0, 255).astype(np.uint8)
        rest = np.zeros_like(m)
        rest[ys[~filled], xs[~filled]] = 1
        if rest.any():
            out_band = cv2.inpaint(out_band, rest, 7, cv2.INPAINT_NS)
        # soften the seam a little
        edge = cv2.dilate(m, np.ones((3, 3), np.uint8)) - cv2.erode(m, np.ones((3, 3), np.uint8))
        if edge.any():
            bl = cv2.GaussianBlur(out_band, (5, 5), 0)
            out_band[edge > 0] = bl[edge > 0]
        fr[Y0:Y1] = out_band
    if pngdir and (only is None or f in only):
        cv2.imwrite(f'{pngdir}/{f:05d}.png', fr)
    if enc:
        enc.stdin.write(fr.tobytes())
if enc:
    enc.stdin.close()
    enc.wait()
print('done', N)
