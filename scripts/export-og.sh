#!/usr/bin/env bash
# Render scripts/og-card.html to assets/og-image.png (1200x630) with headless Chromium.
# CHROME can point at any Chromium/Chrome binary; the default is Playwright's headless shell.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-$(ls -d "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | tail -1)}"
[ -x "$CHROME" ] || { echo "set CHROME to a Chromium binary" >&2; exit 1; }
"$CHROME" --no-sandbox --hide-scrollbars --disable-gpu --virtual-time-budget=10000 --run-all-compositor-stages-before-draw --window-size=1200,630 \
  --screenshot="$REPO/assets/og-image.png" "file://$REPO/scripts/og-card.html" >/dev/null 2>&1
echo "wrote $REPO/assets/og-image.png ($(wc -c < "$REPO/assets/og-image.png") bytes)"
