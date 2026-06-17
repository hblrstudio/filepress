import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://filepressapp.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "FilePress — Compress Images, Videos & PDFs to Any Size",
    template: "%s | FilePress",
  },
  description:
    "Compress images, videos and PDFs to any file size without uploading anything. Type '500 KB' or '50 MB' and FilePress hits it automatically. JPEG, PNG, WEBP, HEIC, PDF, MP4, MOV — offline, Mac and Windows.",
  keywords: [
    "image compression",
    "video compression",
    "file compression",
    "compress images",
    "compress video",
    "compress PDF",
    "compress mp4",
    "compress mp4 to 50mb",
    "compress video without uploading",
    "compress images without uploading",
    "offline file compressor",
    "offline image compressor",
    "no upload file compressor",
    "reduce image size",
    "reduce video file size",
    "reduce pdf file size",
    "compress JPEG",
    "compress PNG",
    "compress WEBP",
    "compress HEIC",
    "image compressor mac",
    "video compressor mac",
    "file compressor mac",
    "file compressor windows",
    "compress file to target size",
    "desktop file compressor",
  ],
  authors: [{ name: "FilePress" }],
  creator: "FilePress",
  publisher: "FilePress",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "FilePress — Compress Images, Videos & PDFs to Any Size",
    description:
      "Type a target size, hit compress. FilePress shrinks JPEG, PNG, WEBP, HEIC, PDF, MP4 and MOV on your Mac or PC — no upload, no cloud, works completely offline.",
    type: "website",
    url: BASE_URL,
    siteName: "FilePress",
  },
  twitter: {
    card: "summary_large_image",
    title: "FilePress — Compress Images, Videos & PDFs to Any Size",
    description:
      "Type the size you need. FilePress hits it. No upload, no cloud, works offline. Mac + Windows.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-apple-bg font-sans text-apple-text antialiased">
        {children}
      </body>
    </html>
  );
}
