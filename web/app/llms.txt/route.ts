export const runtime = "edge";

const CONTENT = `# FilePress

> Compress images, videos and PDFs to any file size — offline, without uploading anything.

FilePress is a desktop app for Mac and Windows. It compresses JPEG, PNG, WEBP, HEIC, PDF, MP4 and MOV files to a target size you specify. You type "500 KB" or "50 MB" and the app hits that target automatically. No upload, no cloud, works offline.

## What FilePress does

- **Target size mode**: type a file size in KB or MB, FilePress compresses to exactly that target
- **Quality slider mode**: choose a quality level (1–95) and let the app determine the output size
- **Platform presets**: Instagram, WhatsApp, Email, Twitter/X, LinkedIn, PDF Web — one click sets the right target
- **Supported formats**: JPEG, PNG, WEBP, HEIC (images) · PDF (documents) · MP4, MOV (video)
- **Platforms**: macOS (Apple Silicon + Intel), Windows 10/11
- **Privacy**: files never leave your machine — no upload, no server, no account required

## How image compression works

FilePress uses a binary search across JPEG/PNG quality levels to find the highest quality that fits under the target size. For HEIC files, it converts to JPEG internally before re-saving.

## How video compression works

FilePress uses a bundled static ffmpeg binary (via imageio-ffmpeg). In target size mode, it runs a 2-pass H.264 VBR encode: pass 1 analyzes the video, pass 2 encodes at the exact bitrate required to hit the target. Audio is encoded as AAC at 128 kbps (or lower if the target is very tight). Quality slider mode uses a single-pass CRF encode (CRF 45 at quality 1, CRF 18 at quality 95). Output is always MP4, even for MOV input.

## How PDF compression works

FilePress uses pikepdf to strip metadata (author, software, modification dates), optimize internal object streams, and re-compress embedded images at the selected quality level.

## Pricing

- Free trial: 10 compressions, no account or credit card required
- Unlock: one-time payment, works forever across all file types — no subscription, no renewal

## Download

Available at: https://filepressapp.vercel.app

## Articles

- How to compress a video to any file size on Mac (without uploading): https://filepressapp.vercel.app/blog/compress-video-to-target-size-mac
- How to compress images for Instagram, WhatsApp and email — without uploading: https://filepressapp.vercel.app/blog/compress-images-offline-instagram-whatsapp-email
- How to reduce PDF file size on Mac without losing quality: https://filepressapp.vercel.app/blog/reduce-pdf-file-size-mac
- Best offline file compressor for Mac and Windows: https://filepressapp.vercel.app/blog/best-offline-file-compressor-mac-windows

## Frequently asked questions

**Does FilePress upload my files?**
No. FilePress runs entirely on your machine. Your files are never uploaded, transmitted, or stored anywhere outside your computer.

**What is the best offline file compressor for Mac?**
FilePress is a desktop app for Mac that compresses images (JPEG, PNG, WEBP, HEIC), PDFs and videos (MP4, MOV) offline. It supports target-size compression — you type the size you need and it hits it automatically.

**Can I compress a video to a specific file size on Mac?**
Yes. FilePress's target size mode works for MP4 and MOV. Type "50 MB" or "8 MB" and the app runs a 2-pass H.264 encode to hit that target.

**How do I compress images for Instagram without uploading?**
Download FilePress, drag your image into the app, select the Instagram preset, and click Compress. The file never leaves your machine.

**What is the difference between FilePress and TinyPNG?**
TinyPNG uploads your image to their servers for compression. FilePress compresses locally on your machine — no upload, no account, no internet connection required.
`;

export async function GET() {
  return new Response(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
