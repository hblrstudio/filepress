export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "faq"; q: string; a: string }
  | { type: "callout"; text: string };

export interface Article {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  blocks: Block[];
  faqSchema: { q: string; a: string }[];
}

export const articles: Article[] = [
  {
    slug: "compress-video-to-target-size-mac",
    title: "How to compress a video to any file size on Mac (without uploading)",
    description:
      "Target-size video compression, offline — no cloud, no account. Works for MP4 and MOV files on Mac and Windows.",
    publishedAt: "2026-06-17",
    readingTime: "4 min read",
    blocks: [
      {
        type: "p",
        text: "You need a video under 25 MB for an email attachment. Or under 50 MB for a Discord upload. Or under 100 MB for a client deliverable. The problem: every tool either uploads your file to a server, or gives you a quality slider with no idea what the output size will be.",
      },
      {
        type: "p",
        text: "This guide covers three ways to compress a video to a specific file size on Mac — including one method that runs entirely offline.",
      },
      {
        type: "h2",
        text: "Method 1: FilePress (offline, target size mode)",
      },
      {
        type: "p",
        text: "FilePress is a Mac and Windows desktop app that lets you type the file size you need — \"50 MB\", \"8 MB\", \"500 KB\" — and compresses your MP4 or MOV to hit that target automatically. No upload, no account, runs completely offline.",
      },
      {
        type: "ol",
        items: [
          "Download FilePress and open it",
          "Drag your MP4 or MOV file into the app",
          "Switch to Target Size mode and type your target (e.g. \"50 MB\")",
          "Click Compress — the app runs a 2-pass H.264 encode tuned to your target",
          "The compressed file is saved next to your original",
        ],
      },
      {
        type: "callout",
        text: "FilePress uses a 2-pass VBR encode: pass 1 analyzes the video, pass 2 encodes at the exact bitrate needed to hit your target. This is more accurate than a single-pass encode with a quality slider.",
      },
      {
        type: "h2",
        text: "Method 2: HandBrake (free, open source, offline)",
      },
      {
        type: "p",
        text: "HandBrake is a free open-source video transcoder available for Mac, Windows and Linux. It does not have a target-size mode, but you can calculate the required bitrate manually.",
      },
      {
        type: "ol",
        items: [
          "Download HandBrake from handbrake.fr",
          "Open your video file",
          "Note the video duration in seconds",
          "Calculate target bitrate: (target_MB × 8 × 1024) ÷ duration_seconds = kbps total. Subtract 128 kbps for audio.",
          "In HandBrake → Video tab → set Average Bitrate to your calculated number",
          "Check \"2-Pass Encoding\" for better accuracy",
          "Click Start",
        ],
      },
      {
        type: "p",
        text: "Example: you want a 50 MB video that is 3 minutes (180 seconds) long. Total bitrate = (50 × 8 × 1024) ÷ 180 ≈ 2275 kbps. Subtract 128 kbps audio = 2147 kbps video bitrate.",
      },
      {
        type: "h2",
        text: "Method 3: ffmpeg (command line, free)",
      },
      {
        type: "p",
        text: "If you're comfortable with the Terminal, ffmpeg gives you direct control over every encoding parameter.",
      },
      {
        type: "ol",
        items: [
          "Install ffmpeg: brew install ffmpeg",
          "Run a 2-pass encode targeting 50 MB for a 3-minute video:",
        ],
      },
      {
        type: "p",
        text: "Pass 1: ffmpeg -y -i input.mp4 -c:v libx264 -b:v 2147k -pass 1 -an -f null /dev/null",
      },
      {
        type: "p",
        text: "Pass 2: ffmpeg -y -i input.mp4 -c:v libx264 -b:v 2147k -pass 2 -c:a aac -b:a 128k output.mp4",
      },
      {
        type: "h2",
        text: "Which method should you use?",
      },
      {
        type: "ul",
        items: [
          "FilePress — best if you want to type a size and get a result without calculating anything",
          "HandBrake — best if you want free, open-source, and don't mind doing the bitrate math",
          "ffmpeg — best if you're scripting or need maximum control",
        ],
      },
      {
        type: "h2",
        text: "Frequently asked questions",
      },
      {
        type: "faq",
        q: "Can I compress a video to a specific file size on Mac without uploading it?",
        a: "Yes. FilePress and HandBrake both run entirely offline — your video never leaves your computer. FilePress has a target size mode where you type the size you need; HandBrake requires you to calculate the bitrate manually.",
      },
      {
        type: "faq",
        q: "How do I compress an MP4 to 50 MB on Mac?",
        a: "Open FilePress, drag your MP4 into the app, switch to Target Size mode, type '50 MB', and click Compress. The app calculates the required bitrate and encodes the video to hit that target. Alternatively, use HandBrake with a manually calculated bitrate of (50 × 8 × 1024) ÷ duration_seconds − 128 kbps.",
      },
      {
        type: "faq",
        q: "Does compressing a video reduce its quality?",
        a: "Yes — video compression always involves some quality trade-off. A 2-pass VBR encode (which FilePress and HandBrake use) distributes quality more evenly across the video than a fixed-quality encode, so the result looks better at the same file size.",
      },
      {
        type: "faq",
        q: "What is the best free video compressor for Mac?",
        a: "HandBrake is the best free open-source video compressor for Mac. For a simpler interface with target-size mode built in, FilePress offers 10 free compressions without an account or upload.",
      },
      {
        type: "faq",
        q: "Can I compress MOV to MP4 on Mac without uploading?",
        a: "Yes. FilePress accepts MOV files and always outputs MP4 (H.264), which is smaller and more compatible. The entire conversion runs offline on your machine.",
      },
    ],
    faqSchema: [
      {
        q: "Can I compress a video to a specific file size on Mac without uploading it?",
        a: "Yes. FilePress and HandBrake both run entirely offline — your video never leaves your computer. FilePress has a target size mode where you type the size you need; HandBrake requires you to calculate the bitrate manually.",
      },
      {
        q: "How do I compress an MP4 to 50 MB on Mac?",
        a: "Open FilePress, drag your MP4 into the app, switch to Target Size mode, type '50 MB', and click Compress. The app calculates the required bitrate and encodes the video to hit that target.",
      },
      {
        q: "Does compressing a video reduce its quality?",
        a: "Yes — video compression always involves some quality trade-off. A 2-pass VBR encode distributes quality more evenly across the video than a fixed-quality encode, so the result looks better at the same file size.",
      },
      {
        q: "What is the best free video compressor for Mac?",
        a: "HandBrake is the best free open-source video compressor for Mac. For a simpler interface with target-size mode built in, FilePress offers 10 free compressions without an account or upload.",
      },
      {
        q: "Can I compress MOV to MP4 on Mac without uploading?",
        a: "Yes. FilePress accepts MOV files and always outputs MP4 (H.264), which is smaller and more compatible. The entire conversion runs offline on your machine.",
      },
    ],
  },

  {
    slug: "compress-images-offline-instagram-whatsapp-email",
    title:
      "How to compress images for Instagram, WhatsApp and email — without uploading",
    description:
      "Hit exact platform limits offline. No third-party server receives your photos. Works for JPEG, PNG, WEBP and HEIC on Mac and Windows.",
    publishedAt: "2026-06-17",
    readingTime: "4 min read",
    blocks: [
      {
        type: "p",
        text: "Most image compression tools — TinyPNG, Squoosh, iLoveIMG — work by uploading your photo to their servers, compressing it there, and sending it back. That means every photo you compress passes through a third-party server you don't control.",
      },
      {
        type: "p",
        text: "This guide shows you how to compress images for Instagram, WhatsApp, email and other platforms without uploading anything.",
      },
      {
        type: "h2",
        text: "Platform size limits at a glance",
      },
      {
        type: "ul",
        items: [
          "Instagram: recommends under 8 MB, compresses anything larger automatically (losing quality)",
          "WhatsApp: 16 MB max, but compresses images above ~1 MB visibly",
          "Gmail attachments: 25 MB total per email",
          "Outlook attachments: 20 MB total per email",
          "Twitter/X: 5 MB per image",
          "LinkedIn: 8 MB per image",
        ],
      },
      {
        type: "h2",
        text: "Method 1: FilePress (offline, target size or quality mode)",
      },
      {
        type: "p",
        text: "FilePress is a Mac and Windows desktop app that compresses JPEG, PNG, WEBP and HEIC files entirely offline. It has one-click presets for Instagram, WhatsApp, Email, Twitter/X and LinkedIn — so you never have to remember the limits.",
      },
      {
        type: "ol",
        items: [
          "Download FilePress and open it",
          "Drag your image into the app (JPEG, PNG, WEBP or HEIC)",
          "Select a platform preset (Instagram, WhatsApp, Email, etc.) or type a custom target like '1 MB'",
          "Click Compress — FilePress uses a binary search across quality levels to find the highest quality that fits under your target",
          "The compressed image is saved next to the original",
        ],
      },
      {
        type: "callout",
        text: "Unlike web tools, FilePress never sends your image to any server. Compression runs on your CPU using the same Pillow/libjpeg library that powers professional image editing software.",
      },
      {
        type: "h2",
        text: "Method 2: Preview on Mac (free, built-in)",
      },
      {
        type: "p",
        text: "Mac's built-in Preview app can reduce image file size without any additional software.",
      },
      {
        type: "ol",
        items: [
          "Open the image in Preview",
          "File → Export",
          "Adjust the Quality slider — lower quality = smaller file",
          "Check the estimated file size shown below the slider",
          "Click Save",
        ],
      },
      {
        type: "p",
        text: "The downside: Preview doesn't show you the exact output size before saving, so you often need to export, check, and repeat.",
      },
      {
        type: "h2",
        text: "Method 3: ImageOptim (free, Mac only)",
      },
      {
        type: "p",
        text: "ImageOptim is a free Mac app that strips metadata and runs multiple compression algorithms on your image. It's lossless by default (preserves quality, reduces file size by 20–40%). It also has a lossy mode for larger reductions. No upload required.",
      },
      {
        type: "h2",
        text: "Best method by use case",
      },
      {
        type: "ul",
        items: [
          "Instagram / WhatsApp / Twitter/X — FilePress platform presets (one click, exact size target)",
          "Email attachments — FilePress 'Email' preset or 'custom target KB'",
          "Batch compression of many images — FilePress supports multiple files at once",
          "Lossless optimization only — ImageOptim (Mac)",
          "One-off quick export — Preview on Mac",
        ],
      },
      {
        type: "h2",
        text: "Frequently asked questions",
      },
      {
        type: "faq",
        q: "How do I compress an image for Instagram without losing quality?",
        a: "Use a tool with a target-size mode (like FilePress) set to under 8 MB. At high quality settings, the difference is imperceptible. Avoid re-compressing an already compressed JPEG — each round-trip degrades quality.",
      },
      {
        type: "faq",
        q: "How do I compress photos for WhatsApp without uploading them?",
        a: "FilePress runs entirely offline and compresses JPEG, PNG and HEIC files without sending them to any server. Select the WhatsApp preset or type '1 MB' as a target size to stay under WhatsApp's visible-compression threshold.",
      },
      {
        type: "faq",
        q: "What is the best offline image compressor for Mac?",
        a: "FilePress and ImageOptim are the two main offline options on Mac. FilePress supports target size mode (type '500 KB' and it hits it) across JPEG, PNG, WEBP and HEIC. ImageOptim is better for lossless-only compression.",
      },
      {
        type: "faq",
        q: "Can I compress HEIC images on Mac without converting them?",
        a: "FilePress supports HEIC compression directly. It does not require you to convert to JPEG first.",
      },
      {
        type: "faq",
        q: "How do I reduce image file size for email on Mac?",
        a: "Open the image in FilePress, select the Email preset (or type your attachment limit as the target), and click Compress. The app finds the highest quality that fits under your limit and saves the result locally — no upload required.",
      },
    ],
    faqSchema: [
      {
        q: "How do I compress an image for Instagram without losing quality?",
        a: "Use a tool with a target-size mode set to under 8 MB. At high quality settings, the difference is imperceptible. Avoid re-compressing an already compressed JPEG — each round-trip degrades quality.",
      },
      {
        q: "How do I compress photos for WhatsApp without uploading them?",
        a: "FilePress runs entirely offline and compresses JPEG, PNG and HEIC files without sending them to any server. Select the WhatsApp preset or type '1 MB' as a target size.",
      },
      {
        q: "What is the best offline image compressor for Mac?",
        a: "FilePress and ImageOptim are the two main offline options on Mac. FilePress supports target size mode across JPEG, PNG, WEBP and HEIC. ImageOptim is better for lossless-only compression.",
      },
      {
        q: "Can I compress HEIC images on Mac without converting them?",
        a: "FilePress supports HEIC compression directly without requiring conversion to JPEG first.",
      },
      {
        q: "How do I reduce image file size for email on Mac?",
        a: "Open the image in FilePress, select the Email preset or type your attachment limit as the target, and click Compress. No upload required.",
      },
    ],
  },

  {
    slug: "reduce-pdf-file-size-mac",
    title: "How to reduce PDF file size on Mac without losing quality",
    description:
      "Three methods compared — Preview, web tools, and offline compression. Which one preserves quality best and keeps your file private.",
    publishedAt: "2026-06-17",
    readingTime: "5 min read",
    blocks: [
      {
        type: "p",
        text: "A 50 MB PDF won't go through an email. A 20-page presentation shouldn't need 200 MB. Reducing PDF file size on Mac is surprisingly awkward — Preview's built-in filter destroys quality, and web tools upload your document to a third-party server.",
      },
      {
        type: "p",
        text: "This guide covers three methods, what each one actually does to your file, and when to use which.",
      },
      {
        type: "h2",
        text: "Method 1: Preview's 'Reduce File Size' filter (quick but destructive)",
      },
      {
        type: "p",
        text: "Preview on macOS has a built-in Export → Quartz Filter → 'Reduce File Size' option. It's the first thing most people try.",
      },
      {
        type: "ol",
        items: [
          "Open your PDF in Preview",
          "File → Export as PDF",
          "Click the Quartz Filter dropdown → Reduce File Size",
          "Click Save",
        ],
      },
      {
        type: "p",
        text: "The problem: Apple's Reduce File Size filter is very aggressive. It re-encodes all images at a fixed low resolution (72 DPI) regardless of content. A 5 MB PDF can become 500 KB — but photos and diagrams will look visibly degraded. For text-only documents it works fine; for anything with images, avoid it.",
      },
      {
        type: "h2",
        text: "Method 2: FilePress (offline, quality control)",
      },
      {
        type: "p",
        text: "FilePress is a Mac and Windows desktop app that compresses PDFs using pikepdf — the same library used by professional PDF tools. It strips metadata, optimizes internal streams, and re-compresses images at a quality level you control. Your file never leaves your machine.",
      },
      {
        type: "ol",
        items: [
          "Download FilePress and open it",
          "Drag your PDF into the app",
          "Choose a quality level (80–90 for print quality, 60–70 for screen/web, 40–50 for email attachment priority)",
          "Or switch to Target Size mode and type a target like '5 MB'",
          "Click Compress",
        ],
      },
      {
        type: "callout",
        text: "FilePress also strips all metadata from PDFs — author name, software used, modification dates — which is useful for documents you're sharing with clients or publishing publicly.",
      },
      {
        type: "h2",
        text: "Method 3: Web tools (iLovePDF, Smallpdf, Adobe)",
      },
      {
        type: "p",
        text: "Web-based PDF compressors work, but they upload your document to a server. For internal documents, contracts, client proposals, or anything confidential, this is a meaningful privacy trade-off.",
      },
      {
        type: "ul",
        items: [
          "iLovePDF — free tier with file size limits, uploads to their servers",
          "Smallpdf — freemium, uploads to their servers",
          "Adobe Acrobat online — requires Adobe account, uploads to Adobe's servers",
        ],
      },
      {
        type: "p",
        text: "If the document isn't sensitive, these tools work fine. If it is, use FilePress or a local tool.",
      },
      {
        type: "h2",
        text: "Which method is best?",
      },
      {
        type: "ul",
        items: [
          "Text-only documents, quality not critical — Preview Reduce File Size (free, built-in)",
          "Documents with images, need quality control — FilePress (offline, quality slider)",
          "Target a specific file size — FilePress target size mode",
          "Confidential documents — FilePress or any local tool (never upload confidential PDFs)",
          "Quick, don't care about privacy — iLovePDF or Smallpdf",
        ],
      },
      {
        type: "h2",
        text: "How much can you reduce a PDF's file size?",
      },
      {
        type: "p",
        text: "It depends heavily on the PDF's content:",
      },
      {
        type: "ul",
        items: [
          "Text-only PDFs: 10–30% reduction (most of the space is already efficient)",
          "PDFs with embedded images: 50–85% reduction at medium quality settings",
          "Scanned PDFs (images of pages): 60–90% reduction, but text may become blurry at high compression",
          "PDFs from Keynote/PowerPoint: 30–60% reduction",
        ],
      },
      {
        type: "h2",
        text: "Frequently asked questions",
      },
      {
        type: "faq",
        q: "How do I reduce PDF file size on Mac without losing quality?",
        a: "Use FilePress with a high quality setting (80–90). This re-compresses internal image streams while preserving visible quality. Avoid Preview's 'Reduce File Size' Quartz Filter — it forces all images to 72 DPI, which visibly degrades photos and diagrams.",
      },
      {
        type: "faq",
        q: "Why does Preview's 'Reduce File Size' look so bad?",
        a: "Apple's built-in Quartz filter re-encodes all images in the PDF at 72 DPI, regardless of the original resolution. This works for text-only documents but destroys image quality in any PDF with photos, charts, or diagrams.",
      },
      {
        type: "faq",
        q: "How do I compress a PDF without uploading it?",
        a: "FilePress compresses PDFs entirely offline using pikepdf — your document never leaves your machine. It strips metadata, optimizes streams, and re-compresses embedded images at a quality level you set.",
      },
      {
        type: "faq",
        q: "Is it safe to upload a PDF to iLovePDF or Smallpdf?",
        a: "For non-sensitive documents, these tools are generally safe — they claim to delete files after processing. For contracts, proposals, financial documents, or anything confidential, use a local tool like FilePress that never uploads your file.",
      },
      {
        type: "faq",
        q: "How do I reduce a PDF below 10 MB on Mac?",
        a: "Open the PDF in FilePress, switch to Target Size mode, type '10 MB', and click Compress. The app calculates the right compression settings to hit that target. For PDFs with many images, you may need to accept a quality trade-off to reach very small targets.",
      },
    ],
    faqSchema: [
      {
        q: "How do I reduce PDF file size on Mac without losing quality?",
        a: "Use FilePress with a high quality setting (80–90). Avoid Preview's 'Reduce File Size' Quartz Filter — it forces all images to 72 DPI and visibly degrades photos and diagrams.",
      },
      {
        q: "Why does Preview's 'Reduce File Size' look so bad?",
        a: "Apple's Quartz filter re-encodes all images in the PDF at 72 DPI regardless of original resolution. It works for text-only PDFs but destroys quality in any PDF with photos or diagrams.",
      },
      {
        q: "How do I compress a PDF without uploading it?",
        a: "FilePress compresses PDFs entirely offline using pikepdf — your document never leaves your machine. It strips metadata and re-compresses embedded images at a quality level you control.",
      },
      {
        q: "Is it safe to upload a PDF to iLovePDF or Smallpdf?",
        a: "For non-sensitive documents these tools are generally safe. For contracts, proposals, or anything confidential, use a local tool like FilePress that never uploads your file.",
      },
      {
        q: "How do I reduce a PDF below 10 MB on Mac?",
        a: "Open the PDF in FilePress, switch to Target Size mode, type '10 MB', and click Compress. The app calculates the right settings to hit that target.",
      },
    ],
  },
  {
    slug: "best-offline-file-compressor-mac-windows",
    title: "Best offline file compressor for Mac and Windows (2026)",
    description:
      "Compared: tools that compress images, PDFs and videos without uploading to the cloud. What each one actually does, and which one to use.",
    publishedAt: "2026-06-17",
    readingTime: "5 min read",
    blocks: [
      {
        type: "p",
        text: "If you search for a file compressor, most results are web apps — TinyPNG, Smallpdf, Clideo, CloudConvert. They all work the same way: you upload your file, their server compresses it, you download the result. Your file travels to a third-party computer you don't control.",
      },
      {
        type: "p",
        text: "Offline file compressors run on your machine. Nothing is uploaded. This page compares the main options for Mac and Windows.",
      },
      {
        type: "h2",
        text: "What 'offline' actually means",
      },
      {
        type: "p",
        text: "An offline compressor processes your file using your CPU, locally. It does not send the file to any server. You can use it with no internet connection. Your files are not stored by any third party. This matters for confidential documents, client work, legal files, and photos you'd rather not hand over to a company's servers.",
      },
      {
        type: "h2",
        text: "Best offline tools by file type",
      },
      {
        type: "h3",
        text: "Images (JPEG, PNG, WEBP, HEIC)",
      },
      {
        type: "ul",
        items: [
          "FilePress (Mac + Windows) — target size mode (type '500 KB' and it hits it), quality slider, platform presets for Instagram/WhatsApp/Email/Twitter. Supports JPEG, PNG, WEBP, HEIC.",
          "ImageOptim (Mac only, free) — lossless and lossy compression, drag-and-drop batch. No target size mode. Best for bulk lossless optimization.",
          "Squoosh (browser, offline-capable) — Google's image compression tool works without uploading if you use it as a PWA. No batch processing. No target size mode.",
          "Preview on Mac (free, built-in) — Export → Quartz Filter → Reduce File Size. Simple but no quality control — you can't see the output size before saving.",
        ],
      },
      {
        type: "h3",
        text: "PDFs",
      },
      {
        type: "ul",
        items: [
          "FilePress (Mac + Windows) — strips metadata, re-compresses embedded images, target size mode. Offline.",
          "Preview on Mac (free, built-in) — Quartz Filter reduces file size but forces all images to 72 DPI. Works for text-only PDFs; degrades image quality significantly.",
          "Ghostscript (command line, free) — the most powerful PDF compression tool. Complex to use. Offline.",
          "PDF Squeezer (Mac, paid) — GUI wrapper around PDF compression. Offline.",
        ],
      },
      {
        type: "h3",
        text: "Video (MP4, MOV)",
      },
      {
        type: "ul",
        items: [
          "FilePress (Mac + Windows) — target size mode for MP4/MOV, 2-pass H.264 encode. Offline.",
          "HandBrake (Mac + Windows + Linux, free) — the standard open-source video transcoder. No target size mode (you calculate bitrate manually). Offline.",
          "ffmpeg (command line, free) — maximum control, batch processing, scripting. No GUI. Offline.",
          "Shutter Encoder (Mac + Windows, free) — GUI wrapper around ffmpeg. Many format options. Offline.",
        ],
      },
      {
        type: "h2",
        text: "Comparison table",
      },
      {
        type: "ul",
        items: [
          "FilePress — Mac + Windows · Images + PDF + Video · Target size mode ✓ · Offline ✓ · GUI ✓",
          "ImageOptim — Mac only · Images · Target size mode ✗ · Offline ✓ · GUI ✓",
          "HandBrake — Mac + Windows + Linux · Video only · Target size mode ✗ (manual calc) · Offline ✓ · GUI ✓",
          "Preview — Mac only · Images + PDF · Target size mode ✗ · Offline ✓ · GUI ✓ (built-in)",
          "ffmpeg — Mac + Windows + Linux · All formats · Target size mode ✓ (manual) · Offline ✓ · CLI only",
        ],
      },
      {
        type: "h2",
        text: "Web tools vs. offline tools",
      },
      {
        type: "p",
        text: "Web tools (TinyPNG, Smallpdf, Clideo, CloudConvert, iLovePDF) upload your file to a server. They're convenient for one-off public files. For anything confidential — contracts, client assets, internal documents, personal photos — use an offline tool.",
      },
      {
        type: "p",
        text: "Web tools also have file size limits on free tiers, require an internet connection, and may retain your files for a period after processing. Offline tools have none of these constraints.",
      },
      {
        type: "h2",
        text: "Which tool should you use?",
      },
      {
        type: "ul",
        items: [
          "You need to hit a specific file size — FilePress (images, PDF, video)",
          "You're on Mac and need free lossless image compression — ImageOptim",
          "You need video compression with a GUI — HandBrake (free) or FilePress (target size mode)",
          "You need PDF compression built into macOS — Preview (text-only PDFs) or FilePress (image PDFs)",
          "You need maximum control and are comfortable with the command line — ffmpeg",
        ],
      },
      {
        type: "h2",
        text: "Frequently asked questions",
      },
      {
        type: "faq",
        q: "What is the best offline file compressor for Mac?",
        a: "For images and PDFs, FilePress and ImageOptim are the main offline options on Mac. FilePress handles JPEG, PNG, WEBP, HEIC, PDF, MP4 and MOV in one app with a target size mode. ImageOptim is free and great for lossless image compression. For video, HandBrake is the standard free offline option.",
      },
      {
        type: "faq",
        q: "Is there an offline file compressor for Windows?",
        a: "Yes. FilePress is available for both Mac and Windows. HandBrake (video) and Ghostscript (PDF) are also cross-platform. ImageOptim is Mac-only.",
      },
      {
        type: "faq",
        q: "Can I compress files without uploading them to the cloud?",
        a: "Yes. Offline tools like FilePress, ImageOptim, HandBrake and Preview (Mac) all compress files locally on your machine — nothing is sent to any server. FilePress covers images, PDFs and video in one app.",
      },
      {
        type: "faq",
        q: "What is the difference between FilePress and TinyPNG?",
        a: "TinyPNG is a web tool that uploads your image to their servers for compression. FilePress compresses images locally on your Mac or PC — no upload, no account, no internet required. FilePress also supports PDFs and video, which TinyPNG does not.",
      },
      {
        type: "faq",
        q: "What is the difference between FilePress and HandBrake?",
        a: "HandBrake is a free open-source video transcoder with no target size mode — you have to calculate bitrate manually. FilePress handles video with a target size mode (type the size you need), plus images and PDFs in the same app.",
      },
    ],
    faqSchema: [
      {
        q: "What is the best offline file compressor for Mac?",
        a: "FilePress handles JPEG, PNG, WEBP, HEIC, PDF, MP4 and MOV in one app with a target size mode. ImageOptim is free and good for lossless image compression only. For video, HandBrake is the standard free offline option.",
      },
      {
        q: "Is there an offline file compressor for Windows?",
        a: "Yes. FilePress is available for both Mac and Windows. HandBrake (video) and Ghostscript (PDF) are also cross-platform.",
      },
      {
        q: "Can I compress files without uploading them to the cloud?",
        a: "Yes. FilePress, ImageOptim, HandBrake and Preview (Mac) all compress files locally — nothing is sent to any server.",
      },
      {
        q: "What is the difference between FilePress and TinyPNG?",
        a: "TinyPNG uploads your image to their servers. FilePress compresses images locally — no upload, no account, no internet required. FilePress also handles PDFs and video.",
      },
      {
        q: "What is the difference between FilePress and HandBrake?",
        a: "HandBrake is video-only with no target size mode — you calculate bitrate manually. FilePress has a target size mode for video, plus handles images and PDFs in the same app.",
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
