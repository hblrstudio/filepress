import os
import io
from pathlib import Path
from PIL import Image


def get_file_size_kb(path: str) -> float:
    return os.path.getsize(path) / 1024


def compress_image(src: str, dst: str, quality: int = None, target_kb: float = None) -> dict:
    """
    Compress an image file.
    - quality mode: encode at given quality (0-95)
    - target_kb mode: binary search to find quality that hits target
    Returns dict with keys: success, already_small, original_kb, final_kb, quality_used, output_path
    """
    path = Path(src)
    ext = path.suffix.lower()
    original_kb = get_file_size_kb(src)

    img = Image.open(src)

    # Determine output format based on source extension
    if ext == ".png":
        fmt = "PNG"
        save_ext = ".png"
        # PNG does not need RGBA->RGB conversion
    else:
        fmt = "JPEG"
        save_ext = ".jpg"
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

    # Adjust dst extension to match format
    dst_path = Path(dst).with_suffix(save_ext)

    if target_kb is not None:
        if original_kb <= target_kb:
            if fmt == "PNG":
                img.save(str(dst_path), fmt, optimize=True)
            else:
                img.save(str(dst_path), fmt, quality=95, optimize=True)
            return {
                "success": True,
                "already_small": True,
                "original_kb": original_kb,
                "final_kb": get_file_size_kb(str(dst_path)),
                "quality_used": 95,
                "output_path": str(dst_path),
            }

        # Binary search for quality (JPEG only; PNG compression is lossless)
        if fmt == "JPEG":
            lo, hi = 5, 95
            best_quality = lo
            for _ in range(12):  # max 12 iterations
                mid = (lo + hi) // 2
                buf = io.BytesIO()
                img.save(buf, fmt, quality=mid, optimize=True)
                size_kb = buf.tell() / 1024
                if size_kb <= target_kb:
                    best_quality = mid
                    lo = mid + 1
                else:
                    hi = mid - 1

            img.save(str(dst_path), fmt, quality=best_quality, optimize=True)
            final_kb = get_file_size_kb(str(dst_path))
            return {
                "success": final_kb <= target_kb * 1.05,
                "already_small": False,
                "original_kb": original_kb,
                "final_kb": final_kb,
                "quality_used": best_quality,
                "output_path": str(dst_path),
            }
        else:
            # PNG: just save with optimize
            img.save(str(dst_path), fmt, optimize=True)
            final_kb = get_file_size_kb(str(dst_path))
            return {
                "success": final_kb <= target_kb * 1.05,
                "already_small": False,
                "original_kb": original_kb,
                "final_kb": final_kb,
                "quality_used": None,
                "output_path": str(dst_path),
            }

    # Quality mode
    if fmt == "PNG":
        img.save(str(dst_path), fmt, optimize=True)
        q = quality
    else:
        q = max(1, min(95, quality))
        img.save(str(dst_path), fmt, quality=q, optimize=True)

    return {
        "success": True,
        "already_small": False,
        "original_kb": original_kb,
        "final_kb": get_file_size_kb(str(dst_path)),
        "quality_used": q,
        "output_path": str(dst_path),
    }
