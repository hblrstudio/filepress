#!/usr/bin/env python3
"""
Generate FilePress.app icon — v3.
Clean blue gradient bg, contained document with fold, inward compression arrows.
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
    pad = int(size * 0.07)
    r   = int(size * 0.22)
    bg_box = [pad, pad, size - pad, size - pad]

    # ── Gradient background (top-lighter → bottom-darker blue) ──────────────
    # Draw gradient on a full canvas, then clip to the rounded rect via mask.
    grad = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd   = ImageDraw.Draw(grad)
    top  = (82, 156, 255)   # lighter blue
    bot  = (0,  55, 185)    # darker blue
    h    = size - 2 * pad
    for i in range(h):
        t  = i / h
        cr = int(top[0] + (bot[0] - top[0]) * t)
        cg = int(top[1] + (bot[1] - top[1]) * t)
        cb = int(top[2] + (bot[2] - top[2]) * t)
        gd.line([(pad, pad + i), (size - pad, pad + i)], fill=(cr, cg, cb, 255))

    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(bg_box, radius=r, fill=255)
    bg_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_layer.paste(grad, mask=mask)
    img = Image.alpha_composite(img, bg_layer)

    d = ImageDraw.Draw(img)

    # ── Document geometry ────────────────────────────────────────────────────
    doc_w = int(size * 0.40)
    doc_h = int(size * 0.50)
    doc_l = (size - doc_w) // 2
    doc_t = int(size * 0.16)
    doc_r = doc_l + doc_w
    doc_b = doc_t + doc_h
    fold  = int(size * 0.09)      # top-right folded corner
    so    = int(size * 0.018)     # shadow offset

    # Drop shadow beneath document
    shadow = [
        (doc_l + so, doc_t + fold + so),
        (doc_r - fold + so, doc_t + so),
        (doc_r + so, doc_t + fold + so),
        (doc_r + so, doc_b + so),
        (doc_l + so, doc_b + so),
    ]
    d.polygon(shadow, fill=(0, 20, 100, 65))

    # Document body
    body = [
        (doc_l,        doc_t + fold),
        (doc_r - fold, doc_t),
        (doc_r,        doc_t + fold),
        (doc_r,        doc_b),
        (doc_l,        doc_b),
    ]
    d.polygon(body, fill=(255, 255, 255, 248))

    # Fold flap (pale blue triangle)
    d.polygon([
        (doc_r - fold, doc_t),
        (doc_r,        doc_t + fold),
        (doc_r - fold, doc_t + fold),
    ], fill=(200, 222, 255, 215))

    # Crease line on fold edge
    lw = max(1, size // 300)
    d.line([
        (doc_r - fold, doc_t),
        (doc_r - fold, doc_t + fold),
        (doc_r,        doc_t + fold),
    ], fill=(170, 205, 255, 160), width=lw)

    # ── Inward compression arrows (→ ←) ─────────────────────────────────────
    cx   = size // 2
    cy   = int(size * 0.560)    # centred in lower half of doc
    gap  = int(size * 0.042)    # half-gap between arrow tips
    slen = int(size * 0.082)    # shaft length
    sh   = int(size * 0.033)    # shaft half-height
    hw   = int(size * 0.054)    # arrowhead depth (along axis)
    hh   = int(size * 0.066)    # arrowhead half-span (perpendicular)
    ac   = (0, 72, 200, 230)    # arrow colour

    # Left arrow → (pointing right toward centre)
    lx = cx - gap
    d.rectangle([lx - slen, cy - sh, lx - hw // 2, cy + sh], fill=ac)
    d.polygon([(lx, cy), (lx - hw, cy - hh), (lx - hw, cy + hh)], fill=ac)

    # Right arrow ← (pointing left toward centre)
    rx = cx + gap
    d.rectangle([rx + hw // 2, cy - sh, rx + slen, cy + sh], fill=ac)
    d.polygon([(rx, cy), (rx + hw, cy - hh), (rx + hw, cy + hh)], fill=ac)

    return img


ICONSET_SIZES = [
    ("icon_16x16.png",      16),
    ("icon_16x16@2x.png",   32),
    ("icon_32x32.png",      32),
    ("icon_32x32@2x.png",   64),
    ("icon_128x128.png",    128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png",    256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png",    512),
    ("icon_512x512@2x.png", 1024),
]


def main():
    src = draw_icon(1024)
    src.save(ASSETS / "icon-1024.png")
    print("✓ Drew icon-1024.png")

    if ICONSET.exists():
        shutil.rmtree(ICONSET)
    ICONSET.mkdir()

    for filename, px in ICONSET_SIZES:
        resized = src.resize((px, px), Image.LANCZOS)
        resized.save(ICONSET / filename)
    print(f"✓ Generated {len(ICONSET_SIZES)} iconset sizes")

    icns_path = ASSETS / "FilePress.icns"
    subprocess.run(
        ["iconutil", "-c", "icns", str(ICONSET), "-o", str(icns_path)],
        check=True,
    )
    print(f"✓ Created {icns_path}")


if __name__ == "__main__":
    main()
