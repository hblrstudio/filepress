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

export default function Home() {
  const { version, mac_url, win_url } = versionData;

  return (
    <div className="min-h-screen bg-apple-bg">
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
            Download
          </a>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-apple-accent-light text-apple-accent text-xs font-semibold px-3 py-1 rounded-full mb-6">
          Free to try · 13 compressions included
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
              us: "Desktop app. Mac + Windows. $9 once. That's it.",
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

      {/* ── Pricing callout ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-apple-text mb-3">
          Try it. If it clicks, pay once.
        </h2>
        <p className="text-apple-secondary mb-8 max-w-md mx-auto">
          13 free compressions — enough to know if it&apos;s worth it.
          If it is, unlock it forever for less than a coffee.
          No subscription. No annual renewal.
          No &ldquo;your plan expired&rdquo; emails. Just the app, working.
        </p>
        <div className="inline-flex items-baseline gap-2 bg-white border border-apple-border rounded-2xl px-8 py-5">
          <span className="text-4xl font-bold text-apple-text">$7.20</span>
          <span className="text-apple-secondary">one-time · yours forever</span>
        </div>
      </section>

      {/* ── Download ────────────────────────────────────────────────── */}
      <section
        id="download"
        className="bg-white border-t border-apple-border py-20"
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-apple-text mb-2">
            Download FilePress
          </h2>
          <p className="text-apple-secondary mb-10">
            Available for macOS and Windows. Free to try.
          </p>
          <DownloadCards macUrl={mac_url} winUrl={win_url} version={version} />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-xs text-apple-secondary">
        <span>© {new Date().getFullYear()} FilePress</span>
        <span>v{version}</span>
      </footer>
    </div>
  );
}
