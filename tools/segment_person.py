#!/usr/bin/env python3
"""Person cutout for every frame -> RGBA VP9 webm (for sticker / text-behind effects).

usage: python3 tools/segment_person.py input.mp4 outdir [--max-frames N]
Writes outdir/masks/%05d.png (raw), outdir/masks_s/%05d.png (smoothed) and
outdir/cutout.webm (yuva420p, use <OffthreadVideo transparent>).
Speed: ~2 frames/s on 4 CPUs at 720x1280 (u2net_human_seg, 320x320 input).
Masks are only meaningful on full-frame talking-head shots.
"""
import os, subprocess, sys
import cv2
import numpy as np
import onnxruntime as ort

M = os.environ.get('MODELS_DIR', os.path.expanduser('~/models'))
src, outdir = sys.argv[1], sys.argv[2]
maxf = int(sys.argv[sys.argv.index('--max-frames') + 1]) if '--max-frames' in sys.argv else 10 ** 9
raw_dir, sm_dir = os.path.join(outdir, 'masks'), os.path.join(outdir, 'masks_s')
os.makedirs(raw_dir, exist_ok=True); os.makedirs(sm_dir, exist_ok=True)

sess = ort.InferenceSession(f'{M}/u2net_human_seg.onnx', providers=['CPUExecutionProvider'])
inp = sess.get_inputs()[0].name
mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
cap = cv2.VideoCapture(src)
W, H = int(cap.get(3)), int(cap.get(4))
n = 0
while n < maxf:
    ok, fr = cap.read()
    if not ok:
        break
    p = f'{raw_dir}/{n:05d}.png'
    if not os.path.exists(p):
        im = cv2.cvtColor(cv2.resize(fr, (320, 320), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB).astype(np.float32)
        im = (im / im.max() - mean) / std
        o = sess.run(None, {inp: im.transpose(2, 0, 1)[None].astype(np.float32)})[0][0, 0]
        o = (o - o.min()) / (o.max() - o.min() + 1e-8)
        cv2.imwrite(p, (cv2.resize(o, (W, H)) * 255).astype(np.uint8))
    n += 1
    if n % 100 == 0:
        print(n, flush=True)

get = lambda i: cv2.imread(f'{raw_dir}/{min(max(i, 0), n - 1):05d}.png', 0).astype(np.float32) / 255
for i in range(n):
    m = get(i - 1) * 0.25 + get(i) * 0.5 + get(i + 1) * 0.25  # temporal smoothing
    m = np.clip((m - 0.35) / 0.3, 0, 1); m = m * m * (3 - 2 * m)   # firm edge
    m = cv2.GaussianBlur(m, (0, 0), 1.0)
    cv2.imwrite(f'{sm_dir}/{i:05d}.png', (m * 255).astype(np.uint8))

subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-framerate', str(cap.get(5) or 30), '-i', f'{sm_dir}/%05d.png',
                '-filter_complex', f'[0:v]trim=end_frame={n},setpts=PTS-STARTPTS,format=rgba[v];[1:v]format=gray[m];[v][m]alphamerge,format=yuva420p',
                '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '32', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '5', '-an',
                os.path.join(outdir, 'cutout.webm')], check=True)
print('wrote', os.path.join(outdir, 'cutout.webm'))
