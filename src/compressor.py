import os
import io
import re
import sys
import subprocess
import tempfile
import threading
from pathlib import Path
from PIL import Image, UnidentifiedImageError
import pikepdf

# Module-level constants

# Image compression constants
MAX_QUALITY = 95
MIN_QUALITY = 0
JPEG_MIN_QUALITY = 20        # Lowest quality used in binary search; prevents visually destroyed output
BINARY_SEARCH_ITERATIONS = 12
TARGET_KB_TOLERANCE = 1.05
DEFAULT_QUALITY = 75
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}

# Video compression constants
VIDEO_EXTENSIONS = {".mp4", ".mov"}
VIDEO_CRF_MIN = 18   # Near-lossless (quality slider → 95)
VIDEO_CRF_MAX = 45   # Heavily compressed (quality slider → 1)
VIDEO_AUDIO_BPS = 128_000  # 128 kbps AAC audio reserved for bitrate calculations
VIDEO_MIN_VIDEO_BPS = 50_000  # 50 kbps minimum video bitrate floor


def _ffmpeg_exe() -> str:
    """Return path to ffmpeg — prefers imageio-ffmpeg bundled binary, falls back to system PATH."""
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def _video_info(src: str, ffmpeg: str) -> dict:
    """
    Extract duration, dimensions and audio presence from a video file.
    Uses ffmpeg -i (which writes info to stderr even with no output file).
    """
    result = subprocess.run(
        [ffmpeg, "-i", src],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    stderr = result.stderr

    # Duration: 00:01:23.45
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", stderr)
    duration_s = 0.0
    if m:
        h, mi, s = m.groups()
        duration_s = int(h) * 3600 + int(mi) * 60 + float(s)

    # Video stream: width×height (e.g. "1920x1080")
    vm = re.search(r"Video:.*?\b(\d{2,5})x(\d{2,5})\b", stderr)
    width  = int(vm.group(1)) if vm else 0
    height = int(vm.group(2)) if vm else 0

    has_audio = "Audio:" in stderr

    return {"duration_s": duration_s, "width": width, "height": height, "has_audio": has_audio}


def _run_encode(
    ffmpeg: str,
    cmd_args: list,
    duration_s: float,
    progress_callback=None,
    phase: int = 0,
    total_phases: int = 1,
    capture_progress: bool = True,
) -> int:
    """
    Run an ffmpeg command.  When capture_progress=True (default) injects
    -progress pipe:1 -nostats before the last argument (output path) and
    reports incremental progress via callback(pct: float).
    Returns the ffmpeg exit code; raises RuntimeError on non-zero exit.
    """
    if capture_progress:
        # Insert -progress pipe:1 -nostats before the output path (last arg)
        out_path = cmd_args[-1]
        cmd = cmd_args[:-1] + ["-progress", "pipe:1", "-nostats", out_path]
        stdout_mode = subprocess.PIPE
    else:
        cmd = cmd_args
        stdout_mode = subprocess.DEVNULL

    stderr_buf = []

    proc = subprocess.Popen(
        cmd,
        stdout=stdout_mode,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
    )

    # Drain stderr on a background thread so the pipe never blocks
    def _drain():
        for line in proc.stderr:
            stderr_buf.append(line)

    t = threading.Thread(target=_drain, daemon=True)
    t.start()

    if capture_progress and proc.stdout:
        for line in proc.stdout:
            line = line.strip()
            if line.startswith("out_time_ms=") and duration_s > 0:
                try:
                    # ffmpeg names this _ms but the unit is actually microseconds
                    us = int(line.split("=", 1)[1])
                    if us > 0:
                        phase_pct = min(100.0, us / (duration_s * 1_000_000) * 100)
                        overall = (phase * 100.0 + phase_pct) / total_phases
                        if progress_callback:
                            progress_callback(min(99.0, overall))
                except (ValueError, TypeError):
                    pass

    rc = proc.wait()
    t.join(timeout=5)

    if rc != 0:
        excerpt = "".join(stderr_buf[-15:]).strip()
        raise RuntimeError(f"ffmpeg exited {rc}: {excerpt}")

    return rc


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

    # Determine output format based on source extension.
    # HEIC is treated as JPEG for v1 simplicity.
    if ext == ".png":
        fmt = "PNG"
        save_ext = ".png"
    else:
        fmt = "JPEG"
        save_ext = ".jpg"

    # Convert colour mode per output format.
    # PNG preserves transparency (RGBA); JPEG has no alpha channel so composite over white.
    if fmt == "JPEG":
        if img.mode == "P":
            img = img.convert("RGBA")
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])  # use alpha channel as compositing mask
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")
    elif img.mode == "P":
        img = img.convert("RGBA")  # preserve palette transparency in PNG output

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
            lo, hi = JPEG_MIN_QUALITY, MAX_QUALITY
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

            # Try one quality step higher: if it fits within tolerance use it
            # (binary search finds the floor; this gets us closer to the target)
            if best_quality < MAX_QUALITY:
                buf = io.BytesIO()
                img.save(buf, fmt, quality=best_quality + 1, optimize=True)
                if buf.tell() / 1024 <= target_kb * TARGET_KB_TOLERANCE:
                    best_quality += 1

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


def compress_pdf(src: str, dst: str, quality: int = None, target_kb: float = None) -> dict:
    """
    Compress a PDF by stripping metadata and recompressing streams.
    In v1, compression is metadata stripping only — DPI-based image downsampling
    is not yet implemented.

    - quality mode: strips metadata and recompresses streams
    - target_kb mode: strips metadata and recompresses streams; reports whether
      target was met

    Returns dict with keys: success, already_small, original_kb, final_kb, output_path, quality_used
    """
    src_path = Path(src)
    if not src_path.exists():
        raise FileNotFoundError(f"Source file not found: {src}")

    if src_path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a .pdf file, got '{src_path.suffix}'")

    # Default quality
    if quality is None and target_kb is None:
        quality = 75

    if quality is not None:
        quality = max(0, min(100, quality))

    original_kb = get_file_size_kb(src)

    def _save_compressed() -> float:
        """Open, strip metadata, compress streams, save. Returns final size in KB."""
        try:
            pdf = pikepdf.open(src)
        except Exception as e:
            raise OSError(f"Cannot open PDF: {src}") from e

        with pdf.open_metadata() as meta:
            for key in list(meta.keys()):
                del meta[key]

        pdf.save(dst, compress_streams=True, recompress_flate=True)
        return get_file_size_kb(dst)

    if target_kb is not None:
        if original_kb <= target_kb:
            final_kb = _save_compressed()
            return {
                "success": True,
                "already_small": True,
                "original_kb": original_kb,
                "final_kb": final_kb,
                "output_path": dst,
                "quality_used": None,
            }

        final_kb = _save_compressed()
        return {
            "success": final_kb <= target_kb * TARGET_KB_TOLERANCE,
            "already_small": False,
            "original_kb": original_kb,
            "final_kb": final_kb,
            "output_path": dst,
            "quality_used": None,
        }

    # Quality mode
    final_kb = _save_compressed()
    return {
        "success": True,
        "already_small": False,
        "original_kb": original_kb,
        "final_kb": final_kb,
        "output_path": dst,
        "quality_used": None,
    }


def compress_video(
    src: str,
    dst: str,
    quality: int = None,
    target_kb: float = None,
    progress_callback=None,
) -> dict:
    """
    Compress a video file to MP4 (H.264 + AAC).

    - quality mode: single-pass CRF encode  (quality 1→95 maps to CRF 45→18)
    - target_kb mode: direct bitrate calculation + 2-pass VBR encode for accuracy

    progress_callback(pct: float) — called with 0–100 during encoding.
    Returns dict: success, already_small, original_kb, final_kb, quality_used, output_path.
    Always writes a .mp4 file regardless of input extension.
    """
    src_path = Path(src)
    if not src_path.exists():
        raise FileNotFoundError(f"Source file not found: {src}")

    ext = src_path.suffix.lower()
    if ext not in VIDEO_EXTENSIONS:
        raise ValueError(
            f"Unsupported video format '{ext}'. Supported: {', '.join(sorted(VIDEO_EXTENSIONS))}"
        )

    if quality is None and target_kb is None:
        quality = DEFAULT_QUALITY

    # Always output as .mp4 for maximum compatibility
    dst_path = Path(dst).with_suffix(".mp4")
    dst_path.parent.mkdir(parents=True, exist_ok=True)

    ffmpeg = _ffmpeg_exe()
    original_kb = get_file_size_kb(src)

    info = _video_info(src, ffmpeg)
    duration_s = info["duration_s"]
    if duration_s <= 0:
        raise ValueError(f"Could not determine video duration for: {src}")

    has_audio = info["has_audio"]
    # Default audio args for quality mode (128kbps AAC)
    audio_args = ["-c:a", "aac", "-b:a", "128k"] if has_audio else ["-an"]

    # ── Target size mode ────────────────────────────────────────────────────────
    if target_kb is not None:
        if original_kb <= target_kb * TARGET_KB_TOLERANCE:
            # Already at or below target — copy without re-encoding
            import shutil
            shutil.copy2(src, str(dst_path))
            return {
                "success": True,
                "already_small": True,
                "original_kb": original_kb,
                "final_kb": get_file_size_kb(str(dst_path)),
                "quality_used": None,
                "output_path": str(dst_path),
            }

        # Calculate required video bitrate from target file size and duration.
        # Subtract audio budget; scale audio down proportionally on very tight targets
        # so the codec can get as close as possible (minimum 32kbps for intelligible audio).
        total_bps = (target_kb * 8 * 1000) / duration_s
        if has_audio:
            # Allow audio up to 30% of budget, but never more than 128kbps
            audio_bps = min(VIDEO_AUDIO_BPS, max(32_000, int(total_bps * 0.3)))
        else:
            audio_bps = 0
        video_bps = max(VIDEO_MIN_VIDEO_BPS, int(total_bps - audio_bps))
        target_audio_args = ["-c:a", "aac", "-b:a", f"{audio_bps // 1000}k"] if has_audio else ["-an"]

        null_out = "NUL" if sys.platform == "win32" else "/dev/null"

        if progress_callback:
            progress_callback(0.0)

        with tempfile.TemporaryDirectory() as tmpdir:
            passlog = str(Path(tmpdir) / "ffmpeg2pass")

            # Pass 1 — analysis (writes passlog, no output video)
            pass1_cmd = [
                ffmpeg, "-y", "-i", src,
                "-c:v", "libx264",
                "-b:v", str(int(video_bps)),
                "-pass", "1", "-passlogfile", passlog,
                "-an", "-f", "null", null_out,
            ]
            _run_encode(ffmpeg, pass1_cmd, duration_s, capture_progress=False)

            # Pass 2 — encode with optimal bit distribution from pass 1 log
            pass2_cmd = [
                ffmpeg, "-y", "-i", src,
                "-c:v", "libx264",
                "-b:v", str(int(video_bps)),
                "-pass", "2", "-passlogfile", passlog,
                *target_audio_args,
                "-movflags", "+faststart",
                str(dst_path),
            ]
            _run_encode(
                ffmpeg, pass2_cmd, duration_s,
                progress_callback=progress_callback,
                capture_progress=True,
            )

        if progress_callback:
            progress_callback(100.0)

        final_kb = get_file_size_kb(str(dst_path))
        return {
            "success": final_kb <= target_kb * TARGET_KB_TOLERANCE,
            "already_small": False,
            "original_kb": original_kb,
            "final_kb": final_kb,
            "quality_used": None,
            "output_path": str(dst_path),
        }

    # ── Quality mode — single-pass CRF encode ──────────────────────────────────
    # Map quality (1–95) → CRF (45→18): higher quality = lower CRF = better output
    crf = round(VIDEO_CRF_MAX - (quality / MAX_QUALITY) * (VIDEO_CRF_MAX - VIDEO_CRF_MIN))
    crf = max(VIDEO_CRF_MIN, min(VIDEO_CRF_MAX, crf))

    cmd = [
        ffmpeg, "-y", "-i", src,
        "-c:v", "libx264", "-crf", str(crf),
        *audio_args,
        "-movflags", "+faststart",
        str(dst_path),
    ]
    _run_encode(
        ffmpeg, cmd, duration_s,
        progress_callback=progress_callback,
        capture_progress=True,
    )

    if progress_callback:
        progress_callback(100.0)

    final_kb = get_file_size_kb(str(dst_path))
    return {
        "success": True,
        "already_small": False,
        "original_kb": original_kb,
        "final_kb": final_kb,
        "quality_used": quality,
        "output_path": str(dst_path),
    }
