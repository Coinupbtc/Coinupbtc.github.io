#!/usr/bin/env python3
"""Conference build: do not export MiniMax-H3 clips into this site.

The hiring page keeps the generative canvas (#hero-field) and the vignette
as the hero backplate. The art gallery is off. The share card is drawn by
scripts/export-og.py from that node field, not from a generated clip.

Running this script must not recreate hero, gallery, or share-card media.
The previous pick list (street clip, astronaut frame, and the gallery tiles)
is intentionally gone so a later run cannot put those files back.
"""
import sys


def main() -> int:
    print(
        "Conference build: H3 clip export is disabled. "
        "No hero, gallery, or share-card media written."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
