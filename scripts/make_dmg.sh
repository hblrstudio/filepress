#!/bin/bash
# Creates a distributable DMG: FilePress drag-to-Applications installer.
# Usage: bash scripts/make_dmg.sh
set -e

APP_NAME="FilePress"
APP_PATH="dist/FilePress.app"
DMG_FINAL="dist/${APP_NAME}.dmg"
DMG_RW="dist/${APP_NAME}_rw.dmg"
DMG_TMP="dist/${APP_NAME}_tmp"
BG_IMG="assets/dmg-background.png"
VOLUME_NAME="FilePress"
WIN_W=540
WIN_H=320

if [ ! -d "$APP_PATH" ]; then
    echo "✗  $APP_PATH not found — run scripts/build_app.sh first"
    exit 1
fi

echo "→ Generating DMG background..."
python3 scripts/make_dmg_bg.py

echo "→ Ad-hoc signing the .app..."
xattr -cr "$APP_PATH"
codesign --force --deep --sign - "$APP_PATH"

echo "→ Building staging folder..."
rm -rf "$DMG_TMP"
mkdir -p "$DMG_TMP/.background"
cp -r "$APP_PATH" "$DMG_TMP/"
ln -s /Applications "$DMG_TMP/Applications"
cp "$BG_IMG" "$DMG_TMP/.background/background.png"

echo "→ Creating writable DMG..."
rm -f "$DMG_RW" "$DMG_FINAL"
hdiutil create \
    -volname "$VOLUME_NAME" \
    -srcfolder "$DMG_TMP" \
    -ov \
    -format UDRW \
    "$DMG_RW"

echo "→ Mounting DMG to style window..."
MOUNT_DIR=$(hdiutil attach "$DMG_RW" -readwrite -noverify -noautoopen | \
    awk '/Apple_HFS/ { for(i=3;i<=NF;i++) printf "%s%s",$i,(i<NF?" ":"\n") }')

echo "   Mounted at: $MOUNT_DIR"
sleep 2

# AppleScript: set window size, background, icon positions, hide toolbar
osascript <<APPLESCRIPT
tell application "Finder"
    tell disk "$VOLUME_NAME"
        open
        set current view of container window to icon view
        set toolbar visible of container window to false
        set statusbar visible of container window to false
        set the bounds of container window to {200, 120, ${WIN_W} + 200, ${WIN_H} + 120}
        set theViewOptions to icon view options of container window
        set arrangement of theViewOptions to not arranged
        set icon size of theViewOptions to 80
        set background picture of theViewOptions to file ".background:background.png"
        set position of item "FilePress.app" of container window to {150, 148}
        set position of item "Applications" of container window to {390, 148}
        close
        open
        update without registering applications
        delay 3
        close
    end tell
end tell
APPLESCRIPT

echo "→ Unmounting..."
hdiutil detach "$MOUNT_DIR" -quiet
sleep 1

echo "→ Converting to compressed read-only DMG..."
hdiutil convert "$DMG_RW" \
    -format UDZO \
    -imagekey zlib-level=9 \
    -o "$DMG_FINAL"

rm -f "$DMG_RW"
rm -rf "$DMG_TMP"

echo "✓  Built: $DMG_FINAL"
