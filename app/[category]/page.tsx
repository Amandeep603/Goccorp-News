import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/public/ArticleCard";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

const ITEMS_PER_PAGE = 8;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  const category = await prisma.category.findFirst({
    where: { slug },
  });

  const categoryTitle =
    category?.name ||
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const title = `${categoryTitle} News | GovCorp News`;
  const description = `Latest public sector enterprise news, analysis, and government policy updates in ${categoryTitle}.`;
  const canonicalUrl = `/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "GovCorp News",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: `${categoryTitle} News | GovCorp News`,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: rawCategorySlug } = await params;
  const { page: rawPage } = await searchParams;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;

  const categorySlug = decodeURIComponent(rawCategorySlug).toLowerCase().trim();

  // 1. Fetch category with its subcategories and parent from database
  const categoryFromDb = await prisma.category.findFirst({
    where: { slug: categorySlug },
    include: {
      children: {
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      },
      parent: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const fallbackCategoryName = categorySlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const category = categoryFromDb || {
    id: "unseeded",
    name: fallbackCategoryName,
    slug: categorySlug,
    children: [],
    parent: null,
    parentId: null,
  };

  // Include parent category ID and any child subcategory IDs
  const targetCategoryIds = categoryFromDb
    ? [categoryFromDb.id, ...categoryFromDb.children.map((c) => c.id)]
    : [];

  const whereClause = {
    status: "published",
    categoryId: { in: targetCategoryIds },
  };

  // 2. Count total articles for pagination
  const totalArticles = await prisma.article.count({
    where: whereClause,
  });

  const totalPages = Math.max(1, Math.ceil(totalArticles / ITEMS_PER_PAGE));
  const currentPage = Math.max(
    1,
    Math.min(totalPages, parseInt(rawPage || "1", 10) || 1)
  );
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // 3. Query paginated published articles using skip / take
  const articles = await prisma.article.findMany({
    where: whereClause,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
      company: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    skip,
    take: ITEMS_PER_PAGE,
  });

  // 4. Fetch main parent categories for top quick navigation pills
  const mainCategories = await prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="w-full bg-background min-h-[70vh] pb-20 font-sans">
      {/* Category Header Banner */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-navy hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              {category.parent && (
                <>
                  <li>
                    <Link
                      href={`/${category.parent.slug}`}
                      className="hover:text-navy hover:underline transition-colors"
                    >
                      {category.parent.name}
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-300">/</span>
                  </li>
                </>
              )}
              <li className="font-semibold text-navy">
                {category.name}
              </li>
            </ol>
          </nav>

          {/* Title & Description */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-saffron rounded-xs"></span>
                <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-navy tracking-tight">
                  {category.name}
                </h1>
              </div>
              <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                Comprehensive reporting, policy decisions, capital expenditure, and
                strategic governance updates for {category.name.toLowerCase()}.
              </p>
            </div>

            {/* Total Articles Count Pill */}
            <div className="shrink-0 text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full border border-gray-200 w-fit">
              Showing {totalArticles > 0 ? skip + 1 : 0}–
              {Math.min(skip + ITEMS_PER_PAGE, totalArticles)} of {totalArticles} articles
            </div>
          </div>

          {/* Subcategories (if category is parent with children) */}
          {category.children && category.children.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1 shrink-0">
                Sub-sectors:
              </span>
              {category.children.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${sub.slug}`}
                  className="px-3 py-1 text-xs font-semibold rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-white hover:border-navy hover:text-navy transition-all whitespace-nowrap"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}

          {/* Top Categories Quick Links */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1 shrink-0">
              Sections:
            </span>
            {mainCategories.map((cat) => {
              const isCurrent =
                cat.slug === category.slug ||
                cat.id === category.parentId;

              return (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${isCurrent
                      ? "bg-navy text-white border-navy shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:border-navy hover:text-navy"
                    }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {articles.length > 0 ? (
          <>
            {/* Dense 2-Column Articles Grid (stacks on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 bg-white border border-gray-200 rounded-xs px-4 sm:px-6 py-1">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} lang={lang} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav
                aria-label="Pagination Navigation"
                className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                {/* Previous Button */}
                <div>
                  {currentPage > 1 ? (
                    <Link
                      href={`/${category.slug}?page=${currentPage - 1}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-navy bg-white border border-gray-300 hover:bg-gray-50 hover:border-navy transition-colors shadow-2xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-gray-300 bg-gray-50 border border-gray-200 cursor-not-allowed">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </span>
                  )}
                </div>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return isActive ? (
                      <span
                        key={pageNum}
                        aria-current="page"
                        className="w-9 h-9 flex items-center justify-center text-sm font-bold rounded-md bg-navy text-white shadow-xs"
                      >
                        {pageNum}
                      </span>
                    ) : (
                      <Link
                        key={pageNum}
                        href={`/${category.slug}?page=${pageNum}`}
                        className="w-9 h-9 flex items-center justify-center text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-navy hover:text-navy transition-colors"
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {/* Next Button */}
                <div>
                  {currentPage < totalPages ? (
                    <Link
                      href={`/${category.slug}?page=${currentPage + 1}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-navy bg-white border border-gray-300 hover:bg-gray-50 hover:border-navy transition-colors shadow-2xs"
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md text-gray-300 bg-gray-50 border border-gray-200 cursor-not-allowed">
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </div>
              </nav>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center my-8 shadow-xs">
            <h3 className="font-playfair text-xl font-bold text-navy mb-2">
              No articles published in {category.name} yet
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              New editorial reports for &ldquo;{category.name}&rdquo; are currently being written by our correspondents. Check back soon!
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors shadow-xs"
            >
              Return to Homepage
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
