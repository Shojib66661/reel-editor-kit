# Audio rules

Goal: the voice is always clear; music and SFX add energy without ever competing.
All numbers are implemented in `tools/mix_audio.py` (flags in brackets).

## Levels (relative to the voice)

| Layer | Level | Notes |
|---|---|---|
| Voice | reference; master to **−14 LUFS**, **−1 dBTP** | Clean it first: separate from old music, high-pass 85 Hz, gentle compression 3:1 |
| Music under speech | **voice − 19 LU** (`--talk-db`) | Felt, not heard |
| Music in long pauses | voice − 9 LU (`--gap-db`) | Only pauses ≥ 1.2 s |
| Music intro / outro / end card | voice − 9 / − 6 LU (`--intro-db`, `--outro-db`) | Swells on the CTA |
| SFX | loudest 100 ms at **voice − 12 dB** (`--sfx-db`), extra −3 dB when it lands on speech | Library SFX are pre-normalised to −18 dBFS punch, so levels are predictable |

## Ducking: no pumping

- Speech is detected from the voice stem. Gaps shorter than **1.2 s** (`--min-gap`) count
  as part of the sentence, so music stays down through breaths and between words.
- When a real pause starts, the music waits **0.2 s**, then rises over **0.7 s**.
- Before the next word, it falls over **0.4 s** and is fully down **0.15 s before** the word.
- A pause too short for both ramps never rises (no half-way bumps).
- Last 0.6 s of the track fades out.

Fast-attack, fast-release sidechain ducking ("pumping") is banned: it makes the video
sound cheap.

## SFX policy

- **Subtle**: key moments only (hook title, section transitions, stamps/badges, CTA, end
  card build). Roughly 1 per 3-5 s; never per caption word.
- **Max 5 s**. Most are 0.2-1.5 s.
- **Library first** (`sfx/index.json`, search by tags). Generate only what's missing:
  - ElevenLabs `eleven_text_to_sound_v2`, **generations_count: 1**, one sound per prompt,
    short concrete prompt (see each item's `prompt` field for examples).
  - Download promptly (signed URLs expire in about 2 h), then
    `python3 tools/sfx_add.py file.mp3 --category <cat> --name <kebab> --tags "…" --prompt "…" --credits <n>`.
  - Some generations come back silent (the first "stamp" did: −52 dB). `sfx_add.py`
    refuses silent clips. Synthesise instead (`tools/sfx_synth.py` shows how).
  - Commit and push to the kit so the next video reuses it.

## Music

- I (harun.motion) make the music. Give me a prompt from `music/PROMPTS.md` tuned to the
  video (mood, BPM, length = video length + 3 s, "no vocals", ends on a clean hit).
- Save every track I provide in `music/` + `music/index.json` (mood, bpm, length, used in).
- Check that a track is instrumental: run whisper on it; it should output only "(music)".

## Mastering

`mix_audio.py` masters with ffmpeg `loudnorm=I=-14:TP=-1:LRA=11`. Expect −14 ±1 LUFS.
Verify with `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.
