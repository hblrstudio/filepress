# FilePress — UI Polish & macOS App Packaging
Date: 2026-03-23

## Goal
Apply macOS-native visual polish to the existing FilePress UI and package it as a
standalone `FilePress.app` bundle (no Python installation required) with a custom icon.

---

## Scope

Two independent deliverables built in sequence:
1. **UI Polish** — visual-only update to `src/app.py` (layout unchanged)
2. **App Packaging** — icon generation + PyInstaller `.app` bundle

No compression engine changes. No layout restructuring. All 16 existing tests must
continue to pass throughout.

---

## 1. UI Polish — macOS Native Style

### Theme system

Add a `THEME` dict at the top of `src/app.py` (above the class definition).
All widget colour/radius values reference `THEME` — no hardcoded hex strings elsewhere.

```python
THEME = {
    "bg":           "#f5f5f7",   # macOS window background
    "card":         "#ffffff",   # card/panel surface
    "border":       "#d1d1d6",   # subtle border
    "accent":       "#007aff",   # system blue
    "accent_hover": "#0066d6",
    "text":         "#1d1d1f",   # primary text
    "text_secondary": "#8e8e93", # secondary / placeholder
    "success":      "#34c759",   # macOS green
    "warning":      "#ff9f0a",   # macOS orange
    "error":        "#ff3b30",   # macOS red
    "radius":       10,
}
```

### Widget-by-widget changes

| Section | Change |
|---|---|
| Window | `self.root.configure(fg_color=THEME["bg"])` in `__init__` (root is `TkinterDnD.Tk()`, not `ctk.CTk()`, so constructor kwargs don't apply) |
| Header | Bold "FilePress" in `#1d1d1f`, subtitle in `#8e8e93` |
| Drop zone | `border_color=THEME["border"]`, `fg_color=THEME["card"]`, label in `text_secondary` |
| Mode selector | Replace radio buttons with two `CTkButton` widgets acting as tabs (active = accent fill, inactive = card bg with border). Keep `mode_var` (`ctk.StringVar`) unchanged — tab buttons call `_on_mode_change()` and set `mode_var` themselves, so all downstream logic (`_get_compression_params`, `_apply_preset`) continues to work unmodified. |
| Target entry | `fg_color=THEME["card"]`, `border_color=THEME["border"]`, `text_color=THEME["text"]` |
| Preset buttons | `fg_color=THEME["card"]`, `border_width=1`, `border_color=THEME["border"]`, `text_color=THEME["accent"]`, `hover_color` slightly darker |
| File list frame | `fg_color=THEME["card"]`, `border_width=1`, `border_color=THEME["border"]` |
| Header labels | `font=CTkFont(weight="bold")`, `text_color=THEME["text_secondary"]` |
| Status colours | Done=`success`, Target missed=`warning`, Error=`error`, Ready=`text_secondary` |
| Compress button | `fg_color=THEME["accent"]`, `hover_color=THEME["accent_hover"]`, `text_color="#ffffff"`, height=44 |
| Output label | `text_color=THEME["text_secondary"]` |
| Remove button (✕) | `text_color=THEME["text_secondary"]`, `hover_color=THEME["error"]` |

### Appearance mode
Keep `ctk.set_appearance_mode("System")` (current default) — CTk will switch
automatically between light and dark based on the macOS system setting.
The `THEME` dict defines the light-mode colours; CTk handles dark-mode inversion.

---

## 2. App Icon

### Design
A compressed-document metaphor:
- Rounded square base (macOS app icon shape), gradient fill: `#007aff` → `#0051d5`
- White document outline (two stacked rectangles, top-right corner folded)
- Two white chevrons pointing inward (↔ compression symbol) centred on the doc

### Generation
Script: `scripts/make_icon.py` (uses Pillow, already a dependency).

Process:
1. Draw 1024×1024 PNG → `assets/icon-1024.png`
2. Generate all 10 required iconset sizes via Pillow resize:
   `icon_16x16.png`, `icon_16x16@2x.png`, `icon_32x32.png`, `icon_32x32@2x.png`,
   `icon_128x128.png`, `icon_128x128@2x.png`, `icon_256x256.png`, `icon_256x256@2x.png`,
   `icon_512x512.png`, `icon_512x512@2x.png` → into `assets/FilePress.iconset/`
3. Run `iconutil -c icns assets/FilePress.iconset -o assets/FilePress.icns`

---

## 3. PyInstaller Packaging

### `FilePress.spec`

Key settings in the spec file:

- `EXE(..., console=False)` — suppresses terminal window
- `BUNDLE(...)` block — required for macOS `.app` creation; without this PyInstaller
  only produces a Unix executable, not an `.app` bundle
- `icon="assets/FilePress.icns"` on both `EXE` and `BUNDLE`
- `bundle_identifier="com.filepress.app"` on `BUNDLE`

**tkinterdnd2 dylib bundling (high-risk step):**
`tkinterdnd2` ships a native `.dylib` that PyInstaller will not find automatically.
In `make_icon.py` (or a helper at build time), locate the dylib at:
```
import tkinterdnd2, pathlib
pkg = pathlib.Path(tkinterdnd2.__file__).parent
dylib = next(pkg.rglob("libtkdnd*.dylib"))
```
Add to the spec's `datas` list:
```python
datas=[(str(dylib), "tkinterdnd2/tkdnd")]
```
and add `"tkinterdnd2"` to `hiddenimports`. The app's `__init__` already wraps
the import in a `try/except ImportError`, so if the dylib is missing at runtime the
app still launches (browse-only, no drag-and-drop) rather than crashing.

### `scripts/build_app.sh`

```bash
#!/bin/bash
set -e
python scripts/make_icon.py          # generate icon
pyinstaller FilePress.spec           # build .app
echo "✓ Built: dist/FilePress.app"
```

### Output
`dist/FilePress.app` — double-clickable, no Python required.

### `Launch FilePress.command` update
Replace current Python invocation with:
```bash
open "$(dirname "$0")/dist/FilePress.app"
```

---

## File changes summary

| File | Action |
|---|---|
| `src/app.py` | Add `THEME` dict; update all widget styles |
| `assets/icon-1024.png` | Create (generated by script) |
| `assets/FilePress.icns` | Create (generated by script) |
| `scripts/make_icon.py` | Create |
| `scripts/build_app.sh` | Create |
| `FilePress.spec` | Create |
| `Launch FilePress.command` | Update to open `.app` |
| `.gitignore` | Add `dist/`, `build/`, `assets/FilePress.iconset/` |

---

## Success criteria
- App launches by double-clicking `dist/FilePress.app` with no terminal
- Icon appears in dock and Finder
- Visual style matches macOS native palette (B option selected in brainstorm)
- All 16 tests still pass
- `Launch FilePress.command` opens the built `.app`
