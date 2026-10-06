# Ruff Roofing (@ruff_roofing): "damaged decking / water damage" (2026-10-06)

- **Source**: 53.8 s reel, 720x1280, speaker Dre (Ruff Roofing polo, so his own CTA stays).
  Burned in by their editor: one-word white captions (y ~600-680; 2 lines + cyan "Dre" at the
  start; y 866-952 during 29.4-34.8 s), orange accent words (WATER DAMAGE, DAMAGED/OLD DECKING,
  PRETTY OLD, SHEETROCK, YOUR RAFTERS), an animated logo sticker that drops in from the top
  (1.3-3.7 s), photo insets (5.1-9.5 s decking, 29.4-34.8 s shingles), a "saving you 493" counter,
  a phone icon, and a "Can someone come check my roof?" text bubble (47.5-48.8 s). White logo end card.
- **Result**: 49.4 s (47.4 s talk; end card starts over "We'll get you taken care of"), mixed-media
  in Ruff red #f2434f / cyan #2fd3ef / ink #232024. Repo `Shojib66661/promo`, branch
  `claude/eager-bohr-wqmm7g`, project `ruff-roofing-decking/`, render
  `renders/ruff-roofing-decking_TEMP-MUSIC.mp4` (+ `_preview-720p.mp4`).
- **Edit (user-approved)**: cold open on the B-roll line "We have extensive water damage right here.
  It's been leaking for a while," then the intro and the rest in order. Cuts: "old decking" (repeat),
  "Okay,", "right?", "Go ahead,". User chose to KEEP "to make sure that you don't have any problems
  in the future". Caption reads "can be" (their editor's caption) where whisper heard "could be".
- **Captions**: `clean_captions.py --zones/--extra` (fixed caption zones + coloured words) and an
  opaque ink-tape caption strip that always covers the zone. Their big graphics replaced by our own:
  logo card (their logo cropped from their end card; follows their drop-in, cutout on top while it
  overlaps his face), 2 kraft boards (their 3 decking photos re-taped + titles; inspection checklist
  -> "$1,000s" note), text-bubble sticker. Leak scan: 0 detector hits outside covers in the 1421 used
  source frames; `overlay_scan.py` windows all covered.
- **Look**: B&W + red-outlined cutout + red star on "What's up guys", "pretty old" (word "Old"),
  "Do a full inspection" ("Inspection"), "Shoot us a call" ("Call"). Stickers: water drops, hourglass,
  $$$ tag, sheetrock / rafters cards, GOOD TO GO stamp, call/link/text/office icons.
- **End card (bio only)**: logo, "Every Homeowner's Best Friend", Houston · Austin · San Antonio ·
  Dallas, ruff-roofing.co/roof, Dre sticker (from an untouched ORIGINAL frame). No FREE offer and no
  phone: bio line is cut off at "Book Your FREE Roof…"; user will send the full line.
- **Audio**: vocals separated (UVR), 15 library SFX, temp music = kit `indie-pop-stomp-105bpm-a`;
  -14.6 LUFS / -1.0 dBTP.
- **Music prompt given** (52 s): see the chat / below.
  > Warm, confident indie-pop instrumental at 100 BPM, upbeat and trustworthy with a handmade feel.
  > Instruments: foot stomps, hand claps, plucky muted acoustic guitar, warm bass, light glockenspiel.
  > Steady, driving energy that sits under a spoken voiceover, with a small lift at 30 s and a
  > confident final hit at 49 s. No vocals, no vocal chops, no big drops, no long intro (music starts
  > on beat 1). Length 52 seconds.
- **DM (no name, as asked)**: "Hey guys! I loved your video on damaged decking and water damage, so I
  re-edited it in a mixed-media style with a stronger hook, new captions and tighter pacing to keep
  people watching longer. It's completely free, no strings attached, and you're welcome to post it on
  your socials. If you'd like anything changed, just let me know and I'll fix it 🙌"
- **Open**: final music; full bio offer line + phone (then add to end card); DM not sent.
- **Time**: ~1.6 h; full render ~9 min (1481 frames, concurrency 4).
