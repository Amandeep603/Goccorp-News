import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import ArticleCard, { getBadgeColor } from "@/components/public/ArticleCard";
import ArticleImagePlaceholder from "@/components/public/ArticleImagePlaceholder";

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  const isHi = lang === "hi";

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!article || article.status !== "published") {
    return {
      title: "Article Not Found | GovCorp News",
    };
  }

  const displayTitle = isHi && article.titleHi?.trim() ? article.titleHi : article.title;
  const displaySummary = isHi && article.summaryHi?.trim() ? article.summaryHi : article.summary;

  return {
    title: `${displayTitle} | GovCorp News`,
    description: displaySummary,
    openGraph: {
      title: displayTitle,
      description: displaySummary,
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  const isHi = lang === "hi";

  // 1. Fetch real article from database by slug
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      category: {
        include: { parent: true, children: true },
      },
      company: true,
      tags: true,
    },
  });

  // 2. If article does not exist or is a draft, return 404
  if (!article || article.status !== "published") {
    notFound();
  }

  const hasHindiContent = Boolean(
    (article.titleHi && article.titleHi.trim()) ||
    (article.summaryHi && article.summaryHi.trim()) ||
    (article.contentHi && article.contentHi.trim())
  );

  const displayTitle = isHi && article.titleHi?.trim() ? article.titleHi : article.title;
  const displaySummary = isHi && article.summaryHi?.trim() ? article.summaryHi : article.summary;
  const displayContent = isHi && article.contentHi?.trim() ? article.contentHi : article.content;
  const showHindiNotice = isHi && !hasHindiContent;

  // 3. Fetch 3 real related articles from the same category
  const relatedCategoryIds = article.categoryId
    ? [
      article.categoryId,
      ...(article.category?.parentId ? [article.category.parentId] : []),
    ]
    : [];

  const relatedArticles =
    relatedCategoryIds.length > 0
      ? await prisma.article.findMany({
        where: {
          status: "published",
          id: { not: article.id },
          categoryId: { in: relatedCategoryIds },
        },
        include: { category: true, author: true, company: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
      })
      : [];

  const categoryName = article.category?.name || "News";
  const categorySlug = article.category?.slug || "news";
  const authorName = article.author?.name || "Editorial Staff";
  const authorSlug =
    article.author?.slug ||
    (article.author?.name
      ? article.author.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
      : null);
  const displayDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : new Date(article.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="w-full bg-background min-h-screen pb-20 font-sans">
      {/* Top Breadcrumbs & Header Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 flex-wrap">
              <li>
                <Link href="/" className="hover:text-navy hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              {article.category?.parent && (
                <>
                  <li>
                    <Link
                      href={`/${article.category.parent.slug}`}
                      className="hover:text-navy hover:underline transition-colors"
                    >
                      {article.category.parent.name}
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-300">/</span>
                  </li>
                </>
              )}
              <li>
                <Link
                  href={`/${categorySlug}`}
                  className="hover:text-navy hover:underline transition-colors"
                >
                  {categoryName}
                </Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              <li className="font-medium text-gray-700 truncate max-w-[200px] sm:max-w-xs">
                {displayTitle}
              </li>
            </ol>
          </nav>

          {/* Hindi Unavailable Notice */}
          {showHindiNotice && (
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium font-sans">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Hindi version not available for this article yet.</span>
            </div>
          )}

          {/* Category & Company Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Link
              href={`/${categorySlug}`}
              className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border shadow-2xs transition-all hover:shadow-xs ${getBadgeColor(
                categoryName
              )}`}
            >
              {categoryName}
            </Link>

            {article.company && (
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-navy/5 text-navy border border-navy/15">
                🏢 {article.company.name}
              </span>
            )}
          </div>

          {/* Headline in Playfair Display */}
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy leading-[1.18] tracking-tight mb-5">
            {displayTitle}
          </h1>

          {/* Article Summary / Dek */}
          {displaySummary && (
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-6 font-normal">
              {displaySummary}
            </p>
          )}

          {/* Author, Date & Social Share Strip */}
          <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Author info */}
            <div className="flex items-center gap-3">
              {authorSlug ? (
                <Link
                  href={`/author/${authorSlug}`}
                  className="w-10 h-10 rounded-full bg-navy/10 text-navy font-bold flex items-center justify-center text-sm border border-navy/20 hover:border-navy transition-colors shrink-0 overflow-hidden"
                  aria-label={`View profile of ${authorName}`}
                >
                  {article.author?.imageUrl ? (
                    <Image
                      src={article.author.imageUrl}
                      alt={authorName}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      unoptimized={article.author.imageUrl.startsWith("/uploads/")}
                    />
                  ) : (
                    authorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </Link>
              ) : (
                <div className="w-10 h-10 rounded-full bg-navy/10 text-navy font-bold flex items-center justify-center text-sm border border-navy/20 shrink-0">
                  {authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div>
                {authorSlug ? (
                  <Link
                    href={`/author/${authorSlug}`}
                    className="text-sm font-semibold text-navy hover:text-saffron transition-colors block"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <div className="text-sm font-semibold text-navy">
                    {authorName}
                  </div>
                )}
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>Correspondent</span>
                  <span>•</span>
                  <time dateTime={article.publishedAt ? new Date(article.publishedAt).toISOString() : ""}>
                    {displayDate}
                  </time>
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-gray-400 font-bold tracking-wider mr-1">
                Share:
              </span>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://govcorpnews.com/article/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayTitle)}&url=${encodeURIComponent(`https://govcorpnews.com/article/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://govcorpnews.com/article/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${displayTitle} - https://govcorpnews.com/article/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/govcorpnews"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow GovCorp News on Instagram"
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-[linear-gradient(45deg,#f09433_0%,#dc2743_50%,#bc1888_100%)] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Article Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          {/* Featured Image */}
          <div className="relative aspect-16/9 sm:aspect-21/10 w-full overflow-hidden bg-navy">
            {article.imageUrl && article.imageUrl.trim() !== "" ? (
              <Image
                src={article.imageUrl}
                alt={displayTitle}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                unoptimized={article.imageUrl.startsWith("/uploads/")}
              />
            ) : (
              <ArticleImagePlaceholder iconClassName="w-14 h-14 sm:w-16 sm:h-16" />
            )}
          </div>

          {/* Article Body Content */}
          <div className="p-6 sm:p-10 lg:p-12">
            {/* Render Sanitized Rich Text HTML */}
            <div
              className="prose prose-lg max-w-none font-sans text-gray-800 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />

            {/* Bottom Tag & Navigation Strip */}
            <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {article.tags && article.tags.length > 0 && (
                  <>
                    <span className="text-xs uppercase text-gray-400 font-bold tracking-wider mr-1">
                      Tags:
                    </span>
                    {article.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </>
                )}
              </div>

              <Link
                href={`/${categorySlug}`}
                className="text-sm font-semibold text-navy hover:text-saffron transition-colors inline-flex items-center gap-1"
              >
                <span>More in {categoryName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </article>

        {/* 3 Real Related Articles Section (only shown if real related articles exist) */}
        {relatedArticles.length > 0 && (
          <section
            aria-label="Related Articles"
            className="mt-16 pt-8 border-t-2 border-gray-200"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-6 bg-saffron rounded-xs"></span>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                  Related Articles
                </h2>
              </div>
              <Link
                href={`/${categorySlug}`}
                className="text-sm font-semibold text-navy hover:text-saffron transition-colors flex items-center gap-1"
              >
                <span>View all in {categoryName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Related Articles Dense List */}
            <div className="bg-white border border-gray-200 rounded-xs px-4 sm:px-6 py-1">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} lang={lang} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
