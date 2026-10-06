#!/usr/bin/env bash
# One-time setup for a fresh cloud session. Downloads only from hosts that
# were reachable from Claude Code cloud (GitHub releases + PyPI + npm).
# HuggingFace / openaipublic / remotion.media were BLOCKED (403).
set -euo pipefail
M=${MODELS_DIR:-$HOME/models}
mkdir -p "$M"
pip install -q sherpa-onnx onnxruntime opencv-python-headless numpy pillow soundfile pyloudnorm "audio-separator[cpu]"
cd "$M"
get() { [ -f "$2" ] || curl -sSL -o "$2" "$1"; }
# speech-to-text (whisper = accurate text, zipformer = token timestamps, silero = VAD)
for m in sherpa-onnx-whisper-small.en sherpa-onnx-zipformer-en-2023-06-26; do
  [ -d "$m" ] || { curl -sSL "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/$m.tar.bz2" | tar xj; }
done
get https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx silero_vad.onnx
# person segmentation (cutouts / text-behind-subject)
get https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx u2net_human_seg.onnx
# vocal / music separation
mkdir -p uvr
get https://github.com/TRvlvr/model_repo/releases/download/all_public_uvr_models/UVR-MDX-NET-Voc_FT.onnx uvr/UVR-MDX-NET-Voc_FT.onnx
echo "models ready in $M"
echo "Remotion: export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell (path may differ: ls /opt/pw-browsers)"
