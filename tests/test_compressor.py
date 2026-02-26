import pytest
import os
from pathlib import Path
from PIL import Image
import tempfile
from src.compressor import compress_image, get_file_size_kb

FIXTURES = Path(__file__).parent / "fixtures"

def make_test_jpeg(path, size=(800, 600)):
    img = Image.new("RGB", size, color=(100, 150, 200))
    img.save(path, "JPEG", quality=95)

def make_test_png(path, size=(800, 600)):
    img = Image.new("RGB", size, color=(100, 150, 200))
    img.save(path, "PNG")


def test_get_file_size_kb():
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
        f.write(b"x" * 1024)
        path = f.name
    assert get_file_size_kb(path) == pytest.approx(1.0, abs=0.1)
    os.unlink(path)


def test_compress_image_quality_mode(tmp_path):
    src = tmp_path / "test.jpg"
    make_test_jpeg(src)
    original_size = get_file_size_kb(src)
    out = tmp_path / "out.jpg"
    compress_image(str(src), str(out), quality=30)
    assert out.exists()
    assert get_file_size_kb(out) < original_size


def test_compress_image_target_size_mode(tmp_path):
    src = tmp_path / "test.jpg"
    make_test_jpeg(src, size=(2000, 1500))
    out = tmp_path / "out.jpg"
    target_kb = 100
    result = compress_image(str(src), str(out), target_kb=target_kb)
    assert out.exists()
    assert get_file_size_kb(out) <= target_kb * 1.05  # 5% tolerance
    assert result["success"] is True


def test_compress_image_already_small(tmp_path):
    src = tmp_path / "tiny.jpg"
    make_test_jpeg(src, size=(50, 50))
    out = tmp_path / "out.jpg"
    result = compress_image(str(src), str(out), target_kb=500)
    assert result["already_small"] is True


def test_compress_png(tmp_path):
    src = tmp_path / "test.png"
    make_test_png(src)
    out = tmp_path / "out.png"
    result = compress_image(str(src), str(out), quality=60)
    assert out.exists()
    assert result["success"] is True
