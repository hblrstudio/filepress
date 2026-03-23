#!/usr/bin/env python3
"""
Generate FilePress.app icon.
Draws a 1024x1024 PNG, resizes to all required iconset sizes,
then calls macOS iconutil to produce FilePress.icns.
"""
import subprocess
import shutil
from pathlib import Path
from PIL import Image, ImageDraw

ASSETS = Path(__file__).parent.parent / "assets"
ASSETS.mkdir(exist_ok=True)
ICONSET = ASSETS / "FilePress.iconset"


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = int(size * 0.08)

    # Rounded square background: gradient blue
    bg_box = [pad, pad, size - pad, size - pad]
    r = int(size * 0.22)
    d.rounded_rectangle(bg_box, radius=r, fill="#007aff")
    # Subtle inner gradient: lighter strip at top
    strip_h = int(size * 0.45)
    for i in range(strip_h):
        alpha = int(40 * (1 - i / strip_h))
        d.line(
            [(pad + r // 2, pad + i), (size - pad - r // 2, pad + i)],
            fill=(255, 255, 255, alpha),
        )

    # Document outline (white)
    doc_l = int(size * 0.28)
    doc_t = int(size * 0.18)
    doc_r = int(size * 0.72)
    doc_b = int(size * 0.82)
    fold = int(size * 0.16)
    doc_points = [
        (doc_l, doc_t),
        (doc_r - fold, doc_t),
        (doc_r, doc_t + fold),
        (doc_r, doc_b),
        (doc_l, doc_b),
    ]
    d.polygon(doc_points, fill=(255, 255, 255, 230))
    # Fold triangle (slightly darker)
    d.polygon(
        [(doc_r - fold, doc_t), (doc_r, doc_t + fold), (doc_r - fold, doc_t + fold)],
        fill=(200, 220, 255, 200),
    )

    # Compression chevrons (two inward-pointing arrows, centred)
    cx = size // 2
    cy = int(size * 0.545)
    aw = int(size * 0.15)   # half-width of chevron
    ah = int(size * 0.07)   # height
    gap = int(size * 0.06)  # gap between chevrons
    accent = (0, 100, 200, 220)

    # Top chevron ▼
    ty = cy - gap // 2
    d.polygon(
        [(cx - aw, ty - ah), (cx, ty), (cx + aw, ty - ah)],
        fill=accent,
    )
    # Bottom chevron ▲
    by = cy + gap // 2
    d.polygon(
        [(cx - aw, by + ah), (cx, by), (cx + aw, by + ah)],
        fill=accent,
    )

    return img


ICONSET_SIZES = [
    ("icon_16x16.png",       16),
    ("icon_16x16@2x.png",    32),
    ("icon_32x32.png",       32),
    ("icon_32x32@2x.png",    64),
    ("icon_128x128.png",     128),
    ("icon_128x128@2x.png",  256),
    ("icon_256x256.png",     256),
    ("icon_256x256@2x.png",  512),
    ("icon_512x512.png",     512),
    ("icon_512x512@2x.png",  1024),
]


def main():
    # Generate 1024 source
    src = draw_icon(1024)
    src.save(ASSETS / "icon-1024.png")
    print("✓ Drew icon-1024.png")

    # Build iconset
    if ICONSET.exists():
        shutil.rmtree(ICONSET)
    ICONSET.mkdir()

    for filename, px in ICONSET_SIZES:
        resized = src.resize((px, px), Image.LANCZOS)
        resized.save(ICONSET / filename)
    print(f"✓ Generated {len(ICONSET_SIZES)} iconset sizes")

    # Run iconutil
    icns_path = ASSETS / "FilePress.icns"
    subprocess.run(
        ["iconutil", "-c", "icns", str(ICONSET), "-o", str(icns_path)],
        check=True,
    )
    print(f"✓ Created {icns_path}")


if __name__ == "__main__":
    main()
