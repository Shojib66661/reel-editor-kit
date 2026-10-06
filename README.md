# reel-editor-kit

Everything an AI editing session needs to re-edit short-form reels the way
**@harun.motion** likes them, and to get better every project.

**Start here: [`MASTER_PROMPT.md`](MASTER_PROMPT.md)**

| Folder | What |
|---|---|
| `MASTER_PROMPT.md` | The reusable instructions (living document) |
| `docs/` | Audio rules, environment gotchas, style guides, outreach |
| `sfx/` | Reusable sound effects (≤5 s, normalised) + `index.json` (search by tags) |
| `music/` | Reusable music tracks + `index.json` + prompt templates |
| `tools/` | setup, transcription, vocal separation, caption detection, person cutout, SFX library, audio mixer with gentle ducking |
| `templates/` | Working Remotion projects per style (paper-cut) |
| `leads/` | Outreach lead log |
| `projects/` | One note per finished video |
| `LEARNINGS.md` | What broke and how it was fixed |

Raw file URLs: `https://raw.githubusercontent.com/Shojib66661/reel-editor-kit/main/<path>`
e.g. `.../main/sfx/paper/rip-short.wav`

Licence notes: SFX in `sfx/` are ElevenLabs generations (user's paid account) or
synthesised by `tools/sfx_synth.py`. Music in `music/` is ElevenLabs-generated or provided
by harun.motion.
