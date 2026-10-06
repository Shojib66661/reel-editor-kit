"""Edit decision list for the 4SEASONS "rotting roof / attic" reel.

Times are SOURCE frames (source.mp4, 30 fps, 26.7 s). The original edit was
already tight, so the talk keeps its order; we only tighten two slow pauses
("damage ... starts ... underneath") and drop the closing "And follow us for
more roofing tips." (it pointed at the speaker's account, not @4seasonsvents).
Cut points sit in real silences of the isolated vocal stem.
"""

FPS = 30

SEGMENTS = [
    # "Your roof could be rotting and you wouldn't even know it."
    ('hook', [(0, 64)]),
    # "Most homeowners think the shingles are the biggest problem, but they're not."
    ('myth', [(64, 158)]),
    # "The real damage starts underneath your shingles."   (pauses 6.40-6.50, 7.13-7.37 removed)
    ('under', [(158, 192), (195, 214), (221, 262)]),
    # "When your attic traps heat and moisture,"
    ('attic', [(262, 325)]),
    # "it can build mold, damage your wood and shorten the lifespan of your roof."
    ('damage', [(325, 450)]),
    # "That's why we install solar power vents,"
    ('solar', [(450, 516)]),
    # "which always keep pulling out hot air out of your attic"
    ('pull', [(516, 612)]),
    # "and don't increase your hydro bill."
    ('hydro', [(612, 662)]),
    # "Protect your roof before you have to replace it."
    ('protect', [(662, 740)]),
]

END_CARD_FRAMES = 84  # 2.8 s CTA after the last line

# Shot boundaries in the source (scene detection), used for zoom + looks.
SHOTS = [0, 38, 64, 105, 143, 158, 262, 355, 450, 487, 516, 585, 662, 741]

# Caption chunks per segment ("|" = new chunk, *word* = hero word in big serif italic).
CHUNKS = {
    'hook': "Your roof could be *rotting* | and you wouldn't | even *know* it.",
    'myth': "Most *homeowners* | think the *shingles* | are the biggest | *problem,* | but they're *not.*",
    'under': "The *real* damage | starts | *underneath* | your shingles.",
    'attic': "When your *attic* | traps *heat* | and *moisture,*",
    'damage': "it can | build *mold,* | damage | your *wood* | and shorter | the *lifespan* | of your roof.",
    'solar': "That's why | we install | *solar* | power vents,",
    'pull': "which *always* | keep pulling | out *hot air* | out of | your *attic*",
    'hydro': "and don't | *increase* | your *hydro bill.*",
    'protect': "*Protect* | your roof | before you | have to | *replace* it.",
}

# Display-only wording fixes (approved): audio says "shorter", caption reads "shorten".
DISPLAY = {'shorter': 'shorten'}

# Word start corrections in source seconds: (word, approx aligned time) -> time.
WORD_FIXES = {
    ('bill.', 21.52): 21.80,
}
