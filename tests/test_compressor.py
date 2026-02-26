import pytest
import os
from pathlib import Path
from PIL import Image
import tempfile
from src.compressor import compress_image, compress_pdf, get_file_size_kb

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


def test_compress_rgba_image(tmp_path):
    """RGBA images should be handled without error."""
    src = tmp_path / "test.png"
    img = Image.new("RGBA", (200, 200), color=(100, 150, 200, 128))
    img.save(src, "PNG")
    out = tmp_path / "out.png"
    result = compress_image(str(src), str(out), quality=80)
    assert out.exists()
    assert result["success"] is True


def test_compress_png_target_size(tmp_path):
    """PNG files should work in target_kb mode."""
    src = tmp_path / "test.png"
    make_test_png(src, size=(1000, 800))
    out = tmp_path / "out.png"
    result = compress_image(str(src), str(out), target_kb=500)
    assert out.exists()
    assert "success" in result
    assert "already_small" in result
    assert "original_kb" in result
    assert "final_kb" in result
    assert "output_path" in result


def test_compress_image_returns_all_keys(tmp_path):
    """Return dict must contain all required keys."""
    src = tmp_path / "test.jpg"
    make_test_jpeg(src)
    out = tmp_path / "out.jpg"
    result = compress_image(str(src), str(out), quality=75)
    for key in ["success", "already_small", "original_kb", "final_kb", "quality_used", "output_path"]:
        assert key in result, f"Missing key: {key}"


def test_compress_image_missing_file(tmp_path):
    out = tmp_path / "out.jpg"
    with pytest.raises((FileNotFoundError, OSError)):
        compress_image("/nonexistent/file.jpg", str(out), quality=75)


def test_compress_image_unsupported_format(tmp_path):
    src = tmp_path / "test.svg"
    src.write_text("<svg></svg>")
    out = tmp_path / "out.jpg"
    with pytest.raises(ValueError):
        compress_image(str(src), str(out), quality=75)


def test_compress_image_default_quality(tmp_path):
    """Calling with no quality or target_kb should not crash."""
    src = tmp_path / "test.jpg"
    make_test_jpeg(src)
    out = tmp_path / "out.jpg"
    result = compress_image(str(src), str(out))
    assert result["success"] is True


def test_compress_pdf_quality_mode(tmp_path):
    """PDF compression in quality mode should succeed."""
    import pikepdf
    src = tmp_path / "test.pdf"
    pdf = pikepdf.new()
    pdf.add_blank_page(page_size=(612, 792))
    pdf.save(str(src))
    out = tmp_path / "out.pdf"
    result = compress_pdf(str(src), str(out), quality=50)
    assert out.exists()
    assert result["success"] is True


def test_compress_pdf_strips_metadata(tmp_path):
    """PDF compression should strip metadata."""
    import pikepdf
    src = tmp_path / "test.pdf"
    pdf = pikepdf.new()
    with pdf.open_metadata() as meta:
        meta["dc:title"] = "Test Document"
    pdf.add_blank_page(page_size=(612, 792))
    pdf.save(str(src))
    out = tmp_path / "out.pdf"
    compress_pdf(str(src), str(out), quality=80)
    result_pdf = pikepdf.open(str(out))
    with result_pdf.open_metadata() as meta:
        assert "dc:title" not in meta


def test_compress_pdf_returns_all_keys(tmp_path):
    """compress_pdf should return all required dict keys."""
    import pikepdf
    src = tmp_path / "test.pdf"
    pdf = pikepdf.new()
    pdf.add_blank_page(page_size=(612, 792))
    pdf.save(str(src))
    out = tmp_path / "out.pdf"
    result = compress_pdf(str(src), str(out), quality=75)
    for key in ["success", "already_small", "original_kb", "final_kb", "output_path", "quality_used"]:
        assert key in result, f"Missing key: {key}"


def test_compress_pdf_missing_file(tmp_path):
    """Missing PDF file should raise FileNotFoundError or OSError."""
    out = tmp_path / "out.pdf"
    with pytest.raises((FileNotFoundError, OSError)):
        compress_pdf("/nonexistent/file.pdf", str(out), quality=75)


def test_compress_pdf_already_small(tmp_path):
    """If PDF is already smaller than target, already_small should be True."""
    import pikepdf
    src = tmp_path / "test.pdf"
    pdf = pikepdf.new()
    pdf.add_blank_page(page_size=(612, 792))
    pdf.save(str(src))
    out = tmp_path / "out.pdf"
    result = compress_pdf(str(src), str(out), target_kb=10000)
    assert result["already_small"] is True
