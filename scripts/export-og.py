#!/usr/bin/env python3
"""Draw the share card from a generative node field. No model-output frames.

Same layout as the previous card (eyebrow, name, lede, GitHub / X / email,
domain) on a dark panel. The background is a seeded node field, the same
idea as #hero-field, so a rerun cannot pick up a generated clip or still.

Usage:
    python3 scripts/export-og.py
"""
import math
import random
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Pillow is required:  pip install Pillow")

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "assets" / "og-image.png"
W, H = 1200, 630

# Site dark theme: paper, ink, acid. Drawn as a still, so theme vars are inlined.
PAPER = (14, 16, 19)
INK = (234, 230, 221)
ACID = (200, 245, 74)
MUTE = (154, 160, 143)

SERIF = "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"
SERIF_ITALIC = "/usr/share/fonts/truetype/noto/NotoSerif-Italic.ttf"
MONO = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf"
MONO_REG = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def draw_field(base: Image.Image) -> None:
    """Seeded constellation. Fixed seed so the card does not change between runs."""
    rng = random.Random(35)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    nodes = [(rng.randrange(W), rng.randrange(H), 1.2 + rng.random() * 2.2) for _ in range(78)]
    link_d = 150
    for i, (x1, y1, _) in enumerate(nodes):
        for x2, y2, _ in nodes[i + 1 :]:
            d = math.hypot(x1 - x2, y1 - y2)
            if d > link_d:
                continue
            alpha = int(40 * (1 - d / link_d))
            draw.line((x1, y1, x2, y2), fill=(234, 230, 221, alpha), width=1)
    for x, y, r in nodes:
        # A few nodes pick up the acid accent; the rest stay ink. No photo, no disc.
        acid = rng.random() < 0.12
        fill = (200, 245, 74, 160) if acid else (234, 230, 221, 100)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)
    base.alpha_composite(overlay)


def main() -> int:
    # Slight vertical lift so the right side is not a dead rectangle.
    sky = Image.new("RGB", (W, H), PAPER)
    pix = sky.load()
    for y in range(H):
        t = y / (H - 1)
        row = tuple(int(PAPER[c] + (36 - PAPER[c]) * (0.55 * (1 - t))) for c in range(3))
        for x in range(W):
            pix[x, y] = row
    img = sky.convert("RGBA")
    draw_field(img)
    draw = ImageDraw.Draw(img, "RGBA")

    # Left reading panel, matching the previous card's column.
    panel = (36, 48, 700, 582)
    draw.rectangle(panel, fill=(12, 14, 18, 210))
    draw.rectangle((36, 48, 42, 582), fill=ACID)

    eyebrow = font(MONO, 16)
    name = font(SERIF, 78)
    lede = font(SERIF_ITALIC, 26)
    label = font(MONO_REG, 13)
    value = font(MONO, 18)
    domain = font(MONO_REG, 14)

    draw.text((72, 78), "QUALITY SYSTEMS  ·  ON-PREM AI  ·  MEASURED", font=eyebrow, fill=ACID)
    draw.text((68, 118), "Coinupbtc", font=name, fill=INK)
    draw.text((72, 220), "I don’t rent intelligence — I host it.", font=lede, fill=INK)

    rows = (
        ("GITHUB", "github.com/Coinupbtc"),
        ("X", "x.com/coinupbtc"),
        ("EMAIL", "coinupbtc@gmail.com"),
    )
    y = 360
    for lab, val in rows:
        draw.text((72, y), lab, font=label, fill=MUTE)
        draw.text((168, y - 3), val, font=value, fill=ACID)
        y += 42

    draw.text((72, 530), "COINUPBTC.COM", font=domain, fill=INK)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(REPO)} ({OUT.stat().st_size // 1024}KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
