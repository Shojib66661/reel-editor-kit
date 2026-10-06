"""SFX cue sheet keyed to words (same beats as AtticVents.tsx) -> scripts/analysis/cues.json.

Kept subtle per the audio rules: key moments only, ~1 every 3 s.
usage: python3 scripts/cues.py
"""
import json, os, re

HERE = os.path.dirname(__file__)
TL = json.load(open(os.path.join(HERE, '..', 'src', 'data', 'timeline.json')))
FPS = TL['fps']
norm = lambda t: re.sub(r"[^a-z0-9']", '', t.lower())


def W(seg, word, nth=0):
    n = 0
    for c in TL['chunks']:
        if c['seg'] != seg:
            continue
        for w in c['words']:
            if norm(w['w']) == norm(word):
                if n == nth:
                    return w['f']
                n += 1
    raise SystemExit(f'no {word} in {seg}')


seg = {s['id']: s for s in TL['segments']}
end = TL['endCardStart']
SFX = 'public/sfx/'
CUES = [
    (0, 'impact-low', -3),                       # hook: B&W world + star
    (20, 'swish-card', 0),                       # rotting-wood print slaps on
    (W('myth', 'not.') - 2, 'stamp-thud', 0),    # "the shingles?" crossed out
    (W('under', 'underneath') - 2, 'whoosh-short', 0),
    (W('attic', 'attic'), 'swish-card', 0),      # attic diagram
    (W('damage', 'mold,'), 'pop', 0),            # damage cards
    (W('damage', 'lifespan'), 'pop', 0),
    (W('solar', 'solar'), 'ding', -4),
    (W('hydro', "don't") - 2, 'whoosh-short', 0),
    (W('protect', 'Protect'), 'stamp-thud', 0),  # shield
    (end, 'impact-low', 0),                      # end card
    (end + 4, 'swish-card', 0),
]
out = [{'t': round(f / FPS, 3), 'sfx': os.path.join(HERE, '..', SFX + name + '.wav'), 'gain_db': g} for f, name, g in CUES]
json.dump(out, open(os.path.join(HERE, 'analysis', 'cues.json'), 'w'), indent=1)
for c, (f, name, g) in zip(out, CUES):
    print(f"{c['t']:6.2f}s  f{f:4d}  {name} {g:+d} dB")
