import { DownloadButton, DownloadCards } from "./components/DownloadButton";
import versionData from "../public/version.json";
import Link from "next/link";
import { jsonLdString } from "./lib/json-ld";

const FEATURES = [
  {
    icon: "⬇",
    title: "Hit an exact file size",
    description:
      "Type '500 KB' or '50 MB' and FilePress finds the right quality automatically. No guessing, no slider adjusting, no re-exporting three times.",
  },
  {
    icon: "🎛",
    title: "Presets for every platform",
    description:
      "Instagram, WhatsApp, Email, Twitter/X, LinkedIn, PDF Web. One click sets the right target size — no Googling 'what size does Instagram accept'.",
  },
  {
    icon: "🔒",
    title: "Your files never leave your machine",
    description:
      "No uploads. No account. No cloud processing. FilePress runs entirely offline — what you compress stays on your computer, full stop.",
  },
  {
    icon: "📄",
    title: "Images, PDFs and video in one app",
    description:
      "JPEG, PNG, WEBP, HEIC, PDF, MP4, MOV — all handled in one place. No more switching between five different tools for five different file types.",
  },
];

const FORMATS = ["JPEG", "PNG", "WEBP", "HEIC", "PDF", "MP4", "MOV"];

const FEATURED_ARTICLES = [
  {
    slug: "best-offline-file-compressor-mac-windows",
    title: "Best offline file compressor for Mac and Windows (2026)",
    description: "Compared: tools that compress images, PDFs and videos without uploading to the cloud.",
  },
  {
    slug: "compress-video-to-target-size-mac",
    title: "How to compress a video to any file size on Mac (without uploading)",
    description: "Target-size video compression, offline. Works for MP4 and MOV.",
  },
  {
    slug: "compress-images-offline-instagram-whatsapp-email",
    title: "How to compress images for Instagram, WhatsApp and email — without uploading",
    description: "Hit exact platform limits without sending your photos to a third-party server.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is FilePress free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FilePress is free to try — you get 10 free compressions with no account or credit card required. After that, a one-time payment of $19 unlocks unlimited compressions forever across all file types.",
      },
    },
    {
      "@type": "Question",
      name: "Does FilePress upload my files to the internet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FilePress runs entirely on your Mac or PC. Your files are never uploaded, transmitted, or stored anywhere outside your machine. Compression happens locally using your computer's processor.",
      },
    },
    {
      "@type": "Question",
      name: "What file formats does FilePress support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FilePress supports JPEG, PNG, WEBP, HEIC, PDF, MP4 and MOV compression. Images, PDFs and video clips are all handled in a single app without switching tools.",
      },
    },
    {
      "@type": "Question",
      name: "Can I compress a video to a specific file size?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. FilePress's target size mode works for video — type '50 MB' or '8 MB' and the app calculates the right bitrate and encodes the video to hit that target. It uses a 2-pass H.264 encode for accuracy.",
      },
    },
    {
      "@type": "Question",
      name: "How do I compress an MP4 without uploading it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Download FilePress for Mac or Windows, drag your MP4 into the app, type your target size (e.g. '50 MB'), and click Compress. The entire process runs locally — nothing is sent to any server.",
      },
    },
    {
      "@type": "Question",
      name: "How does the target size feature work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For images, FilePress runs a binary search across quality levels to find the highest quality that fits under your target. For video, it calculates the required bitrate from your target size and duration, then runs a 2-pass encode. For PDFs, it strips metadata and recompresses streams.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best offline file compressor for Mac?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FilePress is a desktop app for Mac (and Windows) that compresses images, PDFs and videos entirely offline. It supports target-size compression — you type the size you need and it hits it automatically — across JPEG, PNG, WEBP, HEIC, PDF, MP4 and MOV formats.",
      },
    },
    {
      "@type": "Question",
      name: "Is FilePress available for Windows?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. FilePress is available as a native app for both macOS and Windows.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a subscription fee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No subscription. FilePress costs $19 once and works forever across all formats — no renewals, no monthly fees, no feature locks.",
      },
    },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FilePress",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS, Windows",
  description:
    "Compress JPEG, PNG, WEBP, HEIC, PDF, MP4 and MOV files to a target size. No upload, no cloud, works offline. Mac and Windows desktop app.",
  offers: {
    "@type": "Offer",
    price: "19.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  softwareVersion: versionData.version,
  url: "https://filepressapp.vercel.app",
  keywords:
    "image compression, video compression, file compression, compress images, compress video, compress PDF, compress MP4, offline compressor, no upload compressor",
};

export default function Home() {
  const { version, mac_url, win_url } = versionData;

  return (
    <div className="min-h-screen bg-apple-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-apple-bg/80 backdrop-blur-xl border-b border-apple-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-apple-text text-[17px] tracking-tight">
            FilePress
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/blog"
              className="text-sm text-apple-secondary hover:text-apple-text transition-colors hidden sm:block"
            >
              Blog
            </Link>
            <a
              href="#download"
              className="text-sm font-medium text-apple-accent hover:text-apple-accent-hover transition-colors"
            >
              Download free
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 text-sm font-semibold px-4 py-2 rounded-full mb-6">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 0a7 7 0 1 1 0 14A7 7 0 0 1 7 0zm3.03 4.47L5.75 8.75 3.97 6.97l-.94.94 2.72 2.72 5.22-5.22-.94-.94z" fill="currentColor"/>
          </svg>
          Free to try — no account, no credit card
        </div>

        <h1 className="text-[44px] sm:text-[56px] font-bold text-apple-text leading-[1.08] tracking-tight mb-5">
          Your file is too big.
          <br />
          <span className="text-apple-accent">Tell us how small.</span>
        </h1>

        <p className="text-lg text-apple-secondary max-w-xl mx-auto mb-10">
          Type &ldquo;500 KB&rdquo; or &ldquo;50 MB&rdquo; and FilePress compresses your image, video or PDF to exactly that size — no upload, no cloud, works completely offline on Mac and Windows.
        </p>

        <DownloadButton
          macUrl={mac_url}
          winUrl={win_url}
          version={version}
        />

        {/* Format badges */}
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
          {FORMATS.map((f) => (
            <span
              key={f}
              className="text-xs font-medium bg-white border border-apple-border text-apple-secondary px-3 py-1 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-apple-border rounded-2xl p-5"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-apple-text text-sm mb-1.5">
                {f.title}
              </h3>
              <p className="text-apple-secondary text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What is FilePress ───────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-apple-text text-center mb-6">
          What is FilePress?
        </h2>
        <p className="text-apple-secondary text-center leading-relaxed mb-4">
          FilePress is a desktop app for Mac and Windows that compresses images, PDF files and video clips — entirely offline, without uploading anything to the cloud. It supports JPEG, PNG, WEBP, HEIC, PDF, MP4 and MOV in a single tool.
        </p>
        <p className="text-apple-secondary text-center leading-relaxed mb-4">
          Most compression tools make you guess — you drag a quality slider and hope the output is small enough. FilePress flips that: type a target size like <span className="font-medium text-apple-text">&ldquo;500 KB&rdquo;</span> or <span className="font-medium text-apple-text">&ldquo;50 MB&rdquo;</span> and the app figures out the right settings automatically. For images it uses a binary search across quality levels. For video it calculates the required bitrate and runs a 2-pass encode.
        </p>
        <p className="text-apple-secondary text-center leading-relaxed">
          It also ships with one-click presets for the most common use cases — Instagram, WhatsApp, Email, Twitter/X, LinkedIn, and PDF Web — so you&apos;re never Googling file size limits again.
        </p>
      </section>

      {/* ── Why FilePress ───────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-apple-text text-center mb-2">
          Why not just use TinyPNG or CloudConvert?
        </h2>
        <p className="text-apple-secondary text-center mb-10 text-sm">
          Fair question. Here&apos;s the honest answer.
        </p>
        <div className="space-y-3">
          {[
            {
              them: "TinyPNG, Squoosh, CloudConvert, Clideo — they all upload your files to their servers",
              us: "FilePress never touches the internet. Compression runs on your CPU — your files don't leave your machine.",
            },
            {
              them: "Other tools give you a quality slider and make you guess the output size",
              us: "Type the size you need — '500 KB', '50 MB' — and FilePress hits it. Or use the slider. Your call.",
            },
            {
              them: "Most tools are web-only, Mac-only, or locked behind a subscription",
              us: "Desktop app. Mac + Windows. $19 once. Works forever — no renewals, no monthly fees.",
            },
            {
              them: "Switching between an image tool, a PDF tool, and a video compressor",
              us: "JPEG, PNG, WEBP, HEIC, PDF, MP4, MOV — all in one app.",
            },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="bg-white border border-apple-border rounded-xl p-4 text-sm text-apple-secondary line-through decoration-apple-border">
                {row.them}
              </div>
              <div className="text-apple-accent font-bold text-lg">→</div>
              <div className="bg-apple-accent-light border border-apple-accent/20 rounded-xl p-4 text-sm text-apple-text font-medium">
                {row.us}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="bg-white border-y border-apple-border py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-apple-text text-center mb-12">
            Three steps. That&apos;s it.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { n: "1", title: "Drop your file", body: "Drag onto the app or click to browse. JPEG, PNG, WEBP, HEIC, PDF, MP4 or MOV." },
              { n: "2", title: "Set a target size", body: "Type a size in KB or MB, pick a platform preset, or use the quality slider." },
              { n: "3", title: "Hit compress", body: "FilePress finds the optimal settings and saves the result next to your original — entirely offline." },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-10 h-10 rounded-full bg-apple-accent-light text-apple-accent font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step.n}
                </div>
                <h3 className="font-semibold text-apple-text mb-2">{step.title}</h3>
                <p className="text-apple-secondary text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Preview ─────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 pb-20 pt-20">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-apple-border">
          <img
            src="/screenshot.png"
            alt="FilePress app — compress images, videos and PDFs to a target size on Mac and Windows"
            className="w-full block"
          />
        </div>
      </section>

      {/* ── Privacy / trust ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-apple-text text-center mb-2">
          Your files never leave your computer
        </h2>
        <p className="text-apple-secondary text-center mb-10 text-sm">
          No account. No cloud. No analytics on your files. Ever.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              ),
              title: "100% offline",
              body: "Compression runs entirely on your machine using your CPU. FilePress works with no internet connection — no ping home, no telemetry.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              title: "No data collection",
              body: "FilePress does not read, upload, or log your files. Unlike web-based tools, there is no server receiving your images or videos.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              ),
              title: "Open on GitHub",
              body: (
                <>
                  Built in the open.{" "}
                  <a
                    href="https://github.com/hblrstudio/filepress"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-apple-accent underline underline-offset-2 hover:text-apple-accent-hover transition-colors"
                  >
                    View the source on GitHub
                  </a>{" "}
                  — see exactly what FilePress does with your files.
                </>
              ),
            },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-apple-border rounded-2xl p-5">
              <div className="w-10 h-10 bg-apple-accent-light rounded-xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-apple-text text-sm mb-1.5">{item.title}</h3>
              <p className="text-apple-secondary text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing callout ─────────────────────────────────────────── */}
      <section className="bg-white border-y border-apple-border py-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-apple-text mb-3">
            Try it free. Pay once if you love it.
          </h2>
          <p className="text-apple-secondary mb-8">
            10 free compressions — enough to know if it works for you.
            If it does, unlock unlimited forever.
            No subscription. No renewal. Just the app, working.
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-apple-secondary text-sm">Unlock forever</span>
            <div className="flex items-baseline gap-1.5 bg-apple-accent-light border border-apple-accent/20 rounded-xl px-5 py-3">
              <span className="text-2xl font-bold text-apple-text">$19</span>
              <span className="text-apple-secondary text-sm">one-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── From the blog ───────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-2xl font-bold text-apple-text">From the blog</h2>
          <Link
            href="/blog"
            className="text-sm text-apple-accent hover:text-apple-accent-hover transition-colors"
          >
            All articles →
          </Link>
        </div>
        <div className="space-y-3">
          {FEATURED_ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="block bg-white border border-apple-border rounded-2xl p-5 hover:border-apple-accent/30 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-apple-text text-sm mb-1">{a.title}</h3>
              <p className="text-apple-secondary text-sm">{a.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }}
        />
        <h2 className="text-2xl font-bold text-apple-text text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {faqJsonLd.mainEntity.map((q) => (
            <details
              key={q.name}
              className="bg-white border border-apple-border rounded-2xl overflow-hidden group"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-medium text-apple-text text-sm select-none">
                {q.name}
                <svg
                  className="w-4 h-4 text-apple-secondary shrink-0 transition-transform group-open:rotate-180"
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <p className="px-5 pb-4 text-apple-secondary text-sm leading-relaxed">
                {q.acceptedAnswer.text}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Download ────────────────────────────────────────────────── */}
      <section id="download" className="py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 0a7 7 0 1 1 0 14A7 7 0 0 1 7 0zm3.03 4.47L5.75 8.75 3.97 6.97l-.94.94 2.72 2.72 5.22-5.22-.94-.94z" fill="currentColor"/>
            </svg>
            Free to try — no account needed
          </div>
          <h2 className="text-2xl font-bold text-apple-text mb-2">
            Download FilePress
          </h2>
          <p className="text-apple-secondary mb-10">
            Available for macOS and Windows. Start compressing in under a minute.
          </p>
          <DownloadCards macUrl={mac_url} winUrl={win_url} version={version} />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-apple-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-apple-secondary">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} FilePress · Made by</span>
            <a
              href="https://github.com/hblrstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-apple-text transition-colors"
            >
              hblrstudio
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="hover:text-apple-text transition-colors">
              Blog
            </Link>
            <a
              href="mailto:han@hblrstudio.com"
              className="hover:text-apple-text transition-colors"
            >
              han@hblrstudio.com
            </a>
            <a
              href="https://github.com/hblrstudio/filepress"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-apple-text transition-colors"
            >
              GitHub
            </a>
            <span>v{version}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
