#!/usr/bin/env python3
"""Export curated locally-generated stills into web assets for the site.

Curation is explicit and by-id. Never glob the generator's output folder into
this repo — it holds prompt tests, throwaway memes, and third-party characters
that must not be published.

Usage:
    python3 scripts/export-art.py
    ART_SRC=/path/to/output python3 scripts/export-art.py

Requires Pillow:  pip install Pillow
"""
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip install Pillow")

REPO = Path(__file__).resolve().parent.parent
SRC = Path(os.environ.get("ART_SRC", Path.home() / "comfy" / "ComfyUI" / "output"))
DST = REPO / "assets" / "art"

# Source id -> (output slug, alt text). Add a line here to publish an image.
PICKS = {
    "00176": ("spiral", "Concentric black and white spiral, an optical figure-ground study"),
    "00177": ("penrose", "Impossible triangle rendered in brushed gold on white"),
    "00179": ("duckrabbit", "The duck-rabbit ambiguous figure in flat black on white"),
    "00181": ("vortex", "Black and white vortex of curved bands"),
    "00187": ("grid", "Grid of squares filled with hatching at alternating angles"),
    "00188": ("arcs", "Two thin black arcs on white, a study in identical curvature"),
    "00190": ("topology", "Node diagram of a local DGX Spark systems topology"),
}

WIDE = 1200
THUMB = 640


def main() -> int:
    if not SRC.is_dir():
        sys.exit(f"source folder not found: {SRC}\nSet ART_SRC to override.")

    DST.mkdir(parents=True, exist_ok=True)
    missing = []

    for pid, (slug, _alt) in PICKS.items():
        matches = sorted(SRC.glob(f"*_{pid}_.png"))
        if not matches:
            missing.append(pid)
            print(f"!! no source for {pid}")
            continue

        im = Image.open(matches[0]).convert("RGB")
        w, h = im.size

        full = im.copy()
        full.thumbnail((WIDE, WIDE), Image.LANCZOS)
        full.save(DST / f"{slug}.webp", "WEBP", quality=82, method=6)

        th = im.copy()
        th.thumbnail((THUMB, THUMB), Image.LANCZOS)
        th.save(DST / f"{slug}-t.webp", "WEBP", quality=78, method=6)

        print(f"{pid} -> {slug}: src {w}x{h}")

    total = sum(p.stat().st_size for p in DST.glob("*.webp"))
    print(f"\n{len(PICKS) - len(missing)}/{len(PICKS)} images, {total // 1024}KB in {DST.relative_to(REPO)}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
