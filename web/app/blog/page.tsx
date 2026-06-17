import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "./articles";

export const metadata: Metadata = {
  title: "Blog — FilePress",
  description:
    "Guides on compressing images, videos and PDFs offline — without uploading to the cloud. Mac and Windows.",
  alternates: {
    canonical: "https://filepressapp.vercel.app/blog",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-apple-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-apple-bg/80 backdrop-blur-xl border-b border-apple-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-semibold text-apple-text text-[17px] tracking-tight hover:opacity-80 transition-opacity"
          >
            FilePress
          </Link>
          <Link
            href="/#download"
            className="text-sm font-medium text-apple-accent hover:text-apple-accent-hover transition-colors"
          >
            Download free
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-3xl mx-auto px-6 pt-20 pb-12">
        <h1 className="text-[40px] font-bold text-apple-text tracking-tight mb-3">
          Blog
        </h1>
        <p className="text-apple-secondary text-lg">
          Guides on compressing files offline — no uploads, no cloud.
        </p>
      </header>

      {/* Articles */}
      <main className="max-w-3xl mx-auto px-6 pb-20">
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="block bg-white border border-apple-border rounded-2xl p-6 hover:border-apple-accent/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 text-xs text-apple-secondary mb-3">
                <time dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
                <span>·</span>
                <span>{article.readingTime}</span>
              </div>
              <h2 className="font-semibold text-apple-text text-[15px] mb-2 leading-snug">
                {article.title}
              </h2>
              <p className="text-apple-secondary text-sm leading-relaxed">
                {article.description}
              </p>
              <span className="inline-block mt-4 text-xs font-medium text-apple-accent">
                Read article →
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-apple-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-apple-secondary">
          <Link href="/" className="hover:text-apple-text transition-colors">
            ← Back to FilePress
          </Link>
          <span>© {new Date().getFullYear()} FilePress</span>
        </div>
      </footer>
    </div>
  );
}
