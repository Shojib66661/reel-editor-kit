# Style: Paper-cut / mixed media

Proven on: High Performance Roofing "High Profile Ridge" (2026-10). Template:
`templates/remotion-paper-cut/` (full working project; data/media not included).

## Look
- **Materials**: torn paper with a white fibrous rim (clip-path polygons), cream paper and
  kraft board textures (`tools/make_textures.py`), masking tape, marker handwriting, rubber
  stamps, ransom-note letters (each letter on a different scrap).
- **Motion**: stop-motion feel. Wobble changes only every 3-4 frames (`wob()`), pop-ins
  are stepped (0.35 → 0.8 → 1.12 → 1.04 → 1), marker strokes draw on twos.
- **People**: cutout "sticker" (white 5 px outline via stacked hard drop-shadows) over a
  B&W / desaturated world for the hook; text placed *behind* the person for the
  "Texas" moment.
- **Fonts** (local woff2 via `@remotion/fonts`): Anton (captions/blocks), Archivo Black,
  DM Serif Display Italic (accent words), Permanent Marker (handwritten notes).
- **Colours**: the client's brand (HPR: blue #1d5fd1, navy #0b2a5b, yellow #ffc72c) plus
  paper neutrals; red #e0402a only for "wrong / old way" stamps and X marks.

## Building blocks (template components)
- `CaptionCard`: torn cream strip sized to cover the *original* caption box (union of
  boxes over ±6 frames + padding, so 2-3 line captions stay hidden), words karaoke-lit,
  emphasised words on yellow/blue scraps or in serif italic. **The strip is full size
  from frame 0. Only the text pops**, otherwise the old caption flashes.
- `Collage`: rebuilds split-screen (B-roll over talking head) as two taped torn photo
  prints on kraft; crops away the old caption on the seam; freezes the B-roll panel
  while the original editor's panel animates in/out.
- `RansomTitle`, `SealBadge`, `Stamp`, `MarkerStroke`, `MarkerNote`, `TexasMap`,
  `RidgeExplainer`, `RisingBars`, `Checklist`, `LogoCard`, `PhoneStrip`, `PaperTear`
  transition, `EndCard`.
- Beat sheet in `HighProfileRidge.tsx`: every graphic is keyed to the **word** that
  triggers it (`wordFrame(seg, word)`), so re-cuts don't break timing.

## Structure that worked
cold-open hook (strongest pain-point line, B&W + sticker + ransom title) → paper-tear →
intro → product → explanation with a diagram → proof → stakes (deductibles, industry
changing) → offer → CTA → 5 s paper-cut end card (logo, headline, offer stamp, phone,
site, person as sticker).
