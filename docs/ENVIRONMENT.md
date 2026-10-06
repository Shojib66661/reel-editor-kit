# Environment notes (Claude Code cloud sandbox)

Things that cost time on the first project. Read before starting.

## Network
| Works | Blocked (403) |
|---|---|
| github.com + release downloads, PyPI, npm, storage.googleapis.com (ElevenLabs result URLs) | huggingface.co, hf-mirror, openaipublic (Whisper weights), dl.fbaipublicfiles (Demucs), alphacephei (Vosk), modelscope, **remotion.media** (Remotion's Chrome download) |

So use the models in `tools/setup.sh` (all from GitHub releases).

## Remotion
- Remotion can't download its Chrome Headless Shell. Use the preinstalled one:
  `export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
  (the template's `remotion.config.ts` reads `REMOTION_BROWSER`). Check the path with `ls /opt/pw-browsers`.
- **`<Freeze frame>` is clamped to the composition length.** Freezing an
  `OffthreadVideo` on source frame 2061 in a 1804-frame composition silently showed frame
  ~1803. Fix: `startFrom={base}` + `<Freeze frame={frame - base}>` with
  `base = floor(frame/600)*600` (see the template's `Source.tsx`).
- Transparent cutouts: VP9 webm `yuva420p` + `<OffthreadVideo transparent>` works.
- Render speed: ~1.6 s/frame for the heavy paper-cut look (drop-shadows, clip-paths,
  grain, cutout) at concurrency 4 → a 60 s reel takes ~11-15 min. Use
  `scripts/stills.mjs` (one bundle, many stills) for quick checks instead of full renders.
- Output from Remotion at CRF 16 is ~220 MB, so always re-encode for delivery (§7 of the master prompt).

## CSS clip-path gotcha
`tornClip(..., {jagX: 0, inset: >0})` divided by jagX=0 and collapsed the polygon
(blank photo cards). Fixed in the template's `lib/paper.ts`. Keep jag values > 0 or use the fixed helper.

## Shell
- `sleep` chains are blocked. Use `run_in_background` + an `until` loop to wait for renders.
- `rm` on paths built inside a `cd` is blocked by a safety check. Write to fresh
  directories instead of deleting.

## Files to the user
- `SendUserFile` failed (502) for a 44 MB MP4 but worked for 14 MB. Send a 720p preview
  in chat and link the full file in the repo.
- Private repo links don't open for the client. **Send the video file itself in the DM**,
  not a GitHub link.

## ElevenLabs
- No local-file upload tool was available in the first session (only URL attach), so
  ElevenLabs transcription of a local file wasn't possible. Use local whisper instead.
- `generations_count` defaults to 4 (4× credits). For SFX use 1.
- Credits used on the first project: music 4×1800 = 7200, SFX 20×50 ≈ 1000.
