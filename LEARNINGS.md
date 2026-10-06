# Learnings log (append newest at the top)

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
