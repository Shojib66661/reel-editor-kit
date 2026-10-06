# Template: mixed-media reel (Remotion)

Working project from the 4SEASONS "attic / solar vents" reel (2026-10-06). Media and
`src/data/timeline.json` are not included; regenerate them for a new video.
Style guide: [`docs/STYLE_MIXED_MEDIA.md`](../../docs/STYLE_MIXED_MEDIA.md).

## Start a new video
1. Copy this folder into the working repo, `npm install`.
2. `public/video/source.mp4` = the CLEANED source (see step 4), `public/video/cutout.webm` = person cutout rebuilt from it.
3. `python3 scripts/capscan.py orig.mp4 scripts/analysis/capboxes.json`; tune the band in
   `clean_captions.py` / `build_timeline.py` (y 670-760 was this video's caption strip).
4. `python3 scripts/clean_captions.py orig.mp4 scripts/analysis/capboxes.json public/video/source.mp4 --shots <scene cuts> --person <masks_s dir>`
5. Transcribe + align (kit `tools/`), put `words.json` + `vocals.wav` in `scripts/analysis/`.
6. Edit `scripts/edl.py` (segments in SOURCE FRAMES, SHOTS, CHUNKS with `*hero*` words, DISPLAY fixes).
7. `python3 scripts/build_timeline.py && python3 scripts/build_voice.py scripts/analysis/vocals.wav && python3 scripts/cues.py`
8. Rewrite the beat sheet / `BW` moments in `src/AtticVents.tsx` (rename the composition), brand colours in `src/lib/brand.ts`, logo in `components/Logo.tsx`.
9. Stills: `OUTDIR=out/stills node scripts/stills.mjs 0 120 ...`; render `--muted`, mix with `tools/mix_audio.py`, mux.
