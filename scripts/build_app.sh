#!/bin/bash
set -e

echo "→ Generating icon..."
python3 scripts/make_icon.py

echo "→ Building .app with PyInstaller..."
pyinstaller FilePress.spec --noconfirm

echo "→ Building DMG..."
bash scripts/make_dmg.sh

echo ""
echo "✓  Done:"
echo "   dist/FilePress.app  — drag to /Applications or run directly"
echo "   dist/FilePress.dmg  — distribute to users"
