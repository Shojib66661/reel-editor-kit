# High Profile Ridge: paper-cut reel (Remotion)

This repo is a complete re-edit of the High Performance Roofing "High Profile Ridge" reel
(Frisco job, 84 s) into a 60 s, 1080×1920 paper-cut / mixed-media reel, built in
[Remotion](https://remotion.dev).

**Final render:** `renders/high-profile-ridge-papercut.mp4`

## What the edit does

| | Original | This edit |
|---|---|---|
| Length | 84 s (incl. 12 s end card) | 60 s (55 s talk + 5 s CTA) |
| Opening | "Hey Texas…" | Cold open on the pain point: *"Every handful of years you're having to replace your roof… it's just not making sense anymore to use a standard roofing system."* in a B&W world with her as a colour paper sticker, plus a ransom-note hook title: **STOP RE-ROOFING EVERY FEW YEARS** |
| Structure | Linear talk with repeats | Re-ordered: hook → intro → product → why it looks better → longevity → deductibles + *industry is changing* → Texas Proof system → free consultation → call. Repeats, false starts and dead air removed (about 30 jump cuts, hidden with punch-in zooms) |
| Captions | Burned-in white/blue captions | Hidden under new torn-paper caption strips (word-by-word karaoke, emphasised words on yellow/blue scraps or serif italic) |
| Split screens | Hard split B-roll / talking head | Rebuilt as a photo collage on kraft paper (taped torn prints), with marker notes |
| Graphics | — | Texas map with Frisco pin, Texas Proof Roof seal, ridge-cap explainer (standard vs high profile), rising deductibles chart, industry/insurance checklist, stamps, HP logo card, phone strip |
| Audio | Voice + music bed | Voice isolated from the old music (UVR MDX-Net), new generated music bed, paper foley (rips, swishes, snips, marker, stamps) |
| End card | Generic CTA | Paper-cut CTA: logo, UPGRADE YOUR ROOF, FREE CONSULTATION, (214) 396-7772, hprtexas.com, her as a sticker |

### How the old captions are hidden
`scripts/caption_detect.py` finds the burned-in caption on every source frame (white/blue
glyphs with a dark halo) and `scripts/build_timeline.py` stores that box per output frame.
Our caption strip is centred on, and sized to at least, that box (after the zoom
transform), so the original text is always underneath paper. In the split-screen parts the
old caption sat on the seam, which the collage layout crops away.

## Project layout

```
src/
  Root.tsx                 composition + font loading
  HighProfileRidge.tsx     the edit: scenes, beat sheet (graphics keyed to words), sound design
  components/              Paper (torn paper), Caption, Shots (camera, collage), Graphics,
                           Transitions (paper tear), EndCard, Source (frame-accurate source)
  lib/                     timeline helpers, paper helpers (torn clip-paths, stop-motion wobble)
  data/timeline.json       generated: per-frame source frame, layout, old-caption box, zoom; caption chunks
public/
  video/source.mp4         original reel
  video/cutout.webm        person cutout with alpha (u2net_human_seg), for stickers / text-behind
  audio/voice.wav          isolated voice cut to the EDL
  audio/music.mp3          music bed (ElevenLabs Music)
  sfx/                     paper foley (ElevenLabs SFX, stamp synthesised)
scripts/
  edl.py                   cut list, caption chunking, word timing fixes
  build_timeline.py        -> src/data/timeline.json
  build_voice.py           -> public/audio/voice.wav
  caption_detect.py, segment_person.py, align_words.py, make_textures.py
  analysis/                cached analysis (caption boxes, split-screen scores, word timings)
```

## Render

```bash
npm install
npm run studio                       # preview / tweak
npm run render                       # -> out/high-profile-ridge-papercut.mp4
```

If Remotion can't download its Chrome Headless Shell, point it at a local one:
`REMOTION_BROWSER=/path/to/headless_shell npm run render`.

To change cuts or caption wording, edit `scripts/edl.py`, then run
`python3 scripts/build_timeline.py` (and `python3 scripts/build_voice.py <vocals.wav>` if
cut points changed; the vocal stem comes from `audio-separator` with
`UVR-MDX-NET-Voc_FT.onnx` on the source audio).
