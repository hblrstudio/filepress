import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FilePress — Compress images & PDFs to any size",
  description:
    "Drop a file, pick a target size, hit compress. FilePress shrinks JPEG, PNG, WEBP, HEIC and PDF files instantly — no upload, no cloud, no fuss.",
  openGraph: {
    title: "FilePress — Compress images & PDFs to any size",
    description:
      "Drop a file, pick a target size, hit compress. FilePress shrinks images and PDFs instantly on your Mac or PC.",
    type: "website",
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
