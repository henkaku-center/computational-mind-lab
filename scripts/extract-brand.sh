#!/usr/bin/env bash
# One-time extraction of SDS / Henkaku Center brand assets from the
# Pentagram visual-identity zip. The zip itself is 378MB and must NEVER
# be committed (covered by *.zip in .gitignore).
#
# Usage: scripts/extract-brand.sh [path-to-zip]
set -euo pipefail

ZIP="${1:-drive-download-20260716T112402Z-1-001.zip}"
DEST_SRC="src/assets/brand"
DEST_PUB="public"

if [[ ! -f "$ZIP" ]]; then
  echo "zip not found: $ZIP" >&2
  exit 1
fi

mkdir -p "$DEST_SRC"

extract() { # extract <zip-internal-path> <dest-file>
  unzip -p "$ZIP" "$1" > "$2"
  echo "  $2"
}

echo "Extracting SDS logos (SVG):"
extract "SDS Visual Identity Package/SDS LOGOS/SVG/SDS HORIZONTAL BLACK.svg" "$DEST_SRC/sds-horizontal-black.svg"
extract "SDS Visual Identity Package/SDS LOGOS/SVG/SDS HORIZONTAL WHITE.svg" "$DEST_SRC/sds-horizontal-white.svg"
extract "SDS Visual Identity Package/SDS LOGOS/SVG/SDS STACKED BLACK.svg"    "$DEST_SRC/sds-stacked-black.svg"
extract "SDS Visual Identity Package/SDS LOGOS/SVG/SDS STACKED WHITE.svg"    "$DEST_SRC/sds-stacked-white.svg"
extract "SDS Visual Identity Package/SDS LOGOS/SVG/SDS SYMBOL BLACK.svg"     "$DEST_SRC/sds-symbol-black.svg"
extract "SDS Visual Identity Package/SDS LOGOS/SVG/SDS SYMBOL WHITE.svg"     "$DEST_SRC/sds-symbol-white.svg"

echo "Extracting Henkaku Center assets:"
extract "Henkaku Center Visual Identity/Logos/Henkaku center_logo.svg"       "$DEST_SRC/henkaku-center-logo.svg"

echo "Building favicon.svg from SDS symbol (theme-aware fill):"
# Inject a style block so the symbol renders black in light mode, white in dark mode.
python3 - "$DEST_SRC/sds-symbol-black.svg" "$DEST_PUB/favicon.svg" <<'PY'
import re, sys
src, dst = sys.argv[1], sys.argv[2]
svg = open(src).read()
style = ('<style>path,polygon,rect{fill:#000}'
         '@media (prefers-color-scheme:dark){path,polygon,rect{fill:#fff}}</style>')
svg = re.sub(r'(<svg[^>]*>)', r'\1' + style, svg, count=1)
open(dst, 'w').write(svg)
print(f"  {dst}")
PY

echo
echo "Done. Reminder: delete the zip when finished — it must not be committed."
