import customtkinter as ctk

ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")

THEME = {
    "bg":             "#f5f5f7",
    "card":           "#ffffff",
    "border":         "#d1d1d6",
    "accent":         "#007aff",
    "accent_hover":   "#0066d6",
    "accent_light":   "#e5f0ff",
    "hover_neutral":  "#f0f0f5",
    "border_hover":   "#e5e5ea",
    "text":           "#1d1d1f",
    "text_secondary": "#8e8e93",
    "success":        "#34c759",
    "warning":        "#ff9f0a",
    "error":          "#ff3b30",
    "radius":         10,
}


class FileCompressorApp:
    def __init__(self):
        try:
            from tkinterdnd2 import TkinterDnD
            self.root = TkinterDnD.Tk()
            # Re-apply CTk settings because TkinterDnD.Tk() bypasses ctk.CTk() init
            ctk.set_appearance_mode("System")
            ctk.set_default_color_theme("blue")
            # TkinterDnD.Tk is a plain Tk window — use bg, not CTk's fg_color
            self.root.configure(bg=THEME["bg"])
            self._dnd_available = True   # TkinterDnD loaded — DnD works
        except ImportError:
            self.root = ctk.CTk()
            self.root.configure(fg_color=THEME["bg"])
            self._dnd_available = False
        self.root.title("FilePress")
        self.root.geometry("680x680")
        self.root.resizable(False, False)
        self.files = []
        self._build_ui()

    def _build_ui(self):
        self._build_header()
        self._build_drop_zone()
        self._build_mode_selector()
        self._build_target_controls()
        self._build_file_list()
        self._build_output_controls()
        self._build_compress_button()
        self._build_drawer()  # must be last — lifts panel above all other widgets

    def _build_header(self):
        frame = ctk.CTkFrame(self.root, fg_color="transparent")
        frame.pack(fill="x", padx=20, pady=(16, 0))

        # Hamburger button — transparent, blue lines, no box
        ctk.CTkButton(
            frame, text="☰", width=36, height=36,
            fg_color="transparent",
            hover_color=THEME["hover_neutral"],
            text_color=THEME["accent"],
            corner_radius=8,
            font=ctk.CTkFont(size=22),
            command=self._toggle_drawer,
        ).pack(side="left")

        ctk.CTkLabel(
            frame, text="FilePress",
            font=ctk.CTkFont(size=22, weight="bold"),
            text_color=THEME["text"],
        ).pack(side="left", padx=(10, 0))
        ctk.CTkLabel(
            frame, text="Compress to any size",
            font=ctk.CTkFont(size=13),
            text_color=THEME["text_secondary"],
        ).pack(side="left", padx=10)

    def _build_drop_zone(self):
        import tkinter as tk

        self.drop_frame = ctk.CTkFrame(
            self.root,
            height=110,
            border_width=1,
            border_color=THEME["border"],
            corner_radius=THEME["radius"],
            fg_color=THEME["card"],
        )
        self.drop_frame.pack(fill="x", padx=20, pady=16)
        self.drop_frame.pack_propagate(False)

        # Canvas used solely for the dashed-border hover effect
        self._drop_canvas = tk.Canvas(
            self.drop_frame,
            highlightthickness=0,
            bg=THEME["card"],
        )
        self._drop_canvas.place(x=0, y=0, relwidth=1, relheight=1)

        self.drop_label = ctk.CTkLabel(
            self.drop_frame,
            text="Click to Browse",
            font=ctk.CTkFont(size=14),
            text_color=THEME["text_secondary"],
            fg_color="transparent",
        )
        self.drop_label.place(relx=0.5, rely=0.5, anchor="center")
        self.drop_label.lift()  # keep label above canvas

        # Smooth hover animation state
        self._hover_t = 0.0    # 0.0 = normal, 1.0 = fully hovered
        self._hover_job = None

        def _lerp(c1: str, c2: str, t: float) -> str:
            """Interpolate between two hex colours."""
            t = max(0.0, min(1.0, t))
            r = int(int(c1[1:3], 16) + (int(c2[1:3], 16) - int(c1[1:3], 16)) * t)
            g = int(int(c1[3:5], 16) + (int(c2[3:5], 16) - int(c1[3:5], 16)) * t)
            b = int(int(c1[5:7], 16) + (int(c2[5:7], 16) - int(c1[5:7], 16)) * t)
            return f"#{r:02x}{g:02x}{b:02x}"

        def _apply_t(t: float):
            bg = _lerp(THEME["card"],          THEME["accent_light"], t)
            bc = _lerp(THEME["border"],         THEME["accent"],       t)
            tc = _lerp(THEME["text_secondary"], THEME["accent"],       t)
            self._drop_canvas.configure(bg=bg)
            self.drop_frame.configure(border_color=bc)
            self.drop_label.configure(text_color=tc)
            c = self._drop_canvas
            c.delete("dash")
            w, h = c.winfo_width(), c.winfo_height()
            if t > 0.1 and w > 1:
                c.create_rectangle(6, 6, w - 6, h - 6,
                                   outline=bc, dash=(8, 5), width=2, tags="dash")

        def _animate(going_in: bool):
            if self._hover_job:
                self.root.after_cancel(self._hover_job)
                self._hover_job = None
            target = 1.0 if going_in else 0.0
            step = 0.18  # ~6 ticks to full transition

            def tick():
                t = self._hover_t + step if going_in else self._hover_t - step
                t = max(0.0, min(1.0, t))
                self._hover_t = t
                _apply_t(t)
                if abs(t - target) > 0.01:
                    self._hover_job = self.root.after(14, tick)

            tick()

        self._drop_canvas.bind("<Configure>", lambda e: _apply_t(self._hover_t))

        def on_enter(e):
            _animate(True)

        def on_leave(e):
            _animate(False)

        for w in (self.drop_frame, self.drop_label, self._drop_canvas):
            w.bind("<Enter>", on_enter)
            w.bind("<Leave>", on_leave)
            w.bind("<Button-1>", self._on_browse)

        # Register drop targets (availability already determined in __init__)
        if self._dnd_available:
            try:
                from tkinterdnd2 import DND_FILES
                for widget in (self.root, self.drop_frame, self.drop_label):
                    try:
                        widget.drop_target_register(DND_FILES)
                        widget.dnd_bind("<<Drop>>", self._on_drop)
                    except Exception:
                        pass
            except Exception:
                self._dnd_available = False

        self.drop_label.configure(
            text="Drop files here  ·  Click to Browse" if self._dnd_available else "Click to Browse"
        )

    def _build_mode_selector(self):
        frame = ctk.CTkFrame(self.root, fg_color="transparent")
        frame.pack(fill="x", padx=20, pady=(4, 0))

        self.mode_var = ctk.StringVar(value="target")

        tab_container = ctk.CTkFrame(
            frame,
            fg_color=THEME["card"],
            border_width=1,
            border_color=THEME["border"],
            corner_radius=8,
        )
        tab_container.pack(side="left")

        def make_tab(text, value):
            btn = ctk.CTkButton(
                tab_container,
                text=text,
                width=110,
                height=28,
                corner_radius=6,
                fg_color=THEME["accent"] if value == "target" else "transparent",
                hover_color=THEME["accent_hover"] if value == "target" else THEME["hover_neutral"],
                text_color="#ffffff" if value == "target" else THEME["text_secondary"],
                font=ctk.CTkFont(size=12),
                command=lambda v=value: self._set_mode(v),
            )
            btn.pack(side="left", padx=3, pady=3)
            return btn

        self._tab_target = make_tab("Target Size", "target")
        self._tab_quality = make_tab("Quality Slider", "quality")

        # Stable container for target/quality controls
        self.controls_container = ctk.CTkFrame(self.root, fg_color="transparent")
        self.controls_container.pack(fill="x", padx=0, pady=0)

    def _build_target_controls(self):
        self.target_frame = ctk.CTkFrame(self.controls_container, fg_color="transparent")
        self.target_frame.pack(fill="x", padx=20, pady=8)

        row1 = ctk.CTkFrame(self.target_frame, fg_color="transparent")
        row1.pack(fill="x")
        ctk.CTkLabel(row1, text="Target size:", text_color=THEME["text"]).pack(side="left")
        self.target_entry = ctk.CTkEntry(
            row1, width=80, placeholder_text="500",
            fg_color=THEME["card"],
            border_color=THEME["border"],
            text_color=THEME["text"],
        )
        self.target_entry.pack(side="left", padx=6)
        self.unit_var = ctk.StringVar(value="KB")
        ctk.CTkOptionMenu(
            row1, values=["KB", "MB"], variable=self.unit_var, width=60,
            fg_color=THEME["card"],
            button_color=THEME["border"],
            button_hover_color=THEME["border_hover"],
            text_color=THEME["text"],
            dropdown_fg_color=THEME["card"],
            dropdown_text_color=THEME["text"],
            dropdown_hover_color=THEME["hover_neutral"],
        ).pack(side="left")

        row2 = ctk.CTkFrame(self.target_frame, fg_color="transparent")
        row2.pack(fill="x", pady=(6, 0))
        ctk.CTkLabel(row2, text="Presets:", text_color=THEME["text_secondary"]).pack(side="left")
        presets = [
            ("Instagram", 8192), ("WhatsApp", 5120), ("Email", 1024),
            ("Twitter/X", 5120), ("LinkedIn", 8192), ("PDF Web", 2048),
        ]
        for name, size_kb in presets:
            ctk.CTkButton(
                row2, text=name, width=70, height=26,
                fg_color=THEME["card"],
                border_width=1,
                border_color=THEME["border"],
                text_color=THEME["accent"],
                hover_color=THEME["accent_light"],
                corner_radius=6,
                command=lambda s=size_kb: self._apply_preset(s),
            ).pack(side="left", padx=3)

        # ── Quality slider (hidden by default, shown in quality mode) ─────────
        self.quality_frame = ctk.CTkFrame(self.controls_container, fg_color="transparent")
        self.quality_var = ctk.IntVar(value=75)

        quality_row = ctk.CTkFrame(self.quality_frame, fg_color="transparent")
        quality_row.pack(fill="x")
        ctk.CTkLabel(
            quality_row, text="Quality:", text_color=THEME["text"],
        ).pack(side="left")
        self.quality_slider = ctk.CTkSlider(
            quality_row, from_=1, to=95,
            variable=self.quality_var, width=280,
            button_color=THEME["accent"],
            button_hover_color=THEME["accent_hover"],
            progress_color=THEME["accent"],
        )
        self.quality_slider.pack(side="left", padx=10)
        self.quality_label = ctk.CTkLabel(
            quality_row, text="75", text_color=THEME["text"],
        )
        self.quality_label.pack(side="left")

        # Warning label shown when quality is very low
        self._quality_warn = ctk.CTkLabel(
            self.quality_frame,
            text="⚠  Quality below 20 may produce visible compression artifacts",
            font=ctk.CTkFont(size=11),
            text_color=THEME["warning"],
        )

        def _update_quality(*_):
            val = self.quality_var.get()
            self.quality_label.configure(text=str(val))
            if val < 20:
                self._quality_warn.pack(anchor="w", pady=(4, 0))
            else:
                self._quality_warn.pack_forget()

        self.quality_var.trace_add("write", _update_quality)

    def _build_file_list(self):
        frame = ctk.CTkFrame(
            self.root,
            fg_color=THEME["card"],
            border_width=1,
            border_color=THEME["border"],
            corner_radius=THEME["radius"],
        )
        frame.pack(fill="both", expand=True, padx=20, pady=10)
        header = ctk.CTkFrame(frame, fg_color="transparent")
        header.pack(fill="x", padx=8, pady=4)
        for text, width in [("File", 220), ("Original", 90), ("Result", 90), ("Status", 120)]:
            ctk.CTkLabel(
                header, text=text, width=width, anchor="w",
                font=ctk.CTkFont(weight="bold"),
                text_color=THEME["text_secondary"],
            ).pack(side="left")
        self.file_list_frame = ctk.CTkScrollableFrame(frame, height=180, fg_color="transparent")
        self.file_list_frame.pack(fill="both", expand=True, padx=4)
        self.file_rows = []

    def _build_output_controls(self):
        frame = ctk.CTkFrame(self.root, fg_color="transparent")
        frame.pack(fill="x", padx=20, pady=(0, 8))
        ctk.CTkLabel(
            frame, text="Output:", text_color=THEME["text"],
        ).pack(side="left")
        self.output_label = ctk.CTkLabel(
            frame, text="Same folder / compressed",
            text_color=THEME["text_secondary"],
        )
        self.output_label.pack(side="left", padx=8)
        ctk.CTkButton(
            frame, text="Change", width=70,
            fg_color=THEME["card"],
            border_width=1,
            border_color=THEME["border"],
            text_color=THEME["accent"],
            hover_color=THEME["accent_light"],
            command=self._on_change_output,
        ).pack(side="left")
        self.output_dir = None

    def _build_compress_button(self):
        self.compress_btn = ctk.CTkButton(
            self.root,
            text="Compress All",
            height=44,
            font=ctk.CTkFont(size=15, weight="bold"),
            fg_color=THEME["accent"],
            hover_color=THEME["accent_hover"],
            text_color="#ffffff",
            corner_radius=THEME["radius"],
            command=self._on_compress,
        )
        self.compress_btn.pack(padx=20, pady=(0, 16), fill="x")

    def _build_drawer(self):
        """Left slide-in navigation drawer. Built last so it renders above all widgets."""
        DRAWER_W = 220
        self._DRAWER_W = DRAWER_W
        self._drawer_open = False
        self._drawer_current_x = -DRAWER_W

        self._drawer_panel = ctk.CTkFrame(
            self.root,
            width=DRAWER_W,
            fg_color=THEME["card"],
            corner_radius=0,
            border_width=1,
            border_color=THEME["border"],
        )
        # Start off-screen to the left
        self._drawer_panel.place(x=-DRAWER_W, y=0, relheight=1.0)
        self._drawer_panel.pack_propagate(False)

        # Header row: title + close button
        hdr = ctk.CTkFrame(self._drawer_panel, fg_color="transparent")
        hdr.pack(fill="x", padx=16, pady=(20, 4))
        ctk.CTkLabel(
            hdr,
            text="FilePress",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=THEME["text"],
        ).pack(side="left")
        ctk.CTkButton(
            hdr, text="×", width=28, height=28,
            fg_color="transparent",
            hover_color=THEME["hover_neutral"],
            text_color=THEME["text_secondary"],
            font=ctk.CTkFont(size=18),
            command=self._close_drawer,
        ).pack(side="right")

        # Divider
        ctk.CTkFrame(
            self._drawer_panel, fg_color=THEME["border"], height=1,
        ).pack(fill="x", padx=16, pady=(4, 8))

        # Navigation items — (label, active, soon_label)
        # soon_label = None means it's live; a string shows a greyed badge
        nav_items = [
            ("Compression",           True,  None),
            ("Resize for Platforms",  False, "Soon"),   # resize to Instagram/Twitter/etc px
            ("Format Convert",        False, "Soon"),   # PNG→JPEG, HEIC→JPG, WEBP
            ("PDF Tools",             False, "Soon"),   # image downsampling, split/merge
            ("Batch Rename",          False, "Soon"),   # custom output naming patterns
            ("History",               False, "Soon"),   # log of past compressions
            ("Settings",              False, "Soon"),   # default quality, output folder, etc
        ]

        def _make_nav_row(label: str, active: bool, soon: str | None):
            row = ctk.CTkFrame(
                self._drawer_panel,
                fg_color=THEME["accent_light"] if active else "transparent",
                height=38,
                corner_radius=8,
            )
            row.pack(fill="x", padx=12, pady=2)
            row.pack_propagate(False)

            lbl = ctk.CTkLabel(
                row, text=label, anchor="w",
                text_color=THEME["accent"] if active else THEME["text_secondary"],
                font=ctk.CTkFont(size=13, weight="bold" if active else "normal"),
            )
            lbl.pack(side="left", padx=10, fill="y")

            if soon:
                ctk.CTkLabel(
                    row, text=soon,
                    font=ctk.CTkFont(size=10),
                    text_color=THEME["text_secondary"],
                    fg_color=THEME["hover_neutral"],
                    corner_radius=4,
                    width=34, height=16,
                ).pack(side="right", padx=8)

            if not active:
                def _enter(e, r=row): r.configure(fg_color=THEME["hover_neutral"])
                def _leave(e, r=row): r.configure(fg_color="transparent")
                for w in (row, lbl):
                    w.bind("<Enter>", _enter)
                    w.bind("<Leave>", _leave)

        for label, active, soon in nav_items:
            _make_nav_row(label, active, soon)

        # Version footer
        ctk.CTkLabel(
            self._drawer_panel,
            text="v1.0",
            font=ctk.CTkFont(size=10),
            text_color=THEME["text_secondary"],
        ).pack(side="bottom", pady=16)

        # Escape closes the drawer
        self.root.bind("<Escape>", lambda e: self._close_drawer())

    # ── Drawer animation ──────────────────────────────────────────────────────

    def _toggle_drawer(self):
        if self._drawer_open:
            self._close_drawer()
        else:
            self._open_drawer()

    def _open_drawer(self):
        if self._drawer_open:
            return
        self._drawer_open = True
        self._drawer_panel.lift()
        self._animate_drawer(0, step=35)

    def _close_drawer(self):
        if not self._drawer_open:
            return
        self._animate_drawer(-self._DRAWER_W, step=-35)

    def _animate_drawer(self, target_x: int, step: int):
        x = self._drawer_current_x
        new_x = x + step
        # Clamp to target
        if (step > 0 and new_x >= target_x) or (step < 0 and new_x <= target_x):
            new_x = target_x
        self._drawer_current_x = new_x
        self._drawer_panel.place(x=new_x, y=0, relheight=1.0)
        if new_x == target_x:
            if new_x < 0:
                self._drawer_open = False
            return
        self.root.after(12, lambda: self._animate_drawer(target_x, step))

    # ── Event handlers ────────────────────────────────────────────────────────

    def _set_mode(self, value: str):
        if self.mode_var.get() == value:
            return
        self.mode_var.set(value)
        # Update tab visual states
        if value == "target":
            self._tab_target.configure(
                fg_color=THEME["accent"],
                hover_color=THEME["accent_hover"],
                text_color="#ffffff",
            )
            self._tab_quality.configure(
                fg_color="transparent",
                hover_color=THEME["hover_neutral"],
                text_color=THEME["text_secondary"],
            )
        elif value == "quality":
            self._tab_quality.configure(
                fg_color=THEME["accent"],
                hover_color=THEME["accent_hover"],
                text_color="#ffffff",
            )
            self._tab_target.configure(
                fg_color="transparent",
                hover_color=THEME["hover_neutral"],
                text_color=THEME["text_secondary"],
            )
        else:
            raise ValueError(f"Unknown mode: {value!r}")
        self._on_mode_change()

    def _on_mode_change(self):
        if self.mode_var.get() == "target":
            self.quality_frame.pack_forget()
            self.target_frame.pack(fill="x", padx=20, pady=8)
        else:
            self.target_frame.pack_forget()
            self.quality_frame.pack(fill="x", padx=20, pady=8)

    def _apply_preset(self, size_kb):
        self._set_mode("target")
        if size_kb >= 1024:
            self.target_entry.delete(0, "end")
            self.target_entry.insert(0, str(size_kb // 1024))
            self.unit_var.set("MB")
        else:
            self.target_entry.delete(0, "end")
            self.target_entry.insert(0, str(size_kb))
            self.unit_var.set("KB")

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
        display_name = name if len(name) <= 30 else name[:27] + "..."

        name_lbl   = ctk.CTkLabel(row_frame, text=display_name, width=220, anchor="w",
                                   text_color=THEME["text"])
        orig_lbl   = ctk.CTkLabel(row_frame, text=size_str, width=90, anchor="w",
                                   text_color=THEME["text_secondary"])
        result_lbl = ctk.CTkLabel(row_frame, text="—", width=90, anchor="w",
                                   text_color=THEME["text_secondary"])
        status_lbl = ctk.CTkLabel(row_frame, text="Ready", width=120, anchor="w",
                                   text_color=THEME["text_secondary"])
        remove_btn = ctk.CTkButton(
            row_frame, text="✕", width=28, height=24,
            fg_color="transparent",
            text_color=THEME["text_secondary"],
            hover_color=THEME["error"],
            command=lambda p=path, f=row_frame: self._remove_file(p, f),
        )
        for w in [name_lbl, orig_lbl, result_lbl, status_lbl, remove_btn]:
            w.pack(side="left")

        self.file_rows.append({
            "path": path, "frame": row_frame,
            "result_lbl": result_lbl, "status_lbl": status_lbl,
        })
        self.drop_label.configure(
            text="Drop more  ·  Click to Browse" if self._dnd_available else "Add more — Click to Browse"
        )

    def _remove_file(self, path: str, frame):
        self.files.remove(path)
        self.file_rows = [r for r in self.file_rows if r["path"] != path]
        frame.destroy()
        if not self.files:
            self.drop_label.configure(
                text="Drop files here  ·  Click to Browse" if self._dnd_available else "Click to Browse"
            )

    def _on_drop(self, event):
        paths = self.root.tk.splitlist(event.data)
        for p in paths:
            self._add_file(p)

    def _on_change_output(self):
        from tkinter import filedialog
        folder = filedialog.askdirectory()
        if folder:
            self.output_dir = folder
            self.output_label.configure(text=folder)

    def _get_output_path(self, src: str) -> str:
        from pathlib import Path
        p = Path(src)
        if self.output_dir:
            out_dir = Path(self.output_dir)
        else:
            out_dir = p.parent  # same folder as source by default
        out_dir.mkdir(parents=True, exist_ok=True)
        return str(out_dir / f"{p.stem}_compressed{p.suffix}")

    def _get_compression_params(self) -> "dict | None":
        if self.mode_var.get() == "quality":
            return {"quality": self.quality_var.get()}
        raw = self.target_entry.get().strip()
        if not raw:
            self._show_error("Please enter a target size.")
            return None
        try:
            val = float(raw)
        except ValueError:
            self._show_error("Target size must be a number.")
            return None
        unit = self.unit_var.get()
        target_kb = val * 1024 if unit == "MB" else val
        return {"target_kb": target_kb}

    def _on_compress(self):
        import threading
        from pathlib import Path
        from src.compressor import compress_image, compress_pdf

        if not self.files:
            return

        params = self._get_compression_params()
        if params is None:
            return
        self.compress_btn.configure(state="disabled", text="Compressing...")

        def run():
            import traceback
            for row in self.file_rows:
                path = row["path"]
                ext = Path(path).suffix.lower()
                self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Working...", text_color=THEME["text_secondary"]))
                try:
                    out = self._get_output_path(path)
                    if ext == ".pdf":
                        result = compress_pdf(path, out, **params)
                    else:
                        result = compress_image(path, out, **params)

                    final_kb = result["final_kb"]
                    size_str = f"{final_kb/1024:.1f} MB" if final_kb >= 1024 else f"{final_kb:.0f} KB"
                    self.root.after(0, lambda lbl=row["result_lbl"], s=size_str: lbl.configure(text=s))

                    if result.get("already_small"):
                        self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Already small", text_color=THEME["text_secondary"]))
                    elif result["success"]:
                        self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Done ✓", text_color=THEME["success"]))
                    else:
                        self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Target missed", text_color=THEME["warning"]))
                except Exception:
                    traceback.print_exc()
                    self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Error", text_color=THEME["error"]))

            self.root.after(0, lambda: self.compress_btn.configure(state="normal", text="Compress All"))

        threading.Thread(target=run, daemon=True).start()

    def _show_error(self, msg: str):
        import tkinter.messagebox as mb
        mb.showerror("FilePress", msg)

    def run(self):
        self.root.mainloop()
