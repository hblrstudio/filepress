import { DownloadButton, DownloadCards } from "./components/DownloadButton";
import versionData from "../public/version.json";

const FEATURES = [
  {
    icon: "⬇",
    title: "Hit an exact size",
    description:
      "Type \"500 KB\" and FilePress figures out the quality automatically. Or use the manual slider if you prefer full control.",
  },
  {
    icon: "🎛",
    title: "Presets that actually make sense",
    description:
      "Instagram, WhatsApp, Email, Twitter/X, LinkedIn, PDF Web. One click, right size, done.",
  },
  {
    icon: "🔒",
    title: "Your files stay on your machine",
    description:
      "No uploads. No account. No cloud. Works without internet. What you compress is your business.",
  },
  {
    icon: "📄",
    title: "Images and PDFs",
    description:
      "JPEG, PNG, WEBP, HEIC, and PDF — all in one place. No more switching between five different tools.",
  },
];

const FORMATS = ["JPEG", "PNG", "WEBP", "HEIC", "PDF"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FilePress",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS, Windows",
  description:
    "Compress JPEG, PNG, WEBP, HEIC and PDF files to a target size. No upload, no cloud, works offline. Mac and Windows desktop app.",
  offers: {
    "@type": "Offer",
    price: "7.20",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  softwareVersion: versionData.version,
  url: "https://filepressapp.vercel.app",
  keywords:
    "image compression, file compression, compress images, compress PDF, JPEG compressor, PNG compressor",
};

export default function Home() {
  const { version, mac_url, win_url } = versionData;

  return (
    <div className="min-h-screen bg-apple-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-apple-bg/80 backdrop-blur-xl border-b border-apple-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-apple-text text-[17px] tracking-tight">
            FilePress
          </span>
          <a
            href="#download"
            className="text-sm font-medium text-apple-accent hover:text-apple-accent-hover transition-colors"
          >
            Download free
          </a>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Free badge — prominent */}
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 text-sm font-semibold px-4 py-2 rounded-full mb-6">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 0a7 7 0 1 1 0 14A7 7 0 0 1 7 0zm3.03 4.47L5.75 8.75 3.97 6.97l-.94.94 2.72 2.72 5.22-5.22-.94-.94z" fill="currentColor"/>
          </svg>
          Free to try — no account, no credit card
        </div>

        <h1 className="text-[44px] sm:text-[56px] font-bold text-apple-text leading-[1.08] tracking-tight mb-5">
          Stop re-exporting
          <br />
          <span className="text-apple-accent">until it fits.</span>
        </h1>

        <p className="text-lg text-apple-secondary max-w-xl mx-auto mb-10">
          Tell FilePress the size you need. It figures out the rest.
          No uploads, no subscription, no nonsense — just your files, compressed.
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

      {/* ── Why FilePress ───────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-apple-text text-center mb-2">
          Why not just use TinyPNG?
        </h2>
        <p className="text-apple-secondary text-center mb-10 text-sm">
          Fair question. Here&apos;s the honest answer.
        </p>
        <div className="space-y-3">
          {[
            {
              them: "TinyPNG, Squoosh, iLoveIMG upload your files to their servers",
              us: "FilePress never touches the internet. Your files don't leave your machine.",
            },
            {
              them: "Other tools give you a quality slider and make you guess the output size",
              us: "Type the size you need — \"500 KB\", \"2 MB\" — and FilePress hits it. Or use the slider. Your call.",
            },
            {
              them: "Most tools are web-only, or Mac-only, or subscription-only",
              us: "Desktop app. Mac + Windows. $7.20 once. That's it.",
            },
            {
              them: "Switching between an image tool and a PDF tool",
              us: "JPEG, PNG, WEBP, HEIC, PDF — all in one app.",
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
              { n: "1", title: "Drop your file", body: "Drag onto the app or click to browse. JPEG, PNG, WEBP, HEIC, or PDF." },
              { n: "2", title: "Set a target", body: "Type a size in KB or MB, pick a platform preset, or use the quality slider." },
              { n: "3", title: "Hit compress", body: "FilePress finds the optimal settings and saves the result next to your original." },
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

      {/* ── Privacy / trust ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
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
              body: "Compression runs entirely on your machine. FilePress works with no internet connection.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              title: "No data collection",
              body: "FilePress does not read, upload, or log your files. What you compress is your business.",
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
            13 free compressions — enough to know if it works for you.
            If it does, unlock it forever.
            No subscription. No renewal emails. Just the app, working.
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-apple-secondary text-sm">Unlock forever</span>
            <div className="flex items-baseline gap-1.5 bg-apple-accent-light border border-apple-accent/20 rounded-xl px-5 py-3">
              <span className="text-2xl font-bold text-apple-text">$7.20</span>
              <span className="text-apple-secondary text-sm">one-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Download ────────────────────────────────────────────────── */}
      <section
        id="download"
        className="py-20"
      >
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
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-apple-secondary">
          <span>© {new Date().getFullYear()} FilePress</span>
          <div className="flex items-center gap-4">
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
