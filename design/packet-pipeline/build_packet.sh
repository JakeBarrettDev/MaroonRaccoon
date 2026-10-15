#!/usr/bin/env bash
# Rebuild frontend/public/models/packet.glb from the raw Meshy export.
# Usage (from the repo root): design/packet-pipeline/build_packet.sh [path/to/Packet_Model.glb]
set -euo pipefail

SRC="${1:-design/packet-source/Packet_Model.glb}"
OUT="frontend/public/models/packet.glb"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
GT="npx -y @gltf-transform/cli@4"

python3 -I "$(dirname "$0")/fix_packet.py" "$SRC" "$TMP/fixed.glb"
$GT resize "$TMP/fixed.glb" "$TMP/resized.glb" --width 2048 --height 2048
$GT webp "$TMP/resized.glb" "$TMP/webp.glb" --quality 85
$GT prune "$TMP/webp.glb" "$TMP/pruned.glb"
$GT meshopt "$TMP/pruned.glb" "$OUT" --level medium
ls -lh "$OUT"
