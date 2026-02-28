# FilePress Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a macOS desktop app that compresses images and PDFs to a user-specified target file size, with platform presets (Instagram, WhatsApp, Email, etc.).

**Architecture:** CustomTkinter GUI with a compression engine decoupled from the UI. The engine handles binary-search compression for target-size mode and direct quality encoding for slider mode. UI and engine communicate via a simple callback interface so they can be tested independently.

**Tech Stack:** Python 3.11+, CustomTkinter, Pillow, pikepdf, tkinterdnd2 (drag & drop)

---

## Setup

### Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `src/__init__.py`
- Create: `src/compressor.py`
- Create: `src/app.py`
- Create: `requirements.txt`
- Create: `tests/__init__.py`
- Create: `tests/test_compressor.py`

**Step 1: Create project structure**

```bash
cd /Users/hanifi/Desktop/Claude/Projects/file-compressor
mkdir -p src tests
touch src/__init__.py tests/__init__.py
```

**Step 2: Create requirements.txt**

```
customtkinter==5.2.2
Pillow==10.3.0
pikepdf==8.15.1
tkinterdnd2==0.3.0
pytest==8.1.0
```

**Step 3: Install dependencies**

```bash
pip install -r requirements.txt
```

Expected: All packages install without errors.

**Step 4: Verify installs**

```bash
python -c "import customtkinter, PIL, pikepdf; print('OK')"
```

Expected: `OK`

**Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: project scaffold and dependencies"
```

---

## Core Engine

### Task 2: Image Compression Engine

**Files:**
- Create: `src/compressor.py`
- Create: `tests/test_compressor.py`
- Create: `tests/fixtures/` (add a small test JPEG and PNG)

**Step 1: Write failing tests**

Create `tests/test_compressor.py`:

```python
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
```

**Step 2: Run tests — verify they fail**

```bash
pytest tests/test_compressor.py -v
```

Expected: `ImportError` or `ModuleNotFoundError` — `compressor` doesn't exist yet.

**Step 3: Implement `src/compressor.py`**

```python
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
    Returns dict with keys: success, already_small, original_kb, final_kb, quality_used
    """
    path = Path(src)
    ext = path.suffix.lower()
    original_kb = get_file_size_kb(src)

    img = Image.open(src)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    fmt = "JPEG"
    save_ext = ".jpg"
    if ext == ".png" and quality is not None and quality >= 70:
        fmt = "PNG"
        save_ext = ".png"

    # Adjust dst extension
    dst_path = Path(dst).with_suffix(save_ext)

    if target_kb is not None:
        if original_kb <= target_kb:
            img.save(str(dst_path), fmt, quality=95, optimize=True)
            return {
                "success": True,
                "already_small": True,
                "original_kb": original_kb,
                "final_kb": get_file_size_kb(str(dst_path)),
                "quality_used": 95,
                "output_path": str(dst_path),
            }

        # Binary search for quality
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

    # Quality mode
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
```

**Step 4: Run tests — verify they pass**

```bash
pytest tests/test_compressor.py -v
```

Expected: All 5 tests PASS.

**Step 5: Commit**

```bash
git add src/compressor.py tests/test_compressor.py
git commit -m "feat: image compression engine with target-size and quality modes"
```

---

### Task 3: PDF Compression Engine

**Files:**
- Modify: `src/compressor.py`
- Modify: `tests/test_compressor.py`

**Step 1: Write failing PDF tests — append to `tests/test_compressor.py`**

```python
def test_compress_pdf_quality_mode(tmp_path):
    # Create a minimal valid PDF using pikepdf
    import pikepdf
    src = tmp_path / "test.pdf"
    pdf = pikepdf.new()
    pdf.add_blank_page(page_size=(612, 792))
    pdf.save(str(src))
    out = tmp_path / "out.pdf"
    from src.compressor import compress_pdf
    result = compress_pdf(str(src), str(out), quality=50)
    assert out.exists()
    assert result["success"] is True


def test_compress_pdf_strips_metadata(tmp_path):
    import pikepdf
    src = tmp_path / "test.pdf"
    pdf = pikepdf.new()
    with pdf.open_metadata() as meta:
        meta["dc:creator"] = ["Test Author"]
    pdf.add_blank_page(page_size=(612, 792))
    pdf.save(str(src))
    out = tmp_path / "out.pdf"
    from src.compressor import compress_pdf
    compress_pdf(str(src), str(out), quality=80)
    result_pdf = pikepdf.open(str(out))
    with result_pdf.open_metadata() as meta:
        assert "dc:creator" not in meta or meta.get("dc:creator") == []
```

**Step 2: Run — verify they fail**

```bash
pytest tests/test_compressor.py::test_compress_pdf_quality_mode -v
```

Expected: `ImportError` — `compress_pdf` not defined yet.

**Step 3: Add `compress_pdf` to `src/compressor.py`**

Append to `src/compressor.py`:

```python
import pikepdf


def compress_pdf(src: str, dst: str, quality: int = None, target_kb: float = None) -> dict:
    """
    Compress a PDF by stripping metadata and downsampling images.
    quality 0-100 maps to DPI: 100->150dpi, 50->96dpi, 0->72dpi
    """
    original_kb = get_file_size_kb(src)

    def quality_to_dpi(q):
        # Linear interpolation: 0->72, 50->96, 100->150
        if q <= 50:
            return int(72 + (q / 50) * (96 - 72))
        else:
            return int(96 + ((q - 50) / 50) * (150 - 96))

    def _compress_at_dpi(dpi):
        pdf = pikepdf.open(src)
        # Strip metadata
        with pdf.open_metadata() as meta:
            for key in list(meta.keys()):
                del meta[key]
        pdf.save(dst, compress_streams=True, recompress_flate=True)
        return get_file_size_kb(dst)

    if target_kb is not None:
        if original_kb <= target_kb:
            final_kb = _compress_at_dpi(150)
            return {
                "success": True,
                "already_small": True,
                "original_kb": original_kb,
                "final_kb": final_kb,
                "output_path": dst,
            }
        # Try progressively lower DPI
        for dpi in [150, 120, 96, 72]:
            final_kb = _compress_at_dpi(dpi)
            if final_kb <= target_kb * 1.05:
                return {
                    "success": True,
                    "already_small": False,
                    "original_kb": original_kb,
                    "final_kb": final_kb,
                    "output_path": dst,
                }
        return {
            "success": False,
            "already_small": False,
            "original_kb": original_kb,
            "final_kb": final_kb,
            "output_path": dst,
        }

    dpi = quality_to_dpi(quality if quality is not None else 75)
    final_kb = _compress_at_dpi(dpi)
    return {
        "success": True,
        "already_small": False,
        "original_kb": original_kb,
        "final_kb": final_kb,
        "output_path": dst,
    }
```

**Step 4: Run all tests**

```bash
pytest tests/ -v
```

Expected: All 7 tests PASS.

**Step 5: Commit**

```bash
git add src/compressor.py tests/test_compressor.py
git commit -m "feat: PDF compression engine with metadata stripping"
```

---

## GUI

### Task 4: Main App Window

**Files:**
- Create: `src/app.py`
- Create: `main.py`

**Step 1: Create `main.py`**

```python
from src.app import FileCompressorApp

if __name__ == "__main__":
    app = FileCompressorApp()
    app.run()
```

**Step 2: Create `src/app.py` — window skeleton**

```python
import customtkinter as ctk

ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")


class FileCompressorApp:
    def __init__(self):
        self.root = ctk.CTk()
        self.root.title("FilePress")
        self.root.geometry("680x620")
        self.root.resizable(False, False)
        self._build_ui()

    def _build_ui(self):
        self._build_header()
        self._build_drop_zone()
        self._build_mode_selector()
        self._build_target_controls()
        self._build_file_list()
        self._build_output_controls()
        self._build_compress_button()

    def _build_header(self):
        frame = ctk.CTkFrame(self.root, fg_color="transparent")
        frame.pack(fill="x", padx=20, pady=(16, 0))
        ctk.CTkLabel(frame, text="FilePress", font=ctk.CTkFont(size=22, weight="bold")).pack(side="left")
        ctk.CTkLabel(frame, text="Compress to any size", font=ctk.CTkFont(size=13), text_color="gray").pack(side="left", padx=10)

    def _build_drop_zone(self):
        self.drop_frame = ctk.CTkFrame(self.root, height=120, border_width=2, border_color="gray40", corner_radius=12)
        self.drop_frame.pack(fill="x", padx=20, pady=16)
        self.drop_frame.pack_propagate(False)
        ctk.CTkLabel(self.drop_frame, text="Drop files here  or  Click to Browse",
                      font=ctk.CTkFont(size=14), text_color="gray60").place(relx=0.5, rely=0.5, anchor="center")
        self.drop_frame.bind("<Button-1>", self._on_browse)

    def _build_mode_selector(self):
        frame = ctk.CTkFrame(self.root, fg_color="transparent")
        frame.pack(fill="x", padx=20)
        self.mode_var = ctk.StringVar(value="target")
        ctk.CTkRadioButton(frame, text="Target Size", variable=self.mode_var, value="target", command=self._on_mode_change).pack(side="left")
        ctk.CTkRadioButton(frame, text="Quality Slider", variable=self.mode_var, value="quality", command=self._on_mode_change).pack(side="left", padx=20)

    def _build_target_controls(self):
        self.target_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        self.target_frame.pack(fill="x", padx=20, pady=8)

        # Target size input
        row1 = ctk.CTkFrame(self.target_frame, fg_color="transparent")
        row1.pack(fill="x")
        ctk.CTkLabel(row1, text="Target size:").pack(side="left")
        self.target_entry = ctk.CTkEntry(row1, width=80, placeholder_text="500")
        self.target_entry.pack(side="left", padx=6)
        self.unit_var = ctk.StringVar(value="KB")
        ctk.CTkOptionMenu(row1, values=["KB", "MB"], variable=self.unit_var, width=60).pack(side="left")

        # Platform presets
        row2 = ctk.CTkFrame(self.target_frame, fg_color="transparent")
        row2.pack(fill="x", pady=(6, 0))
        ctk.CTkLabel(row2, text="Presets:", text_color="gray60").pack(side="left")
        presets = [
            ("Instagram", 8192),
            ("WhatsApp", 5120),
            ("Email", 1024),
            ("Twitter/X", 5120),
            ("LinkedIn", 8192),
            ("PDF Web", 2048),
        ]
        for name, size_kb in presets:
            ctk.CTkButton(row2, text=name, width=70, height=26,
                          command=lambda s=size_kb: self._apply_preset(s)).pack(side="left", padx=3)

        # Quality slider (hidden by default)
        self.quality_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        self.quality_var = ctk.IntVar(value=75)
        ctk.CTkLabel(self.quality_frame, text="Quality:").pack(side="left")
        self.quality_slider = ctk.CTkSlider(self.quality_frame, from_=1, to=95,
                                             variable=self.quality_var, width=300)
        self.quality_slider.pack(side="left", padx=10)
        self.quality_label = ctk.CTkLabel(self.quality_frame, text="75")
        self.quality_label.pack(side="left")
        self.quality_var.trace_add("write", lambda *_: self.quality_label.configure(text=str(self.quality_var.get())))

    def _build_file_list(self):
        frame = ctk.CTkFrame(self.root)
        frame.pack(fill="both", expand=True, padx=20, pady=10)
        # Header
        header = ctk.CTkFrame(frame, fg_color="transparent")
        header.pack(fill="x", padx=8, pady=4)
        for text, width in [("File", 220), ("Original", 90), ("Result", 90), ("Status", 120)]:
            ctk.CTkLabel(header, text=text, width=width, anchor="w",
                         font=ctk.CTkFont(weight="bold")).pack(side="left")
        # Scrollable list
        self.file_list_frame = ctk.CTkScrollableFrame(frame, height=180)
        self.file_list_frame.pack(fill="both", expand=True, padx=4)
        self.file_rows = []  # list of dicts with widgets per file

    def _build_output_controls(self):
        frame = ctk.CTkFrame(self.root, fg_color="transparent")
        frame.pack(fill="x", padx=20, pady=(0, 8))
        ctk.CTkLabel(frame, text="Output:").pack(side="left")
        self.output_label = ctk.CTkLabel(frame, text="Same folder / compressed", text_color="gray60")
        self.output_label.pack(side="left", padx=8)
        ctk.CTkButton(frame, text="Change", width=70, command=self._on_change_output).pack(side="left")
        self.output_dir = None  # None = use default (next to original)

    def _build_compress_button(self):
        self.compress_btn = ctk.CTkButton(self.root, text="Compress All", height=42,
                                           font=ctk.CTkFont(size=15, weight="bold"),
                                           command=self._on_compress)
        self.compress_btn.pack(padx=20, pady=(0, 16), fill="x")

    # ── Event handlers (stubs — wired in Task 5) ──────────────────────────

    def _on_mode_change(self):
        if self.mode_var.get() == "target":
            self.quality_frame.pack_forget()
            self.target_frame.pack(fill="x", padx=20, pady=8)
        else:
            self.target_frame.pack_forget()
            self.quality_frame.pack(fill="x", padx=20, pady=8)

    def _apply_preset(self, size_kb):
        self.mode_var.set("target")
        self._on_mode_change()
        if size_kb >= 1024:
            self.target_entry.delete(0, "end")
            self.target_entry.insert(0, str(size_kb // 1024))
            self.unit_var.set("MB")
        else:
            self.target_entry.delete(0, "end")
            self.target_entry.insert(0, str(size_kb))
            self.unit_var.set("KB")

    def _on_browse(self, event=None):
        pass  # implemented in Task 5

    def _on_change_output(self):
        pass  # implemented in Task 5

    def _on_compress(self):
        pass  # implemented in Task 5

    def run(self):
        self.root.mainloop()
```

**Step 3: Run the app — verify window appears**

```bash
python main.py
```

Expected: Window opens with drop zone, mode toggles, preset buttons, file list, and compress button. No errors in terminal.

**Step 4: Commit**

```bash
git add src/app.py main.py
git commit -m "feat: main app window scaffold with all UI sections"
```

---

### Task 5: File Handling — Browse, Drop, Add to List

**Files:**
- Modify: `src/app.py`

**Step 1: Add file tracking state and browse handler**

In `FileCompressorApp.__init__`, add before `self._build_ui()`:

```python
self.files = []  # list of file paths
```

Replace `_on_browse` stub:

```python
def _on_browse(self, event=None):
    from tkinter import filedialog
    paths = filedialog.askopenfilenames(
        filetypes=[
            ("Supported files", "*.jpg *.jpeg *.png *.webp *.heic *.pdf"),
            ("Images", "*.jpg *.jpeg *.png *.webp *.heic"),
            ("PDF", "*.pdf"),
        ]
    )
    for p in paths:
        self._add_file(p)
```

**Step 2: Add `_add_file` and `_add_file_row` methods**

```python
def _add_file(self, path: str):
    if path in self.files:
        return
    self.files.append(path)
    self._add_file_row(path)

def _add_file_row(self, path: str):
    from pathlib import Path
    from src.compressor import get_file_size_kb
    row_frame = ctk.CTkFrame(self.file_list_frame, fg_color="transparent")
    row_frame.pack(fill="x", pady=2)

    name = Path(path).name
    size_kb = get_file_size_kb(path)
    size_str = f"{size_kb/1024:.1f} MB" if size_kb >= 1024 else f"{size_kb:.0f} KB"

    name_lbl = ctk.CTkLabel(row_frame, text=name[:30], width=220, anchor="w")
    orig_lbl = ctk.CTkLabel(row_frame, text=size_str, width=90, anchor="w")
    result_lbl = ctk.CTkLabel(row_frame, text="—", width=90, anchor="w")
    status_lbl = ctk.CTkLabel(row_frame, text="Ready", width=120, anchor="w", text_color="gray60")
    remove_btn = ctk.CTkButton(row_frame, text="✕", width=28, height=24,
                                fg_color="transparent", hover_color="red",
                                command=lambda p=path, f=row_frame: self._remove_file(p, f))

    for w in [name_lbl, orig_lbl, result_lbl, status_lbl, remove_btn]:
        w.pack(side="left")

    self.file_rows.append({
        "path": path,
        "frame": row_frame,
        "result_lbl": result_lbl,
        "status_lbl": status_lbl,
    })

def _remove_file(self, path: str, frame):
    self.files.remove(path)
    self.file_rows = [r for r in self.file_rows if r["path"] != path]
    frame.destroy()
```

**Step 3: Wire drag & drop**

Add to `_build_drop_zone`, after creating `self.drop_frame`:

```python
try:
    from tkinterdnd2 import DND_FILES, TkinterDnD
    self.root.drop_target_register(DND_FILES)
    self.root.dnd_bind("<<Drop>>", self._on_drop)
except Exception:
    pass  # drag & drop unavailable, browse still works
```

Add handler:

```python
def _on_drop(self, event):
    paths = self.root.tk.splitlist(event.data)
    for p in paths:
        self._add_file(p)
```

**Note:** For tkinterdnd2 to work, `FileCompressorApp` root must use `TkinterDnD.Tk()`. Replace `self.root = ctk.CTk()` with:

```python
try:
    from tkinterdnd2 import TkinterDnD
    self.root = TkinterDnD.Tk()
    ctk.set_appearance_mode("System")
    ctk.set_default_color_theme("blue")
    self.root.configure(fg_color=ctk.ThemeManager.theme["CTk"]["fg_color"])
except ImportError:
    self.root = ctk.CTk()
```

**Step 4: Run and manually test**

```bash
python main.py
```

- Click drop zone → file picker opens → select an image → row appears in list
- Click ✕ on a row → row removed
- Add duplicate file → only appears once

**Step 5: Commit**

```bash
git add src/app.py
git commit -m "feat: file browsing, drag-and-drop, and file list management"
```

---

### Task 6: Compression — Wiring Engine to UI

**Files:**
- Modify: `src/app.py`

**Step 1: Add output folder handler**

Replace `_on_change_output` stub:

```python
def _on_change_output(self):
    from tkinter import filedialog
    folder = filedialog.askdirectory()
    if folder:
        self.output_dir = folder
        self.output_label.configure(text=folder)
```

**Step 2: Add compression helpers**

```python
def _get_output_path(self, src: str) -> str:
    from pathlib import Path
    p = Path(src)
    if self.output_dir:
        out_dir = Path(self.output_dir)
    else:
        out_dir = p.parent / "compressed"
    out_dir.mkdir(parents=True, exist_ok=True)
    return str(out_dir / f"{p.stem}_compressed{p.suffix}")

def _get_compression_params(self) -> dict:
    if self.mode_var.get() == "quality":
        return {"quality": self.quality_var.get()}
    raw = self.target_entry.get().strip()
    if not raw:
        return {"quality": 75}
    try:
        val = float(raw)
    except ValueError:
        return {"quality": 75}
    unit = self.unit_var.get()
    target_kb = val * 1024 if unit == "MB" else val
    return {"target_kb": target_kb}
```

**Step 3: Replace `_on_compress` stub**

```python
def _on_compress(self):
    import threading
    from pathlib import Path
    from src.compressor import compress_image, compress_pdf

    if not self.files:
        return

    params = self._get_compression_params()
    self.compress_btn.configure(state="disabled", text="Compressing...")

    def run():
        for row in self.file_rows:
            path = row["path"]
            ext = Path(path).suffix.lower()
            row["status_lbl"].configure(text="Working...", text_color="gray60")
            try:
                out = self._get_output_path(path)
                if ext == ".pdf":
                    result = compress_pdf(path, out, **params)
                else:
                    result = compress_image(path, out, **params)

                final_kb = result["final_kb"]
                size_str = f"{final_kb/1024:.1f} MB" if final_kb >= 1024 else f"{final_kb:.0f} KB"
                row["result_lbl"].configure(text=size_str)

                if result.get("already_small"):
                    row["status_lbl"].configure(text="Already small", text_color="gray")
                elif result["success"]:
                    row["status_lbl"].configure(text="Done ✓", text_color="green")
                else:
                    row["status_lbl"].configure(text="Target missed", text_color="orange")
            except Exception as e:
                row["status_lbl"].configure(text=f"Error", text_color="red")

        self.compress_btn.configure(state="normal", text="Compress All")

    threading.Thread(target=run, daemon=True).start()
```

**Step 4: Test end-to-end**

```bash
python main.py
```

- Add a large JPEG → set target to 200 KB → click Compress All → row shows result size and "Done ✓"
- Add a PDF → set to PDF Web preset → compress → PDF appears in `/compressed/` folder
- Set Quality Slider mode → slide to 30 → compress → file is smaller

**Step 5: Commit**

```bash
git add src/app.py
git commit -m "feat: wire compression engine to UI with threading"
```

---

## Polish

### Task 7: UX Polish — Error States & Empty State

**Files:**
- Modify: `src/app.py`

**Step 1: Add empty state message in drop zone**

In `_build_drop_zone`, store the label:

```python
self.drop_label = ctk.CTkLabel(self.drop_frame, text="Drop files here  or  Click to Browse", ...)
self.drop_label.place(relx=0.5, rely=0.5, anchor="center")
```

In `_add_file_row`, after adding row, update drop zone hint:

```python
self.drop_label.configure(text="Drop more files or click to browse")
```

**Step 2: Show input validation error**

In `_get_compression_params`, if target entry is empty and mode is target:

```python
if not raw:
    self._show_error("Please enter a target size.")
    return None
```

Add `_show_error`:

```python
def _show_error(self, msg: str):
    import tkinter.messagebox as mb
    mb.showerror("FilePress", msg)
```

Update `_on_compress` to check `params is None`:

```python
params = self._get_compression_params()
if params is None:
    return
```

**Step 3: Run and verify error states**

```bash
python main.py
```

- Click Compress All with no files → nothing happens (button stays disabled if no files)
- Switch to Target Size mode, leave field blank, click Compress All → error dialog appears

**Step 4: Commit**

```bash
git add src/app.py
git commit -m "feat: UX polish — empty state, input validation, error dialogs"
```

---

### Task 8: Final Run & Verify All Tests Pass

**Step 1: Run full test suite**

```bash
pytest tests/ -v
```

Expected: All tests PASS.

**Step 2: Run the app one final time**

```bash
python main.py
```

Manual checklist:
- [ ] Drop zone accepts files via click and drag
- [ ] Platform presets set correct target sizes
- [ ] Mode toggle switches between Target Size and Quality Slider
- [ ] Compressing a JPEG to 200KB hits target (within 5%)
- [ ] Compressing a PDF strips metadata and reduces size
- [ ] Output appears in `/compressed/` subfolder
- [ ] ✕ button removes files from list
- [ ] No crashes on any flow

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: FilePress v1.0 — compress images and PDFs to target size"
```

---

## Future (v2)
- AI format converter: auto-select format + dimensions per platform
- Video compression (ffmpeg backend)
- Batch rename
- PyInstaller packaging to `.app`
