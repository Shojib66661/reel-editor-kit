"""Cuts the isolated vocal stem to the EDL and writes public/audio/voice.wav.

The vocal stem comes from UVR-MDX-NET-Voc_FT (audio-separator) run on the
source audio, so the original background music is gone and we can lay our
own bed under the jump cuts without the music "skipping".
"""
import json, os, subprocess, sys
import numpy as np, wave
from edl import FPS, SEGMENTS

HERE = os.path.dirname(__file__)
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'analysis', 'vocals.wav')
dst = os.path.join(HERE, '..', 'public', 'audio', 'voice.wav')
SR = 48000

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR),
                      '-af', 'highpass=f=85,lowpass=f=15000,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3dB',
                      '-f', 's16le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768

fade = int(0.008 * SR)
ramp = np.linspace(0, 1, fade, dtype=np.float32)
parts = []
for _, pieces in SEGMENTS:
    for i, o in pieces:
        fi, fo = round(i * FPS), round(o * FPS)
        x = a[int(fi / FPS * SR):int(fo / FPS * SR)].copy()
        x[:fade] *= ramp
        x[-fade:] *= ramp[::-1]
        parts.append(x)
y = np.concatenate(parts)
peak = np.max(np.abs(y))
y = y / peak * 0.89  # -1 dBFS peak; final loudness is set at mixdown
os.makedirs(os.path.dirname(dst), exist_ok=True)
with wave.open(dst, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((y * 32767).astype(np.int16).tobytes())
print(f'voice.wav {len(y) / SR:.2f}s')
