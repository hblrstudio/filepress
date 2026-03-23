#!/bin/bash
# Creates a distributable DMG: FilePress drag-to-Applications installer.
# Usage: bash scripts/make_dmg.sh
set -e

APP_NAME="FilePress"
APP_PATH="dist/FilePress.app"
DMG_NAME="${APP_NAME}.dmg"
DMG_TMP="dist/${APP_NAME}_tmp"
VOLUME_NAME="FilePress"

if [ ! -d "$APP_PATH" ]; then
    echo "✗  $APP_PATH not found — run scripts/build_app.sh first"
    exit 1
fi

echo "→ Ad-hoc signing the .app (removes macOS 'damaged' warning)..."
xattr -cr "$APP_PATH"
codesign --force --deep --sign - "$APP_PATH"

echo "→ Building DMG..."
rm -rf "$DMG_TMP" "dist/$DMG_NAME"
mkdir -p "$DMG_TMP"

cp -r "$APP_PATH" "$DMG_TMP/"
ln -s /Applications "$DMG_TMP/Applications"

hdiutil create \
    -volname "$VOLUME_NAME" \
    -srcfolder "$DMG_TMP" \
    -ov \
    -format UDZO \
    -imagekey zlib-level=9 \
    "dist/$DMG_NAME"

rm -rf "$DMG_TMP"

echo "✓  Built: dist/$DMG_NAME"
