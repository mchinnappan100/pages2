#!/bin/bash

# Usage: ./add_bgm_to_webm.sh input.webm bg_music.mp3 output.webm --level 0.2

INPUT_VIDEO="$1"
BGM_AUDIO="$2"
OUTPUT_VIDEO="$3"
LEVEL="${5:-0.2}"  # Default background level is 0.2 (20%)

# Extract original audio from the video
ffmpeg -y -i "$INPUT_VIDEO" -q:a 0 -map a original_audio.wav

# Adjust background music volume
ffmpeg -y -i "$BGM_AUDIO" -filter:a "volume=${LEVEL}" bgm_quiet.wav

# Mix the original audio and background music
ffmpeg -y -i original_audio.wav -i bgm_quiet.wav \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=3" \
  -c:a libopus -b:a 128k mixed_audio.opus

# Combine mixed audio back with original video (without its original audio)
ffmpeg -y -i "$INPUT_VIDEO" -an -i mixed_audio.opus -c:v copy -c:a copy "$OUTPUT_VIDEO"

# Cleanup
rm original_audio.wav bgm_quiet.wav mixed_audio.opus

echo "✅ Done: Output saved to $OUTPUT_VIDEO"
