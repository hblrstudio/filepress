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
            self.root.configure(fg_color=THEME["bg"])
        except ImportError:
            self.root = ctk.CTk()
            self.root.configure(fg_color=THEME["bg"])
        self.root.title("FilePress")
        self.root.geometry("680x620")
        self.root.resizable(False, False)
        self.files = []  # list of file paths
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
        ctk.CTkLabel(
            frame, text="FilePress",
            font=ctk.CTkFont(size=22, weight="bold"),
            text_color=THEME["text"],
        ).pack(side="left")
        ctk.CTkLabel(
            frame, text="Compress to any size",
            font=ctk.CTkFont(size=13),
            text_color=THEME["text_secondary"],
        ).pack(side="left", padx=10)

    def _build_drop_zone(self):
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
        self.drop_label = ctk.CTkLabel(
            self.drop_frame,
            text="Drop files here  or  Click to Browse",
            font=ctk.CTkFont(size=14),
            text_color=THEME["text_secondary"],
        )
        self.drop_label.place(relx=0.5, rely=0.5, anchor="center")
        self.drop_frame.bind("<Button-1>", self._on_browse)
        self.drop_label.bind("<Button-1>", self._on_browse)

        try:
            from tkinterdnd2 import DND_FILES
            # Register root plus visible widgets — CTkFrame/CTkLabel sit on top of
            # the root and intercept drops, so each layer needs its own registration.
            for widget in (self.root, self.drop_frame, self.drop_label):
                try:
                    widget.drop_target_register(DND_FILES)
                    widget.dnd_bind("<<Drop>>", self._on_drop)
                except Exception:
                    pass
        except Exception:
            pass  # drag & drop unavailable, browse still works

    def _build_mode_selector(self):
        frame = ctk.CTkFrame(self.root, fg_color="transparent")
        frame.pack(fill="x", padx=20)
        self.mode_var = ctk.StringVar(value="target")
        ctk.CTkRadioButton(frame, text="Target Size", variable=self.mode_var, value="target", command=self._on_mode_change).pack(side="left")
        ctk.CTkRadioButton(frame, text="Quality Slider", variable=self.mode_var, value="quality", command=self._on_mode_change).pack(side="left", padx=20)

        # Create stable container for target/quality controls
        self.controls_container = ctk.CTkFrame(self.root, fg_color="transparent")
        self.controls_container.pack(fill="x", padx=0, pady=0)

    def _build_target_controls(self):
        self.target_frame = ctk.CTkFrame(self.controls_container, fg_color="transparent")
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
        self.quality_frame = ctk.CTkFrame(self.controls_container, fg_color="transparent")
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
        self.compress_btn = ctk.CTkButton(self.root, text="Compress All", height=42,
                                           font=ctk.CTkFont(size=15, weight="bold"),
                                           command=self._on_compress)
        self.compress_btn.pack(padx=20, pady=(0, 16), fill="x")

    # ── Event handlers ──────────────────────────────────────────────────────

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
        name_lbl = ctk.CTkLabel(row_frame, text=display_name, width=220, anchor="w")
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
        self.drop_label.configure(text="Drop more files  or  Click to Browse")

    def _remove_file(self, path: str, frame):
        self.files.remove(path)
        self.file_rows = [r for r in self.file_rows if r["path"] != path]
        frame.destroy()
        if not self.files:
            self.drop_label.configure(text="Drop files here  or  Click to Browse")

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
            out_dir = p.parent / "compressed"
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
                self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Working...", text_color="gray60"))
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
                        self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Already small", text_color="gray"))
                    elif result["success"]:
                        self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Done ✓", text_color="green"))
                    else:
                        self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Target missed", text_color="orange"))
                except Exception:
                    traceback.print_exc()
                    self.root.after(0, lambda lbl=row["status_lbl"]: lbl.configure(text="Error", text_color="red"))

            self.root.after(0, lambda: self.compress_btn.configure(state="normal", text="Compress All"))

        threading.Thread(target=run, daemon=True).start()

    def _show_error(self, msg: str):
        import tkinter.messagebox as mb
        mb.showerror("FilePress", msg)

    def run(self):
        self.root.mainloop()
