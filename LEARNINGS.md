# Learnings log (append newest at the top)

## 2026-10-06: Ruff Roofing (@ruff_roofing), mixed-media (third project)
- **caption_detect needs a dark halo**: it missed most words on bright decking and sky, and the
  first clean left whole captions. Fix: `clean_captions.py --zones` (fixed caption zones of their
  edit, glyphs = white low-chroma components of text size) + `--extra` for coloured words (orange
  WATER DAMAGE / SHEETROCK, cyan names, icons). Even then letters merge with white clouds / sunlit
  plywood, so the new captions sit on an **opaque ink tape strip that always covers the zone**.
- The cleaner also wiped the small logo on his shirt (it sits in the caption zone). Hidden under the
  strip in the video, but build stickers (end-card cutout) from an **untouched original frame**
  before any caption appears.
- Their editor's overlays were busy: logo sticker that drops in from the top, photo insets, counter,
  a text-message bubble. The 1.5 s contact sheet missed the 1.3 s bubble; the render's QA sheet
  caught it. New `tools/overlay_scan.py` lists every bright-overlay window frame by frame: run it in
  step 1. Cover each one with our own version (kraft "Board" with their photos re-taped, logo card,
  bubble sticker), keyed to SOURCE frames so re-cuts don't break the cover.
- A cover card that overlaps the speaker's face: draw his cutout on top of the card (logo "behind"
  him), only while it overlaps; afterwards the cutout dragged in a piece of their logo (dog tail).
- Spaces inside letter-by-letter titles collapse with `inline-block` spans: render ' ' as U+00A0.
- `clip-path` torn edges in px break when the element size is unknown: `tornPct()` (points in %,
  jag in px via calc()).
- Hook cut-ins: zipformer word starts were 0.1-0.2 s off at both hook edges ("you see we have",
  "right? We have"). Verify each cut point by transcribing 1 s pieces (and 1 s padding) before building.
- User preferences learned: keeps meaningful lines even if long (kept "to make sure that you don't
  have any problems in the future"); picks the recommended cold open; no name in DM when the speaker
  isn't clearly the account owner; offers only when the exact wording is confirmed.

## 2026-10-06: 4SEASONS Solar Powered Vents, mixed-media (second project)
- **Remove burned-in captions instead of covering them** when they are thin (one word per
  frame): `tools/clean_captions.py` = temporal fill (median of nearby frames where that pixel
  wasn't under a word, same shot) for the background + spatial inpaint on the person (person
  masks decide). Pure `cv2.inpaint` left a visible smear; pure temporal fill tore on moving hands.
  Captions no longer need opaque boxes, so styles like the mixed-media reference work.
- Keep the new caption on the old caption strip and show upcoming words dimmed (42%), not
  hidden: hidden-but-reserved words left the leftover blur visible between words.
- A strong dark glow behind captions looked like a dirty patch on the speaker's shirt. Fix the
  source first, then keep the glow light.
- Leak scan: our new captions are also white bold text, so scanning the final render flags
  them. Scan the cleaned source instead (every video layer is built from it); the detector also
  fires on blue shirts and white objects, so look at a contact sheet of the hits.
- Rebuild `cutout.webm` from the CLEANED source (masks are reusable), or old captions come
  back on the sticker layer.
- `setup.sh` was missing `audioread` (audio-separator import error). Added. If `~/kit` already
  exists as a directory, `ln -sfn` puts the link inside it; check before running setup.
- The client's site/linktree were blocked (403) from the sandbox, so the logo was redrawn as
  SVG from the profile picture + the wordmark sticker in their video.
- The original edit was already tight (7 pauses > 0.1 s in 26.7 s), so the 25-35 % cut rule
  didn't apply: cut 2 pauses + an off-brand closing line, and started the CTA over the last line.
- Speaker in a brand's video can be a partner contractor (other company's logo on his shirt):
  ask before keeping his "follow us" line.
- User preferences learned: picks "best and right" badges when unsure (use only his words or
  the bio; skip anything ambiguous like "Made in CA"); no name in DM when unknown.

## 2026-10-06: High Performance Roofing, paper-cut (first project)
- Model hosts (HF, openaipublic, fbaipublicfiles) are blocked → use GitHub-release models (`tools/setup.sh`).
- Remotion `<Freeze>` is clamped to composition length → offset with `startFrom` (template `Source.tsx`).
- Caption covers must use the union of the original caption's boxes over ±6 frames; the
  original editor animates multi-line captions line by line. Cluster caption lines by
  chaining line-to-line (not to the first line) or 3-line captions lose their last line.
- Caption strip must be full size from frame 0 (only the text pops) or the old caption flashes.
- Always run the caption-leak scan on the final render; it caught 6 leaks the eye missed.
- Separating vocals before cutting makes jump cuts invisible and lets you replace the music.
- Re-transcribe each cut piece to catch clipped words (zipformer word times can be off by 0.2-0.5 s).
- 44 MB uploads to chat fail (502); 14 MB preview works. Clients can't open private GitHub links.
- ElevenLabs: 4 variations by default = 4× credits. Use generations_count 1 for SFX. One stamp SFX came back silent.
- User preferences learned: subtle SFX, voice on top, no pumping ducking, ask before
  re-ordering, ask on unclear claims, no editor branding, casual DM as @harun.motion.
