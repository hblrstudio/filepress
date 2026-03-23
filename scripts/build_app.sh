#!/bin/bash
set -e

echo "→ Generating icon..."
python3 scripts/make_icon.py

echo "→ Building .app with PyInstaller..."
pyinstaller FilePress.spec --noconfirm

echo ""
echo "✓ Built: dist/FilePress.app"
echo "  Open with: open dist/FilePress.app"
