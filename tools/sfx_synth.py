#!/usr/bin/env python3
"""Synthesise free starter SFX (no credits) and add them to the library.

Run once:  python3 tools/sfx_synth.py
Each sound is generated, written to a temp wav, then passed through
sfx_add.py so it gets the same trimming / normalising as every other SFX.
"""
import os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(11)


def t(d):
    return np.arange(int(d * SR)) / SR


def band_noise(n, lo, hi):
    F = np.fft.rfft(rng.normal(0, 1, n))
    f = np.fft.rfftfreq(n, 1 / SR)
    F[(f < lo) | (f > hi)] = 0
    x = np.fft.irfft(F, n)
    return x / (np.abs(x).max() + 1e-9)


def sweep_noise(d, f0, f1, q=0.35):
    """Noise through a moving band-pass (crude whoosh)."""
    n = int(d * SR)
    hop = 512
    out = np.zeros(n)
    for i in range(0, n, hop):
        k = i / n
        fc = f0 * (f1 / f0) ** k
        seg = band_noise(hop * 4, fc * (1 - q), fc * (1 + q))[:hop]
        out[i:i + hop] = seg[: len(out[i:i + hop])]
    return out


def env_ad(n, a, d_curve=4.0):
    x = np.linspace(0, 1, n)
    att = int(a * n)
    e = np.ones(n)
    e[:att] = np.linspace(0, 1, att) if att else 1
    e[att:] = np.exp(-d_curve * np.linspace(0, 1, n - att))
    return e


SOUNDS = {
    'transition/whoosh-short': (lambda: sweep_noise(0.45, 400, 3500) * np.sin(np.linspace(0, np.pi, int(0.45 * SR))) ** 2,
                                'whoosh,swipe,transition,fast'),
    'transition/whoosh-long': (lambda: sweep_noise(1.1, 250, 4000) * np.sin(np.linspace(0, np.pi, int(1.1 * SR))) ** 1.5,
                               'whoosh,transition,slow'),
    'transition/riser-short': (lambda: (sweep_noise(1.6, 300, 6000) * 0.6 + np.sin(2 * np.pi * np.cumsum(np.linspace(180, 900, int(1.6 * SR))) / SR) * 0.4)
                               * np.linspace(0.05, 1, int(1.6 * SR)) ** 2, 'riser,build,tension,before-reveal'),
    'transition/impact-low': (lambda: np.sin(2 * np.pi * (70 * np.exp(-t(0.9) * 5) + 38) * t(0.9)) * env_ad(int(0.9 * SR), 0.004, 5)
                              + band_noise(int(0.9 * SR), 80, 2500) * env_ad(int(0.9 * SR), 0.002, 30) * 0.4,
                              'impact,hit,boom,reveal,title'),
    'ui/pop': (lambda: np.sin(2 * np.pi * (900 * np.exp(-t(0.12) * 25) + 300) * t(0.12)) * env_ad(int(0.12 * SR), 0.01, 7),
               'pop,bubble,appear,sticker,caption'),
    'ui/click': (lambda: band_noise(int(0.03 * SR), 2000, 9000) * env_ad(int(0.03 * SR), 0.0, 25), 'click,tap,ui,select'),
    'ui/ding': (lambda: sum(np.sin(2 * np.pi * f * t(1.4)) * w for f, w in [(1318.5, 1), (2637, 0.35), (3955, 0.12)])
                * env_ad(int(1.4 * SR), 0.003, 4.5), 'ding,bell,notification,correct,check'),
}


def main():
    for sid, (fn, tags) in SOUNDS.items():
        y = fn().astype(np.float32)
        y /= np.abs(y).max() + 1e-9
        cat, name = sid.split('/')
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            sf.write(f.name, y, SR)
            subprocess.run([sys.executable, os.path.join(HERE, 'sfx_add.py'), f.name, '--category', cat, '--name', name,
                            '--tags', tags, '--source', 'synth', '--prompt', 'tools/sfx_synth.py', '--force'], check=True)


if __name__ == '__main__':
    main()
