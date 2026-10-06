"""Procedural paper textures for the paper-cut look (cream paper, kraft board, grain overlay)."""
import numpy as np, cv2, os
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'img')

def fbm(h, w, octaves=5, base=8):
    acc = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        s = base * 2 ** o
        n = rng.random((s * h // w + 2, s + 2)).astype(np.float32)
        acc += cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC) * amp
        tot += amp; amp *= 0.5
    return acc / tot

def fibers(h, w, n=900, color=0.0):
    m = np.zeros((h, w), np.float32)
    for _ in range(n):
        x, y = rng.integers(0, w), rng.integers(0, h)
        L = rng.integers(6, 40); a = rng.random() * np.pi
        x2, y2 = int(x + np.cos(a) * L), int(y + np.sin(a) * L)
        cv2.line(m, (x, y), (x2, y2), float(rng.uniform(0.3, 1.0)), 1, cv2.LINE_AA)
    return cv2.GaussianBlur(m, (0, 0), 0.6)

def paper(h, w, rgb, var=18, fib=0.06, grain=6):
    base = np.array(rgb[::-1], np.float32)[None, None, :]
    f = fbm(h, w) - 0.5
    g = rng.normal(0, 1, (h, w)).astype(np.float32)
    img = base + f[..., None] * var + g[..., None] * grain - fibers(h, w)[..., None] * 255 * fib
    return np.clip(img, 0, 255).astype(np.uint8)

cv2.imwrite(f'{OUT}/paper-cream.jpg', paper(1920, 1080, (244, 236, 221)), [cv2.IMWRITE_JPEG_QUALITY, 90])
cv2.imwrite(f'{OUT}/kraft.jpg', paper(1920, 1080, (196, 160, 116), var=30, fib=0.12, grain=8), [cv2.IMWRITE_JPEG_QUALITY, 90])

# grain overlay: mid-grey noise used with mix-blend-mode overlay
gr = np.clip(128 + rng.normal(0, 22, (1920, 1080)) + (fbm(1920, 1080, base=16) - 0.5) * 40, 0, 255).astype(np.uint8)
cv2.imwrite(f'{OUT}/grain.png', gr)
print('ok')
