import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import ArticleCard, { getBadgeColor, getCompanyRatnaBadge } from "@/components/public/ArticleCard";
import ArticleImagePlaceholder from "@/components/public/ArticleImagePlaceholder";
import { DEFAULT_SITE_TITLE, DEFAULT_SITE_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";
import { t } from "@/lib/i18n";

export const revalidate = 60;

export const metadata: Metadata = {
  title: DEFAULT_SITE_TITLE,
  description: DEFAULT_SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function Home() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  const isHi = lang === "hi";

  // 1. Fetch Ticker Articles (3-4 most recent published titles)
  const tickerArticles = await prisma.article.findMany({
    where: { status: "published" },
    select: { id: true, title: true, titleHi: true, slug: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 4,
  });

  // 2. Fetch Hero Article (featured first, fallback to most recent)
  let heroMain = await prisma.article.findFirst({
    where: { status: "published", isFeatured: true },
    include: { category: true, author: true, company: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  if (!heroMain) {
    heroMain = await prisma.article.findFirst({
      where: { status: "published" },
      include: { category: true, author: true, company: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  }

  // 3. Fetch Side Hero Articles (Top Stories side panel)
  let heroSideArticles: NonNullable<typeof heroMain>[] = [];
  if (heroMain) {
    const topStories = await prisma.article.findMany({
      where: {
        status: "published",
        isTopStory: true,
        id: { not: heroMain.id },
      },
      include: { category: true, author: true, company: true },
      orderBy: [{ topStoryOrder: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 5,
    });

    heroSideArticles = [...topStories];

    // If fewer than 2 top stories are explicitly selected, top up with latest published articles
    if (heroSideArticles.length < 2) {
      const existingIds = [heroMain.id, ...heroSideArticles.map((a) => a.id)];
      const fallbackArticles = await prisma.article.findMany({
        where: {
          status: "published",
          id: { notIn: existingIds },
        },
        include: { category: true, author: true, company: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 2 - heroSideArticles.length,
      });
      heroSideArticles = [...heroSideArticles, ...fallbackArticles];
    }
  }

  // 4. Fetch Category Section Blocks (Companies, Market, Sectors, Government)
  const targetSections = [
    { title: "Companies", slug: "companies" },
    { title: "Market", slug: "market" },
    { title: "Sectors", slug: "sectors" },
    { title: "Government", slug: "government" },
  ];

  const sectionsWithArticles = await Promise.all(
    targetSections.map(async (sec) => {
      const category = await prisma.category.findUnique({
        where: { slug: sec.slug },
        include: { children: true },
      });

      if (!category) {
        return { title: sec.title, slug: sec.slug, items: [] };
      }

      // Include parent category ID and all subcategory IDs
      const categoryIds = [category.id, ...category.children.map((c) => c.id)];

      const items = await prisma.article.findMany({
        where: {
          status: "published",
          categoryId: { in: categoryIds },
        },
        include: { category: true, author: true, company: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 4,
      });

      return {
        title: sec.title,
        slug: sec.slug,
        items,
      };
    })
  );

  // Filter out any sections that have 0 real articles
  const activeSections = sectionsWithArticles.filter((s) => s.items.length > 0);

  const hasHeroImage = Boolean(heroMain?.imageUrl && heroMain.imageUrl.trim() !== "");
  const heroRatna = getCompanyRatnaBadge(heroMain?.company);

  const heroCategory = heroMain?.category?.name || "Featured";
  const heroAuthor = heroMain?.author?.name || "Editorial Staff";
  const heroDate = heroMain?.publishedAt
    ? new Date(heroMain.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : heroMain?.createdAt
      ? new Date(heroMain.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : "";

  return (
    <div className="w-full bg-background pb-14">
      {/* 1. Breaking News Ticker Strip (only if published articles exist) */}
      {tickerArticles.length > 0 && (
        <section className="bg-white border-b border-gray-200 shadow-2xs overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-10">
              {/* Ticker Badge */}
              <div className="flex items-center gap-1.5 bg-saffron text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-xs shrink-0 z-10 notranslate" translate="no">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>{t("Breaking", isHi)}</span>
              </div>

              {/* Marquee Container */}
              <div className="overflow-hidden relative w-full ml-3">
                <div className="animate-marquee whitespace-nowrap py-0.5">
                  {[...tickerArticles, ...tickerArticles].map((article, idx) => {
                    const tickerTitle = isHi && article.titleHi?.trim() ? article.titleHi : article.title;
                    return (
                      <Link
                        key={`${article.id}-${idx}`}
                        href={`/article/${article.slug}`}
                        className="inline-flex items-center text-xs text-gray-800 font-medium hover:text-saffron transition-colors mr-8"
                      >
                        <span>{tickerTitle}</span>
                        <span className="text-saffron mx-3 font-bold">•</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 space-y-8">
        {/* 2. Hero Section (WSJ-inspired Dense / Text-Forward Layout) */}
        {heroMain ? (
          <section aria-label="Featured News">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Featured Main Article: Prominent Text paired with Compact (~40% height) Image */}
              <div className={heroSideArticles.length > 0 ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"}>
                {(() => {
                  const heroTitle = isHi && heroMain.titleHi?.trim() ? heroMain.titleHi : heroMain.title;
                  const heroSummary = isHi && heroMain.summaryHi?.trim() ? heroMain.summaryHi : heroMain.summary;

                  return (
                    <article className="group bg-white rounded-xs border border-gray-200 p-5 sm:p-6 flex flex-col justify-between h-full transition-shadow hover:shadow-xs">
                      <div>
                        {/* Category & Ratna Badges */}
                        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs border ${getBadgeColor(
                              heroCategory
                            )}`}
                          >
                            {heroCategory}
                          </span>

                          {heroRatna && (
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-xs border ${heroRatna.classes}`}
                            >
                              {heroRatna.label}
                            </span>
                          )}

                          <span className="text-[10px] font-bold uppercase tracking-wider text-saffron ml-1 notranslate" translate="no">
                            • {t("Featured Story", isHi)}
                          </span>
                        </div>

                        {/* Headline */}
                        <h2
                          className="font-playfair text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-navy group-hover:text-saffron transition-colors leading-[1.22] tracking-tight mb-3.5"
                          title={heroTitle}
                        >
                          <Link href={`/article/${heroMain.slug}`}>{heroTitle}</Link>
                        </h2>

                        {/* Text-Forward Split: Summary & Metadata on Left, Compact Thumbnail on Right */}
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                          {/* Dense Summary & Byline */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <p className="font-sans text-gray-700 text-sm sm:text-[15px] leading-relaxed mb-4">
                              {heroSummary}
                            </p>

                            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-sans">
                              <span className="font-semibold text-gray-800">{heroAuthor}</span>
                              <span>{heroDate}</span>
                            </div>
                          </div>

                          {/* Compact Image (Roughly 40% of previous 400px height) */}
                          <Link
                            href={`/article/${heroMain.slug}`}
                            className="w-full sm:w-56 md:w-64 shrink-0 aspect-16/10 rounded-xs overflow-hidden bg-navy relative block border border-gray-100 group-hover:border-navy/40 transition-colors"
                            aria-label={heroTitle}
                          >
                            {hasHeroImage ? (
                              <Image
                                src={heroMain.imageUrl!}
                                alt={heroTitle}
                                fill
                                priority
                                sizes="(max-width: 640px) 100vw, 260px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized={heroMain.imageUrl!.startsWith("/uploads/") || heroMain.imageUrl!.includes("blob.vercel-storage.com")}
                              />
                            ) : (
                              <ArticleImagePlaceholder iconClassName="w-9 h-9 text-white/25" />
                            )}
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })()}
              </div>

              {/* Smaller Side Stories: Dense Vertical Feed */}
              {heroSideArticles.length > 0 && (
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white rounded-xs border border-gray-200 p-4 sm:p-5 h-fit self-start shadow-2xs">
                  <div className="pb-2 mb-1 border-b-2 border-navy flex items-center justify-between">
                    <span className="font-sans font-bold uppercase tracking-wider text-xs text-navy notranslate" translate="no">
                      {t("Top Stories", isHi)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-sans font-medium uppercase tracking-wider notranslate" translate="no">
                      {t("Live Editorial", isHi)}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {heroSideArticles.map((sideArticle) => (
                      <ArticleCard key={sideArticle.id} article={sideArticle} lang={lang} />
                    ))}
                  </div>

                  {/* View More on Top Stories */}
                  <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-end">
                    <Link
                      href="/top-stories"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-saffron transition-colors uppercase tracking-wider group notranslate"
                      translate="no"
                    >
                      <span>{t("View More Top Stories", isHi)}</span>
                      <svg
                        className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-xs border border-gray-200 p-8 text-center my-6 shadow-2xs">
            <div className="max-w-md mx-auto">
              <h2 className="font-playfair text-xl font-bold text-navy mb-1.5">
                Welcome to GovCorp News
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                India&apos;s PSU &amp; Corporate News Network. Live editorial stories, enterprise reports, and sector analyses are currently being prepared.
              </p>
            </div>
          </section>
        )}

        {/* 3. Category Section Blocks (Dense 2-Column Newspaper List) */}
        {activeSections.length > 0 && (
          <div className="space-y-8">
            {activeSections.map((section) => (
              <section key={section.slug} aria-label={section.title}>
                {/* Section Header */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-navy mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-saffron rounded-xs"></span>
                    <h2 className="font-playfair text-xl sm:text-2xl font-bold text-navy tracking-tight">
                      {section.title}
                    </h2>
                  </div>

                  <Link
                    href={`/${section.slug}`}
                    className="group flex items-center gap-1 text-xs font-semibold text-navy hover:text-saffron transition-colors"
                  >
                    <span>View Section</span>
                    <svg
                      className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Dense 2-Column Grid of Text-Forward Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 bg-white border border-gray-200 rounded-xs px-4 sm:px-5 py-1">
                  {section.items.map((article) => (
                    <ArticleCard key={article.id} article={article} lang={lang} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
