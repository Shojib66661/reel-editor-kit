#!/usr/bin/env python3
"""Offline transcription with word timings (no HuggingFace / OpenAI needed).

- whisper small.en  -> accurate text (per 20 s window)
- zipformer         -> token timestamps (word starts)
Writes <out>.whisper.txt (text per window) and <out>.words.json
([{"w": "HEY", "s": 0.04}, ...] word starts from zipformer).
Correct the zipformer words against the whisper text (and any burned-in
captions) by hand, then align with tools/align_words.py.

usage: python3 tools/transcribe.py input.(mp4|wav) out_prefix [--vocals]
Tip: run on the separated vocals.wav for much better accuracy.
"""
import json, os, subprocess, sys
import numpy as np
import sherpa_onnx

M = os.environ.get('MODELS_DIR', os.path.expanduser('~/models'))
src, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.float32)
sr = 16000
Z = f'{M}/sherpa-onnx-zipformer-en-2023-06-26/'
zr = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=Z + 'encoder-epoch-99-avg-1.onnx', decoder=Z + 'decoder-epoch-99-avg-1.onnx',
                                                   joiner=Z + 'joiner-epoch-99-avg-1.onnx', tokens=Z + 'tokens.txt', num_threads=4,
                                                   decoding_method='modified_beam_search')
W = f'{M}/sherpa-onnx-whisper-small.en/'
wr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=W + 'small.en-encoder.int8.onnx', decoder=W + 'small.en-decoder.int8.onnx',
                                                tokens=W + 'small.en-tokens.txt', num_threads=4)
words, texts = [], []
for st in range(0, int(len(a) / sr) + 1, 20):
    seg = a[st * sr:(st + 20) * sr]
    if len(seg) < sr // 2:
        break
    s = zr.create_stream(); s.accept_waveform(sr, seg); zr.decode_stream(s)
    for tok, ts in zip(s.result.tokens, s.result.timestamps):
        if tok.startswith((' ', '▁')) or not words:
            words.append({'w': tok.strip(' ▁'), 's': round(st + ts, 2)})
        else:
            words[-1]['w'] += tok
    s = wr.create_stream(); s.accept_waveform(sr, seg); wr.decode_stream(s)
    texts.append(f'[{st}s] {s.result.text.strip()}')
json.dump(words, open(out + '.words.json', 'w'), indent=0)
open(out + '.whisper.txt', 'w').write('\n'.join(texts) + '\n')
print('\n'.join(texts))
