import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://filepressapp.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "FilePress — Compress Images & PDFs to Any Size",
    template: "%s | FilePress",
  },
  description:
    "Free image and PDF compression for Mac and Windows. Type a target size like '500 KB' and FilePress hits it. Compress JPEG, PNG, WEBP, HEIC, PDF — no upload, no cloud, works offline.",
  keywords: [
    "image compression",
    "file compression",
    "compress images",
    "compress PDF",
    "image compressor",
    "reduce image size",
    "compress JPEG",
    "compress PNG",
    "compress WEBP",
    "compress HEIC",
    "image compression mac",
    "image compression windows",
    "offline image compressor",
    "no upload image compressor",
    "desktop image compressor",
  ],
  authors: [{ name: "FilePress" }],
  creator: "FilePress",
  publisher: "FilePress",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "FilePress — Compress Images & PDFs to Any Size",
    description:
      "Type a target size, hit compress. FilePress shrinks JPEG, PNG, WEBP, HEIC and PDF files instantly on your Mac or PC — no upload, no cloud, works offline.",
    type: "website",
    url: BASE_URL,
    siteName: "FilePress",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "FilePress — Compress Images & PDFs to Any Size",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FilePress — Compress Images & PDFs to Any Size",
    description:
      "Type a target size, hit compress. No upload, no cloud, works offline. Mac + Windows.",
    images: ["/og.png"],
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
