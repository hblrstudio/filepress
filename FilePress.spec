# FilePress.spec
import pathlib, importlib.util

# Locate tkinterdnd2 dylib at spec-parse time.
# We use importlib.util.find_spec instead of a direct import because
# tkinterdnd2's __init__.py imports tkinter.tix, which was removed in
# Python 3.13 and raises an ImportError at import time.
_spec = importlib.util.find_spec("tkinterdnd2")
_pkg = pathlib.Path(_spec.origin).parent
_dylib = next(_pkg.rglob("libtkdnd*.dylib"))

block_cipher = None

a = Analysis(
    ["main.py"],
    pathex=["."],
    binaries=[],
    datas=[
        (str(_dylib), "tkinterdnd2/tkdnd"),
    ],
    hiddenimports=["tkinterdnd2", "PIL._tkinter_finder", "pikepdf"],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

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
    },
)
