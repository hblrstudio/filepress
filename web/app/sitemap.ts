import type { MetadataRoute } from "next";
import { articles } from "./blog/articles";

const BASE = "https://filepressapp.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...articleUrls,
  ];
}
