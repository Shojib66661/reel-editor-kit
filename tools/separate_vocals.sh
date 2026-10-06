#!/usr/bin/env bash
# Split a video's audio into vocals.wav + music.wav (UVR MDX-Net Voc FT).
# usage: tools/separate_vocals.sh input.mp4 outdir
set -euo pipefail
M=${MODELS_DIR:-$HOME/models}
mkdir -p "$2"
ffmpeg -v error -y -i "$1" -vn -ac 2 -ar 44100 "$2/_audio.wav"
audio-separator "$2/_audio.wav" --model_filename UVR-MDX-NET-Voc_FT.onnx --model_file_dir "$M/uvr" --output_dir "$2" --output_format WAV >/dev/null
mv "$2"/*"(Vocals)"*.wav "$2/vocals.wav"; mv "$2"/*"(Instrumental)"*.wav "$2/music.wav"; rm "$2/_audio.wav"
echo "wrote $2/vocals.wav $2/music.wav"
