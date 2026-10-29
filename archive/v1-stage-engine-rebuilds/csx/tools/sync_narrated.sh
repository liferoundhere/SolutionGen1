#!/usr/bin/env bash
# Copy the shared code into the narrated edition, keep its audio, and flag it as narrated.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="${1:-$SRC/../narrated}"
mkdir -p "$DST"
for p in index.html talking-points.html css js media vendor fonts tools README.md TALK_TRACK.md; do
  [ -e "$SRC/$p" ] || continue
  rm -rf "$DST/$p"; cp -r "$SRC/$p" "$DST/$p"
done
for p in SCRIPT.md TALKING_POINTS.md; do [ -e "$SRC/$p" ] && cp "$SRC/$p" "$DST/$p"; done
sed -i 's|<body>|<body data-edition="narrated">|; s|<title>\(.*\)</title>|<title>\1 · narrated edition</title>|' "$DST/index.html"
echo "synced to $DST"
