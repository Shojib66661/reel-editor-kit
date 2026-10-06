# Style: Mixed media (cutout sticker + words behind)

Proven on: 4SEASONS Solar Powered Vents (@4seasonsvents) attic reel (2026-10). Template:
`templates/remotion-mixed-media/`. Reference the user liked: an "invideo" mixed-media ad
(B&W subject cutout with a thick red outline, red star, giant serif words behind her,
mixed sans + serif captions, small doodle stickers).

## Look
- **B&W world, colour person**: on 2-3 key talking-head beats, the background goes
  grayscale (contrast 1.3) and the person is drawn again on top from `cutout.webm` with a thick
  **brand-colour outline** (stacked hard drop-shadows, `outline()` in `lib/brand.ts`).
- **Words behind the person**: giant italic serif (Playfair Display 800 italic) in the
  bright brand colour with a hard navy offset shadow, placed over the head/shoulders so
  the cutout overlaps it. Letters slap on one per frame. The caption hides that hero word
  while it's behind him.
- **Star burst** (10 points, brand dark colour, lime outline) behind the person on the hook.
- **Captions**: white Montserrat 800 (76 px) + one hero word in italic serif (140 px, lime).
  Upcoming words show at 42% opacity and pop when spoken (also keeps the cleaned caption
  strip covered). Light dark glow behind the strip.
- **Stickers**: flat SVG doodles with a white 6 px outline and stop-motion wobble (changes
  every 4 frames): house with a thought bubble, sun with a face, heat lines, damage cards
  (icon + label), crossed-out tags, shield with the brand mark, taped photo prints.
- **Finish**: film grain overlay (opacity 0.2) + soft vignette. Hard cuts; a 2-frame brand
  flash into the end card.
- **Colours**: the client's brand only (4SEASONS: navy #0b2642, lime #aacd4f / #c8ec62 for
  text), plus heat orange #ff8a3d, water blue #5fb8ff and warning red #e2483d for icons.

## Structure that worked (27 s)
hook B&W + star + "Rotting" behind him → myth ("the shingles?" tag, crossed out on "not") →
B&W "underneath" behind him → attic diagram (heat waves on "heat", drops on "moisture") →
3 damage cards keyed to "mold / wood / lifespan" → sun on "solar" → heat lines out of the vent
→ B&W "hydro bill" behind him + bill sticker crossed out → shield on "protect" → logo card
slides in → 2.8 s end card from the bio only.
