#!/usr/bin/env python3
"""Final audio mix: voice on top, music ducked gently, SFX tucked under.

Rules (see docs/AUDIO_RULES.md):
  - Voice is the reference. Everything else is set RELATIVE to it.
  - Music while talking: VOICE - 19 LU. Music only rises in real pauses
    (>= --min-gap s, default 1.2 s), never inside a sentence. Ramps are slow
    (0.7 s up, 0.4 s down) so the bed never "pumps".
  - Music before the first word / after the last word: VOICE - 9 LU (end card
    can be louder with --outro-db).
  - SFX: loudest 100 ms of each SFX sits at VOICE - 12 dB; another -3 dB if it
    lands on speech. Library SFX are pre-normalised by sfx_add.py.
  - Master: -14 LUFS integrated, -1 dBTP (Instagram/TikTok/Shorts).

Usage:
  python3 mix_audio.py --voice voice.wav --music music.mp3 --cues cues.json \
      --out mix.wav [--envelope music_gain.json --fps 30] [--duration 60.13]

cues.json: [{"t": 1.23, "sfx": "paper/rip-short", "gain_db": 0}, ...]
           "sfx" is a library id (resolved under --sfx-root) or a file path.
--envelope writes the per-frame music gain (linear) so a Remotion
<Audio volume={(f) => env[f]}> can use exactly the same ducking.
"""
import argparse, json, os, subprocess
import numpy as np
import pyloudnorm as pyln

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(path, ch=1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).copy()
    return x.reshape(-1, ch) if ch > 1 else x


def speech_regions(voice, min_gap):
    """Speech segments from the voice stem. Gaps shorter than min_gap are
    treated as part of the sentence (music stays down)."""
    hop = int(0.01 * SR)
    n = len(voice) // hop
    rms = np.sqrt(np.mean(voice[:n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    dbv = 20 * np.log10(rms)
    floor = np.percentile(dbv, 10)
    thr = max(floor + 10, np.percentile(dbv, 60) - 25, -55)
    on = dbv > thr
    # smooth: fill 80 ms holes, drop blips < 60 ms
    regs, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            regs.append([i, j])
            i = j
        else:
            i += 1
    merged = []
    for a, b in regs:
        if merged and (a - merged[-1][1]) * 0.01 < min_gap:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    merged = [r for r in merged if (r[1] - r[0]) * 0.01 >= 0.06]
    return [(a * 0.01, b * 0.01) for a, b in merged]


def music_gain_curve(total, regions, talk_db, gap_db, intro_db, outro_db, up=0.7, down=0.4, lag=0.2, lead=0.15):
    """Music gain (dB, relative) every 10 ms.

    target = talk level from (word start - lead) to (word end + lag), else the
    pause/intro/outro level. Gaps too short for a full up+down ramp stay at
    talk level (no half-way bumps). Then two slew passes: forward limits how
    fast it RISES (up s), backward limits how fast it FALLS (down s), which
    makes the fall finish before the next word instead of after it.
    """
    dt = 0.01
    t = np.arange(int(total / dt)) * dt
    tgt = np.full_like(t, gap_db)
    if regions:
        tgt[t < regions[0][0]] = intro_db
        tgt[t >= regions[-1][1]] = outro_db
        for a, b in regions:
            tgt[(t >= a - lead) & (t < b + lag)] = talk_db
        for (a0, b0), (a1, b1) in zip(regions, regions[1:]):
            if a1 - b0 < lag + up + down + lead + 0.2:
                tgt[(t >= b0) & (t < a1)] = talk_db
    out = tgt.copy()
    hi = max(gap_db, intro_db, outro_db)
    ur = (hi - talk_db) / up * dt
    dr = (hi - talk_db) / down * dt
    for i in range(1, len(out)):
        out[i] = min(out[i], out[i - 1] + ur)
    for i in range(len(out) - 2, -1, -1):
        out[i] = min(out[i], out[i + 1] + dr)
    return t, out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voice', required=True)
    ap.add_argument('--music')
    ap.add_argument('--cues')
    ap.add_argument('--out', required=True)
    ap.add_argument('--sfx-root', default=ROOT)
    ap.add_argument('--duration', type=float, default=None, help='total length (s); default = voice length')
    ap.add_argument('--min-gap', type=float, default=1.2, help='pause length that lets music rise')
    ap.add_argument('--talk-db', type=float, default=-19, help='music under speech, LU relative to voice')
    ap.add_argument('--gap-db', type=float, default=-9, help='music in pauses, LU relative to voice')
    ap.add_argument('--intro-db', type=float, default=-9)
    ap.add_argument('--outro-db', type=float, default=-6)
    ap.add_argument('--sfx-db', type=float, default=-12, help='SFX punch relative to voice level')
    ap.add_argument('--target-lufs', type=float, default=-14)
    ap.add_argument('--envelope', help='write per-frame music gain JSON for Remotion')
    ap.add_argument('--fps', type=float, default=30)
    a = ap.parse_args()

    meter = pyln.Meter(SR)
    voice = load(a.voice)
    total = a.duration or len(voice) / SR
    N = int(total * SR)
    voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
    regions = speech_regions(voice, a.min_gap)
    v_lufs = meter.integrated_loudness(voice[: max(len(voice), SR)])
    print(f'voice {v_lufs:.1f} LUFS, {len(regions)} speech regions')

    mix = np.stack([voice, voice], axis=1).astype(np.float64)

    if a.music:
        mus = load(a.music, 2)
        if len(mus) < N:
            reps = int(np.ceil(N / len(mus)))
            mus = np.tile(mus, (reps, 1))
        mus = mus[:N]
        m_lufs = meter.integrated_loudness(mus)
        base = v_lufs - m_lufs  # dB that puts music at voice loudness
        t, gdb = music_gain_curve(total, regions, a.talk_db, a.gap_db, a.intro_db, a.outro_db)
        gdb = gdb + base
        # tail fade-out over the last 0.6 s
        fade = t > total - 0.6
        gdb[fade] += 20 * np.log10(np.clip((total - t[fade]) / 0.6, 1e-3, 1))
        lin = 10 ** (np.interp(np.arange(N) / SR, t, gdb) / 20)
        mix += mus * lin[:, None]
        if a.envelope:
            frames = int(round(total * a.fps))
            env = [round(float(10 ** (np.interp(f / a.fps, t, gdb) / 20)), 4) for f in range(frames)]
            json.dump({'fps': a.fps, 'gain': env, 'note': 'linear gain for the music track, already relative to its own level'},
                      open(a.envelope, 'w'))

    if a.cues:
        cues = json.load(open(a.cues))
        for c in cues:
            path = c['sfx']
            if not os.path.exists(path):
                path = os.path.join(a.sfx_root, 'sfx', f"{c['sfx']}.wav")
            s = load(path)
            w = int(0.1 * SR)
            cs = np.cumsum(np.concatenate([[0], s.astype(np.float64) ** 2]))
            punch = np.sqrt(np.max((cs[w:] - cs[:-w]) / w)) if len(s) > w else np.sqrt(np.mean(s ** 2))
            # voice "punch" reference: loudness of speech regions in short-term terms
            target_db = v_lufs + a.sfx_db + c.get('gain_db', 0)
            on_speech = any(r0 <= c['t'] <= r1 for r0, r1 in regions)
            if on_speech:
                target_db -= 3
            g = 10 ** ((target_db - 20 * np.log10(punch + 1e-9)) / 20)
            i0 = int(c['t'] * SR)
            seg = s[: max(0, N - i0)] * g
            mix[i0:i0 + len(seg)] += seg[:, None]

    # master: bring to ~target, then ffmpeg loudnorm handles true-peak (-1 dBTP)
    m = meter.integrated_loudness(mix)
    mix *= 10 ** ((a.target_lufs - m) / 20)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
                    '-af', f'loudnorm=I={a.target_lufs}:TP=-1.0:LRA=11', '-ar', str(SR), a.out],
                   input=mix.astype(np.float32).tobytes(), check=True)
    print(f'wrote {a.out}')


if __name__ == '__main__':
    main()
