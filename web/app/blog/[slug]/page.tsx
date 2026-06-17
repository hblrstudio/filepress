import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, getArticle, type Block } from "../articles";
import { jsonLdString } from "../../lib/json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `https://filepressapp.vercel.app/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `https://filepressapp.vercel.app/blog/${article.slug}`,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="text-xl font-bold text-apple-text mt-10 mb-4">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} className="text-lg font-semibold text-apple-text mt-8 mb-3">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={i} className="text-apple-secondary leading-relaxed mb-4">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 mb-4 text-apple-secondary">
          {block.items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={i} className="list-decimal list-inside space-y-1.5 mb-4 text-apple-secondary">
          {block.items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div
          key={i}
          className="bg-apple-accent-light border border-apple-accent/20 rounded-xl px-5 py-4 mb-4"
        >
          <p className="text-sm text-apple-text leading-relaxed">{block.text}</p>
        </div>
      );
    case "faq":
      return (
        <details
          key={i}
          className="bg-white border border-apple-border rounded-xl overflow-hidden mb-2 group"
        >
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-medium text-apple-text text-sm select-none">
            {block.q}
            <svg
              className="w-4 h-4 text-apple-secondary shrink-0 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="px-5 pb-4 text-apple-secondary text-sm leading-relaxed">{block.a}</p>
        </details>
      );
    default:
      return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqSchema.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "FilePress",
      url: "https://filepressapp.vercel.app",
    },
    url: `https://filepressapp.vercel.app/blog/${article.slug}`,
  };

  return (
    <div className="min-h-screen bg-apple-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(articleJsonLd) }}
      />

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

      {/* Article */}
      <article className="max-w-2xl mx-auto px-6 pt-16 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-apple-secondary mb-8">
          <Link href="/blog" className="hover:text-apple-text transition-colors">
            Blog
          </Link>
          <span>›</span>
          <span className="truncate">{article.title}</span>
        </div>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-xs text-apple-secondary mb-4">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span>·</span>
            <span>{article.readingTime}</span>
          </div>
          <h1 className="text-[32px] font-bold text-apple-text leading-tight tracking-tight mb-4">
            {article.title}
          </h1>
          <p className="text-apple-secondary text-lg leading-relaxed">
            {article.description}
          </p>
        </header>

        {/* Body */}
        <div>{article.blocks.map((block, i) => renderBlock(block, i))}</div>

        {/* CTA */}
        <div className="mt-14 bg-white border border-apple-border rounded-2xl p-7 text-center">
          <h2 className="font-bold text-apple-text text-lg mb-2">
            Try FilePress free
          </h2>
          <p className="text-apple-secondary text-sm mb-5">
            10 free compressions. No account. No upload. Mac and Windows.
          </p>
          <Link
            href="/#download"
            className="inline-block bg-apple-accent text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-apple-accent-hover transition-colors"
          >
            Download free →
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-apple-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-apple-secondary">
          <Link href="/blog" className="hover:text-apple-text transition-colors">
            ← All articles
          </Link>
          <span>© {new Date().getFullYear()} FilePress</span>
        </div>
      </footer>
    </div>
  );
}
