# File Compressor — Design Doc
Date: 2026-02-26

## Product Angle
Most compression tools make you guess the quality setting. This tool lets you set a **target file size** and compresses automatically to hit it — no trial and error. Platform presets (Instagram, WhatsApp, email, etc.) make it even faster.

## Stack
- **Language:** Python 3
- **GUI:** CustomTkinter (modern, native-feeling, dark/light mode)
- **Image compression:** Pillow
- **PDF compression:** pikepdf
- **Packaging:** PyInstaller (to create a standalone macOS .app)

## UI Layout

```
┌─────────────────────────────────────────────────┐
│  FilePress                          [dark/light] │
├─────────────────────────────────────────────────┤
│                                                 │
│        ┌─────────────────────────┐              │
│        │  Drop files here or     │              │
│        │  click to browse        │              │
│        └─────────────────────────┘              │
│                                                 │
│  [Mode: Target Size ●]  [Quality Slider ○]      │
│                                                 │
│  Target Size: [_____] KB/MB                     │
│  Quick Presets: [Instagram] [WhatsApp] [Email]  │
│                 [Twitter/X] [LinkedIn] [PDF Web]│
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ File             Original   Status       │   │
│  │ photo.jpg        4.2 MB     →  998 KB ✓ │   │
│  │ document.pdf     8.1 MB     →  1.9 MB ✓ │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  Output: [Same folder /compressed]  [Change]    │
│                                                 │
│           [Compress All]                        │
└─────────────────────────────────────────────────┘
```

## Two Modes

### Mode 1: Target Size
- User types a target (e.g. `500 KB` or `2 MB`)
- Tool uses binary search to find the quality level that hits just under the target
- Reports final size and whether target was achieved
- If target is impossible (file already smaller, or PDF can't shrink enough), shows a clear message

### Mode 2: Quality Slider
- 0–100 slider
- Labeled presets on the slider: Lossless (90) | High (75) | Balanced (55) | Small (30)
- Live label shows estimated reduction (calculated after first file)

## Platform Presets
| Preset       | Target Size | Notes                        |
|--------------|-------------|------------------------------|
| Instagram    | 8 MB        | Max for feed posts           |
| WhatsApp     | 5 MB        | Image compression threshold  |
| Email        | 1 MB        | Safe attachment size         |
| Twitter/X    | 5 MB        | Image upload limit           |
| LinkedIn     | 8 MB        | Post image limit             |
| PDF Web      | 2 MB        | Fast web loading             |

## Compression Logic

### Images (JPEG, PNG, WebP, HEIC)
- **Target Size mode:** Binary search over quality (0–95) using Pillow until output ≤ target
- **Quality Slider mode:** Direct encode at selected quality
- HEIC → converted to JPEG first, then compressed
- PNG → uses Pillow optimize flag; for aggressive compression, converts to JPEG

### PDFs
- Strip metadata and unused objects (always applied — lossless, free gains)
- **Target Size mode:** Downsample embedded images iteratively (start 150dpi → 96dpi → 72dpi) until target hit
- **Quality Slider mode:** Map slider to DPI (100→150dpi, 50→96dpi, 0→72dpi)

## Output
- Saves to `/compressed/` subfolder next to originals by default
- User can change output folder
- Filenames: `original_name_compressed.jpg`
- Never overwrites the original

## Future Ideas (not in v1)
- AI-powered format converter: given a platform, auto-select best format + size
- Batch rename
- Video compression support
- Browser extension version
