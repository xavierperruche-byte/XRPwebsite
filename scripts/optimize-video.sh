
#!/usr/bin/env bash
# scripts/optimize-video.sh
# Usage: ./optimize-video.sh input.mp4 output-prefix
# Example (Git Bash/WSL): ./scripts/optimize-video.sh "/c/Users/xavie/XRPwebsite/public/videos/WTA_WPP.mp4" WTA_WPP

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 input.mp4 output-prefix"
  exit 1
fi

IN="$1"
OUT_PREFIX="$2"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found in PATH. Install ffmpeg or add it to PATH."
  exit 2
fi

OUT_DIR="$(dirname "$IN")"
echo "Input: $IN"
echo "Output prefix: $OUT_PREFIX"
echo "Output directory: $OUT_DIR"

MP4_720="${OUT_DIR}/${OUT_PREFIX}-720.mp4"
WEBM_720="${OUT_DIR}/${OUT_PREFIX}-720.webm"
MP4_480="${OUT_DIR}/${OUT_PREFIX}-480.mp4"

echo "Generating optimized MP4 (H.264) - 720p -> $MP4_720"
ffmpeg -y -i "$IN" -c:v libx264 -preset slow -crf 28 -vf "scale='min(1280,iw)':'-2'" -c:a aac -b:a 96k "$MP4_720"

echo "Generating optimized WebM (VP9) - 720p -> $WEBM_720"
ffmpeg -y -i "$IN" -c:v libvpx-vp9 -b:v 800k -vf "scale='min(1280,iw)':'-2'" -c:a libopus -b:a 64k "$WEBM_720"

echo "Generating smaller MP4 (480p) as fallback -> $MP4_480"
ffmpeg -y -i "$IN" -c:v libx264 -preset faster -crf 30 -vf "scale='min(854,iw)':'-2'" -c:a aac -b:a 64k "$MP4_480"

echo "Done. Files written to: $OUT_DIR"
echo "Update site references to point to $OUT_PREFIX-720.mp4 and $OUT_PREFIX-720.webm (or 480 fallback)."

