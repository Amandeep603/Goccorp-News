import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // 1. Homepage
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // 2. Categories & Subcategories
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
    },
  });

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => {
    const path = cat.parent ? `/${cat.parent.slug}/${cat.slug}` : `/${cat.slug}`;
    return {
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    };
  });

  // 3. Published Articles ONLY (excludes drafts)
  const articles = await prisma.article.findMany({
    where: {
      status: "published",
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: article.updatedAt || article.publishedAt || article.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 4. Authors (with valid slugs)
  const authors = await prisma.author.findMany({
    where: {
      slug: { not: null },
    },
    select: {
      slug: true,
    },
  });

  const authorRoutes: MetadataRoute.Sitemap = authors
    .filter((a) => a.slug && a.slug.trim() !== "")
    .map((author) => ({
      url: `${baseUrl}/author/${author.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...authorRoutes,
  ];
}
