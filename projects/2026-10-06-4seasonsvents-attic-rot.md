# 4SEASONS Solar Powered Vents (@4seasonsvents): "Your roof could be rotting" (2026-10-06)

- **Source**: 26.7 s reel, 720x1280, 14 shots, one-word burned-in captions on a thin strip
  (y 650-790), a "rotting wood" photo inset at 0.7-1.2 s, the brand's logo stickers on B-roll.
  Speaker is a partner roofer (other company's logo on his shirt).
- **Result**: 27.1 s (24.3 s talk + 2.8 s end card), 1080x1920, mixed-media in brand navy +
  lime. Repo `Shojib66661/promo`, branch `claude/beautiful-cray-ahb5xu`, project
  `4seasons-attic-vents/`, render `renders/4seasons-attic-vents_TEMP-MUSIC.mp4`.
- **Edit**: no re-ordering (the original opener was already the hook). Two pauses tightened,
  "And follow us for more roofing tips" cut (user OK). Caption reads "shorten" (he says "shorter").
- **Captions**: removed with temporal fill + inpainting (new `tools/clean_captions.py`), new
  sans + italic-serif captions; leak scan of the cleaned source: only false positives
  (blue shirt / white objects) in the frames used.
- **Audio**: vocals separated (UVR), 12 SFX from the library, temp music = kit
  `indie-pop-stomp-105bpm-b` until the user's track arrives; -14.3 LUFS / -2.1 dBTP.
- **Open**: final music; DM not sent yet; no contact name.
- **Time**: ~1.5 h incl. new caption-removal tool; render ~7 min per pass.
