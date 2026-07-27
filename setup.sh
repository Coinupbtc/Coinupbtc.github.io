#!/usr/bin/env bash
# Local preview of the static portfolio (no build step).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-8765}"
echo "Serving $ROOT at http://127.0.0.1:${PORT}/"
echo "Open that URL, or open index.html directly."
exec python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT"
