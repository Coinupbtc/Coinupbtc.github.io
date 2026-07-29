#!/usr/bin/env python3
"""Export curated locally-generated clips into web assets for the site.

Same law as export-art.py: curation is explicit and by-id, and every clip was
watched frame-by-frame before it was added. The generator's output folder holds
prompt tests and third-party characters that must never be published.

Produces, per pick:
    assets/video/<slug>.mp4    H.264 high, 960px wide, faststart, no audio
    assets/video/<slug>.webp   first frame, used as the poster

Usage:
    python3 scripts/export-video.py
    ART_SRC=/path/to/output python3 scripts/export-video.py

Requires ffmpeg on PATH and Pillow.
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip install Pillow")

REPO = Path(__file__).resolve().parent.parent
SRC = Path(os.environ.get("ART_SRC", Path.home() / "comfy" / "ComfyUI" / "output"))
DST = REPO / "assets" / "video"

# Source filename stem -> (output slug, caption). Add a line here to publish a clip.
PICKS = {
    "hermes_wan-t2v_00006_": ("mesh", "A mesh ignites from a single node"),
    "hermes_wan-t2v_00007_": ("cortex", "Cortex over a city grid, warming up"),
    "hermes_wan-i2v_00002_": ("neon", "A still frame, animated back into motion"),
    "hermes_wan-t2v_00010_": ("wave", "A wave breaking, rendered rather than filmed"),
}

WIDTH = 960
CRF = "26"


def run(*args: str) -> None:
    subprocess.run(args, check=True, capture_output=True)


def main() -> int:
    if not SRC.is_dir():
        sys.exit(f"source folder not found: {SRC}\nSet ART_SRC to override.")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is required and was not found on PATH")

    DST.mkdir(parents=True, exist_ok=True)
    missing = []

    for stem, (slug, _caption) in PICKS.items():
        src = SRC / f"{stem}.mp4"
        if not src.is_file():
            missing.append(stem)
            print(f"!! no source for {stem}")
            continue

        mp4 = DST / f"{slug}.mp4"
        run(
            "ffmpeg", "-v", "error", "-i", str(src),
            "-vf", f"scale={WIDTH}:-2",
            "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-crf", CRF, "-preset", "slow", "-movflags", "+faststart",
            "-an", "-y", str(mp4),
        )

        frame = DST / f"{slug}.frame.png"
        run(
            "ffmpeg", "-v", "error", "-i", str(src), "-ss", "0",
            "-vf", f"scale={WIDTH}:-2", "-frames:v", "1", "-y", str(frame),
        )
        Image.open(frame).convert("RGB").save(
            DST / f"{slug}.webp", "WEBP", quality=72, method=6
        )
        frame.unlink()

        print(f"{stem} -> {slug}: {mp4.stat().st_size // 1024}KB")

    total = sum(p.stat().st_size for p in DST.iterdir() if p.is_file())
    print(f"\n{len(PICKS) - len(missing)}/{len(PICKS)} clips, "
          f"{total // 1024}KB in {DST.relative_to(REPO)}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
