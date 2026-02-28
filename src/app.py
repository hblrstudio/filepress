import customtkinter as ctk

ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")


class FileCompressorApp:
    def __init__(self):
        self.root = ctk.CTk()
        self.root.title("FilePress")
        self.root.geometry("680x620")
        self.root.resizable(False, False)
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
        ctk.CTkLabel(frame, text="FilePress", font=ctk.CTkFont(size=22, weight="bold")).pack(side="left")
        ctk.CTkLabel(frame, text="Compress to any size", font=ctk.CTkFont(size=13), text_color="gray").pack(side="left", padx=10)

    def _build_drop_zone(self):
        self.drop_frame = ctk.CTkFrame(self.root, height=120, border_width=2, border_color="gray40", corner_radius=12)
        self.drop_frame.pack(fill="x", padx=20, pady=16)
        self.drop_frame.pack_propagate(False)
        self.drop_label = ctk.CTkLabel(self.drop_frame, text="Drop files here  or  Click to Browse",
                                        font=ctk.CTkFont(size=14), text_color="gray60")
        self.drop_label.place(relx=0.5, rely=0.5, anchor="center")
        self.drop_frame.bind("<Button-1>", self._on_browse)

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
        ctk.CTkLabel(frame, text="Output:").pack(side="left")
        self.output_label = ctk.CTkLabel(frame, text="Same folder / compressed", text_color="gray60")
        self.output_label.pack(side="left", padx=8)
        ctk.CTkButton(frame, text="Change", width=70, command=self._on_change_output).pack(side="left")
        self.output_dir = None  # None = use default (next to original)

    def _build_compress_button(self):
        self.compress_btn = ctk.CTkButton(self.root, text="Compress All", height=42,
                                           font=ctk.CTkFont(size=15, weight="bold"),
                                           command=self._on_compress)
        self.compress_btn.pack(padx=20, pady=(0, 16), fill="x")

    # ── Event handlers (stubs — wired in Task 5) ──────────────────────────

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
        pass  # implemented in Task 5

    def _on_change_output(self):
        pass  # implemented in Task 5

    def _on_compress(self):
        pass  # implemented in Task 5

    def run(self):
        self.root.mainloop()
