import Link from "next/link";
import { Metadata } from "next";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/public/ArticleCard";
import { t } from "@/lib/i18n";
import { SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 60;

interface TopStoriesPageProps {
  searchParams: Promise<{ page?: string }>;
}

const ITEMS_PER_PAGE = 10;

export async function generateMetadata(): Promise<Metadata> {
  const title = `Top Stories | ${SITE_NAME}`;
  const description = "Explore top editorial stories, breaking reports, and featured developments across India's PSU and corporate sectors.";

  return {
    title,
    description,
    alternates: {
      canonical: "/top-stories",
    },
    openGraph: {
      title,
      description,
      url: "/top-stories",
      siteName: SITE_NAME,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
  };
}

export default async function TopStoriesPage({ searchParams }: TopStoriesPageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  const isHi = lang === "hi";

  // Query top stories (isTopStory: true or isFeatured: true first, ordered by priority)
  const whereCondition = {
    status: "published",
    OR: [{ isTopStory: true }, { isFeatured: true }],
  };

  let [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: whereCondition,
      include: {
        category: true,
        company: true,
        author: true,
      },
      orderBy: [
        { topStoryOrder: "asc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.article.count({ where: whereCondition }),
  ]);

  // If fewer than 5 flagged top stories exist, supplement with latest published articles
  if (totalCount < 5 && currentPage === 1) {
    const existingIds = articles.map((a) => a.id);
    const supplementalArticles = await prisma.article.findMany({
      where: {
        status: "published",
        id: { notIn: existingIds },
      },
      include: {
        category: true,
        company: true,
        author: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 10 - articles.length,
    });
    articles = [...articles, ...supplementalArticles];
    totalCount = articles.length;
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  return (
    <div className="min-h-screen bg-background pb-16 font-sans">
      {/* Breadcrumb Strip */}
      <div className="bg-white border-b border-gray-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500 font-sans" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-saffron transition-colors">
              {t("Home", isHi)}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium notranslate" translate="no">
              {t("Top Stories", isHi)}
            </span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header */}
        <div className="border-b-2 border-navy pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-6 bg-saffron rounded-xs"></span>
              <h1 className="font-playfair text-3xl sm:text-4xl font-extrabold text-navy tracking-tight notranslate" translate="no">
                {t("Top Stories", isHi)}
              </h1>
            </div>
            <p className="text-sm text-gray-600 font-sans max-w-xl">
              Curated editorial highlights, primary headlines, and pivotal developments in India&apos;s corporate governance and public enterprise landscape.
            </p>
          </div>

          <div className="text-xs text-gray-500 font-sans self-start sm:self-end">
            <span className="font-semibold text-gray-800">{totalCount}</span> stories found
          </div>
        </div>

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xs p-12 text-center my-6">
            <p className="text-gray-500 text-sm">No top stories currently available.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xs border border-gray-200 p-5 sm:p-6 shadow-2xs">
            <div className="divide-y divide-gray-200">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} lang={lang} />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/top-stories?page=${currentPage - 1}`}
                className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous
              </Link>
            )}

            <span className="text-xs text-gray-600 px-3 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={`/top-stories?page=${currentPage + 1}`}
                className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
