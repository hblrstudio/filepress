import os
import io
from pathlib import Path
from PIL import Image, UnidentifiedImageError

# Module-level constants
MAX_QUALITY = 95
MIN_QUALITY = 0
BINARY_SEARCH_ITERATIONS = 12
TARGET_KB_TOLERANCE = 1.05
DEFAULT_QUALITY = 75
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


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

    # Guard: source file must exist
    if not path.exists():
        raise FileNotFoundError(f"Source file not found: {src}")

    ext = path.suffix.lower()

    # Guard: unsupported format
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file format '{ext}'. Supported formats: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    # Guard: default quality when neither quality nor target_kb is supplied
    if quality is None and target_kb is None:
        quality = DEFAULT_QUALITY

    original_kb = get_file_size_kb(src)

    # Guard: corrupt or unreadable files
    try:
        img = Image.open(src)
        img.load()  # Force full load to catch corrupt files early
    except UnidentifiedImageError as e:
        raise UnidentifiedImageError(f"Cannot identify image file (possibly corrupt): {src}") from e
    except OSError as e:
        raise OSError(f"Failed to open image file: {src}") from e

    # Convert RGBA/P to RGB for all output formats (JPEG cannot handle alpha,
    # and keeping RGBA in PNG paths causes unnecessary complexity).
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Determine output format based on source extension.
    # HEIC is treated as JPEG for v1 simplicity.
    if ext == ".png":
        fmt = "PNG"
        save_ext = ".png"
    else:
        fmt = "JPEG"
        save_ext = ".jpg"

    # Adjust dst extension to match format
    dst_path = Path(dst).with_suffix(save_ext)

    if target_kb is not None:
        if original_kb <= target_kb:
            if fmt == "PNG":
                img.save(str(dst_path), fmt, optimize=True)
            else:
                img.save(str(dst_path), fmt, quality=MAX_QUALITY, optimize=True)
            return {
                "success": True,
                "already_small": True,
                "original_kb": original_kb,
                "final_kb": get_file_size_kb(str(dst_path)),
                "quality_used": MAX_QUALITY,
                "output_path": str(dst_path),
            }

        # Binary search for quality (JPEG only; PNG compression is lossless)
        if fmt == "JPEG":
            lo, hi = 5, MAX_QUALITY
            best_quality = lo
            for _ in range(BINARY_SEARCH_ITERATIONS):
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
                "success": final_kb <= target_kb * TARGET_KB_TOLERANCE,
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
                "success": final_kb <= target_kb * TARGET_KB_TOLERANCE,
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
        q = max(MIN_QUALITY, min(MAX_QUALITY, quality))
        img.save(str(dst_path), fmt, quality=q, optimize=True)

    return {
        "success": True,
        "already_small": False,
        "original_kb": original_kb,
        "final_kb": get_file_size_kb(str(dst_path)),
        "quality_used": q,
        "output_path": str(dst_path),
    }
