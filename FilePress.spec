# FilePress.spec  —  PyInstaller 6.x
import pathlib, importlib.util

# Bundle the entire tkinterdnd2/tkdnd directory (contains arm64 + x64 dylibs).
# importlib.util.find_spec avoids executing tkinterdnd2.__init__ directly.
_pkg = pathlib.Path(importlib.util.find_spec("tkinterdnd2").origin).parent

a = Analysis(
    ["main.py"],
    pathex=["."],
    binaries=[],
    datas=[
        (str(_pkg / "tkdnd"), "tkinterdnd2/tkdnd"),
    ],
    hiddenimports=["tkinterdnd2", "PIL._tkinter_finder", "pikepdf"],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="FilePress",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    icon="assets/FilePress.icns",
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="FilePress",
)

app = BUNDLE(
    coll,
    name="FilePress.app",
    icon="assets/FilePress.icns",
    bundle_identifier="com.filepress.app",
    info_plist={
        "NSHighResolutionCapable": True,
        "LSMinimumSystemVersion": "11.0",
        "CFBundleShortVersionString": "1.0.0",
        "CFBundleVersion": "1",
        "NSHumanReadableCopyright": "© 2026 FilePress",
    },
)
