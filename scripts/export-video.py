#!/usr/bin/env python3
"""Export curated locally-generated MiniMax-H3 clips into web assets for the site.

Same law as export-art.py: curation is explicit and by-id. Every clip below was
generated locally on the DGX Spark (MiniMax-H3) and picked by hand. Source filenames
are the H3 prompt strings; they are self-describing.

Produces, per pick, inside assets/video/:
    <slug>.webp   poster frame (first frame, or a mid-clip frame for clips that
                  fade up from black), used as the poster
    <slug>.mp4    H.264 high, scaled to <= 960px wide, faststart, no audio, web-tuned

Usage:
    python3 scripts/export-video.py
    H3_SRC=/path/to/MiniMax-H3-2x-DGX-Spark/output python3 scripts/export-video.py

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
SRC = Path(os.environ.get("H3_SRC", Path.home() / "Documents/projects/MiniMax-H3-2x-DGX-Spark/output"))
DST = REPO / "assets" / "video"

# Output slug -> (source filename, poster timestamp in seconds or 0)
# A poster_ts > 0 pulls the poster frame from mid-clip (clips that fade up from black).
PICKS = {
    "hero-street": ("h3-20260804_210351-a_slow_push_in_on_an_empty_rain-soaked_s-19263.mp4", 0),
    "dragon":      ("h3-20260803_215318-A_huge_deep-crimson_dragon_with_tarnishe.mp4", 0),
    "car":         ("h3-20260803_201935-A_sleek_sports_car_speeding_along_a_lumi.mp4", 0),
    "cat":         ("h3-20260803_211341-A_fluffy_orange_cat_riding_on_the_back_o.mp4", 0),
    "soundwave":   ("h3-20260804_061639-A_glowing_cyan_soundwave_ribbon_pulses_t.mp4", 3),
}

WIDTH = 960
CRF = "26"


def run(*args: str) -> None:
    subprocess.run(args, check=True, capture_output=True)


def main() -> int:
    if not SRC.is_dir():
        sys.exit(f"source folder not found: {SRC}\nSet H3_SRC to override.")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is required and was not found on PATH")

    DST.mkdir(parents=True, exist_ok=True)
    missing = []

    for slug, (srcname, poster_ts) in PICKS.items():
        src = SRC / srcname
        if not src.is_file():
            missing.append(srcname)
            print(f"!! no source for {slug}")
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
        ss = ["-ss", str(poster_ts)] if poster_ts > 0 else []
        run(
            "ffmpeg", "-v", "error", *ss, "-i", str(src),
            "-vf", f"scale={WIDTH}:-2", "-frames:v", "1", "-y", str(frame),
        )
        Image.open(frame).convert("RGB").save(
            DST / f"{slug}.webp", "WEBP", quality=72, method=6
        )
        frame.unlink()

        print(f"{slug} <- {srcname} : {mp4.stat().st_size // 1024}KB mp4, "
              f"{ (DST / (slug + '.webp')).stat().st_size // 1024 }KB webp")

    total = sum(p.stat().st_size for p in DST.iterdir() if p.is_file())
    print(f"\n{len(PICKS) - len(missing)}/{len(PICKS)} clips, "
          f"{total // 1024}KB total in {DST.relative_to(REPO)}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
