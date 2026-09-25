#!/usr/bin/env bash
# Trim leading/trailing silence from public/audio/open/*.mp3 and print durations.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/public/audio/open"
AF='silenceremove=start_periods=1:start_duration=0.03:start_threshold=-38dB:detection=peak:stop_periods=-1:stop_duration=0.08:stop_threshold=-38dB:detection=peak'

cd "$DIR"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

for f in *.mp3; do
  out="$TMPDIR/$f"
  ffmpeg -y -i "$f" -af "$AF" -c:a libmp3lame -q:a 4 "$out" >/dev/null 2>&1
  bytes="$(wc -c < "$out" | tr -d ' ')"
  dur="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$out")"
  if [ "${bytes:-0}" -lt 800 ] || awk "BEGIN{exit !($dur < 0.05)}"; then
    echo "SKIP $f (trim too aggressive)"
    continue
  fi
  mv "$out" "$f"
  ms="$(awk -v d="$dur" 'BEGIN{printf "%d", (d*1000)+0.5}')"
  echo "OK $f ${dur}s ${ms}ms"
done
