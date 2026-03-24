#!/usr/bin/env python3
"""
Generate the DMG installer background image.
540×320 — light Apple gray, centered arrow, subtle label.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent.parent / "assets" / "dmg-background.png"
W, H = 540, 320


def arrow(d: ImageDraw.ImageDraw, x1: int, y: int, x2: int,
          color=(180, 180, 185), shaft_h=3, head_w=12, head_h=18):
    """Draw a simple right-pointing arrow from x1 to x2 at height y."""
    tip = x2
    base = tip - head_w
    d.rectangle([x1, y - shaft_h // 2, base, y + shaft_h // 2], fill=color)
    d.polygon([(tip, y), (base, y - head_h // 2), (base, y + head_h // 2)], fill=color)


def main():
    img = Image.new("RGB", (W, H), "#f5f5f7")  # Apple light gray
    d = ImageDraw.Draw(img)

    # Subtle gradient overlay — very slight top-to-bottom lightening
    for i in range(H):
        t = i / H
        alpha = int(12 * (1 - t))
        d.line([(0, i), (W, i)], fill=(255, 255, 255))
    # Redo with actual subtle difference
    img2 = Image.new("RGB", (W, H), "#f5f5f7")
    d2 = ImageDraw.Draw(img2)
    for i in range(H):
        t = i / H
        # Very subtle: #f5f5f7 at top → #ebebed at bottom
        v = int(0xf5 - (0xf5 - 0xeb) * t)
        d2.line([(0, i), (W, i)], fill=(v, v, min(v + 2, 255)))
    img = img2
    d = ImageDraw.Draw(img)

    # Arrow between app (x≈150) and Applications (x≈390), centred vertically
    icon_y = 148   # icon centre y
    arrow(d, 218, icon_y, 314, color=(185, 185, 190), shaft_h=3, head_w=14, head_h=20)

    # "Drag to install" hint text — small, muted
    try:
        font = ImageFont.truetype(
            "/System/Library/Fonts/Helvetica.ttc", size=11
        )
    except Exception:
        font = ImageFont.load_default()

    hint = "Drag FilePress to Applications to install"
    # measure text width
    bbox = d.textbbox((0, 0), hint, font=font)
    tw = bbox[2] - bbox[0]
    tx = (W - tw) // 2
    ty = H - 38
    d.text((tx, ty), hint, fill=(160, 160, 165), font=font)

    OUT.parent.mkdir(exist_ok=True)
    img.save(OUT)
    print(f"✓ DMG background saved → {OUT}")


if __name__ == "__main__":
    main()
