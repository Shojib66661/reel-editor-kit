#!/usr/bin/env python3
"""Align a corrected transcript to the zipformer word timings.

usage: python3 tools/align_words.py out.words.json transcript.txt aligned.json
transcript.txt = the clean, corrected text (whisper + your fixes).
Output: [{"w": "Hey", "s": 0.04, "e": 0.40}, ...]. Words the recogniser
missed get interpolated times; spot-check them and fix obvious ones by hand
(see WORD_FIXES in the HPR project's edl.py for the pattern).
"""
import difflib, json, re, sys

Z = json.load(open(sys.argv[1]))
W = open(sys.argv[2]).read().split()
norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower())
a, b = [norm(w) for w in W], [norm(z['w']) for z in Z]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
t = [None] * len(W)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal':
        for k in range(i2 - i1):
            t[i1 + k] = Z[j1 + k]['s']
    elif op == 'replace':
        for k in range(i2 - i1):
            jj = j1 + int(k * (j2 - j1) / (i2 - i1))
            if jj < j2:
                t[i1 + k] = Z[jj]['s']
n = len(W)
for i in range(n):
    if t[i] is None:
        p = i - 1
        while p >= 0 and t[p] is None:
            p -= 1
        q = i + 1
        while q < n and t[q] is None:
            q += 1
        tp = t[p] if p >= 0 else 0.0
        tq = t[q] if q < n else tp + 0.5
        t[i] = tp + (tq - tp) * (i - p) / (q - p)
out = [{'w': w, 's': round(t[i], 2), 'e': round(min(t[i + 1] if i + 1 < n else t[i] + 0.45, t[i] + 0.8), 2)} for i, w in enumerate(W)]
json.dump(out, open(sys.argv[3], 'w'), indent=0)
print(f'aligned {n} words')
