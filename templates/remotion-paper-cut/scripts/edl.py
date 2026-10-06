"""Edit decision list for the High Profile Ridge reel.

Times are in SOURCE seconds (source.mp4, 30 fps). Each segment is a list of
pieces that get butt-joined (jump cuts); segments are played in the order
listed here, which deliberately re-orders the original talk:

  cold open (pain point)  ->  intro  ->  product  ->  benefit  ->  proof
  ->  deductibles / industry is changing  ->  Texas Proof system  ->  CTA

Cut points were picked from pauses in the isolated vocal stem and checked by
re-transcribing every piece (see README).
"""

FPS = 30

SEGMENTS = [
    # "Every handful of years you're having to replace your roof, it's just
    #  not making sense anymore to use a standard roofing system."
    ('cold', [(46.38, 49.18), (49.55, 51.58), (51.88, 52.98)]),
    # "Hey Texas! We're out here on a build site today in Frisco, Texas."
    ('intro', [(0.05, 3.62)]),
    # "One of the upgrades that we offer with the Texas Proof Roof,"
    ('upgrade', [(5.45, 8.50)]),
    # "and this is High Profile Ridge."
    ('hpr', [(9.62, 11.78)]),
    # "So if you've ever seen a roof, the ridge of the roof, it's just that
    #  piece that's like an accessory. It just really finishes off nicely."
    ('accessory', [(11.78, 12.10), (12.36, 15.48), (16.02, 20.08)]),
    # "One of the differences, for instance, is oftentimes you can kind of see
    #  the edge of the ridge. With the High Profile Ridge you're going to see
    #  a nice smooth finish. It just gives it a nice finished look."
    ('difference', [(20.95, 22.50), (22.62, 25.06), (25.25, 28.10), (28.22, 30.12)]),
    # "If you're looking to replace your roof less often, that's one of the
    #  things that we're known for, that we really shoot for, maybe that
    #  really sets us apart from other roofers."
    ('lessoften', [(33.79, 39.15), (39.43, 41.40)]),
    # "With the deductibles going up and up,"
    ('deduct', [(43.95, 45.85)]),
    # "The industry is changing, insurance is changing, your roof needs to
    #  change as well."
    ('industry', [(65.80, 70.02)]),
    # "You want a Texas Proof roofing system. So give us a call at High
    #  Performance to find out what that means, what that looks like."
    ('txproof', [(53.10, 55.16), (55.40, 58.70)]),
    # "Happy to give you a complimentary consultation and inspect your home
    #  exterior,"
    ('consult', [(58.80, 61.47), (61.72, 63.45)]),
    # "and give us a call."
    ('call', [(70.02, 71.05)]),
]

END_CARD_FRAMES = 150  # 5 s paper-cut CTA after the last line

# Caption chunks per segment ("|" = new caption card, *word* = emphasised).
CHUNKS = {
    'cold': "Every handful | of *years* | you're having | to *replace* your roof, | it's just | not making | *sense* anymore | to use a | *standard* | roofing system.",
    'intro': "Hey *Texas!* | We're out here | on a build site | today in | *Frisco,* Texas",
    'upgrade': "One of the | *upgrades* | that we offer | with the | *Texas Proof Roof,*",
    'hpr': "and this is | *High Profile Ridge.*",
    'accessory': "So if you've | ever seen | a *roof,* | the *ridge* | of the roof, | it's just | that piece | that's like | an *accessory.* | It just *really* | *finishes* | off nicely.",
    'difference': "One of the | *differences,* | for instance, | is oftentimes | you can kind of | see the *edge* | of the ridge. | With the | *High Profile Ridge,* | you're going to see | a nice | *smooth finish.* | It just gives it | a nice | *finished look.*",
    'lessoften': "If you're looking | to *replace* your roof | *less often,* | that's one of | the things | that we're *known for,* | that we really | *shoot for,* | maybe that really | *sets us apart* | from other *roofers.*",
    'deduct': "With the | *deductibles* | going *up* | and *up,*",
    'industry': "The *industry* | is changing, | *insurance* | is changing, | your roof | needs to | *change* | as well.",
    'txproof': "You want a | *Texas Proof* | roofing system. | So give us | a *call* at | *High Performance* | to find out | what that means, | what that | looks like.",
    'consult': "Happy to | give you a | *complimentary* | *consultation* | and *inspect* | your home | *exterior,*",
    'call': "and give | us a *call.*",
}

# Word start times that the aligner got wrong (checked by ear-proxy: whisper
# on isolated pieces + zipformer token times).
WORD_FIXES = {
    # index-free fixes keyed by (word, approx original time)
    ('Hey', 0.04): 0.04, ('Texas!', 0.04): 0.40, ("We're", 0.04): 0.76,
    ('out', 0.76): 0.95, ('here', 0.76): 1.05,
    ('can', 23.28): 23.28, ('kind', 23.28): 23.38, ('of', 23.28): 23.48,
    ('It', 28.36): 28.40, ('just', 28.56): 28.56, ('gives', 28.96): 28.75,
    ('it', 29.04): 28.96, ('a', 29.16): 29.04, ('nice', 29.48): 29.16,
    ('finished', 29.6): 29.48, ('look.', 29.84): 29.84,
    ("that's", 16.2): 16.45, ('us', 40.0): 40.15,
    ('you', 34.6): 33.48, ('know,', 34.62): 33.60, ('if', 34.64): 33.86,
    ("you're", 34.66): 34.04, ('looking', 34.68): 34.20, ('to', 34.7): 34.50,
    ('is', 66.16): 66.55, ('system.', 52.48): 52.72,
    ('You', 52.68): 53.15, ('maybe', 39.2): 39.47, ('looks', 58.44): 58.36, ('like.', 58.68): 58.52, ('roofing', 54.4): 54.40, ('system.', 54.56): 54.62,
}

# Split-screen (B-roll on top) ranges in source frames, detected from the
# hard seam at y=500. "run" = fully split frames; "ext" also covers the frames
# where the original editor's panel slides in/out.
SPLITS = [
    {'run': (459, 519), 'ext': (452, 523)},
    {'run': (735, 848), 'ext': (728, 852)},
    {'run': (998, 1081), 'ext': (991, 1085)},
    {'run': (1187, 1236), 'ext': (1180, 1240)},
    {'run': (1864, 2008), 'ext': (1857, 2012)},
]
