import Link from "next/link";
import { cookies } from "next/headers";
import { Metadata } from "next";
import ArticleCard, { PublicArticleCardProps } from "@/components/public/ArticleCard";
import { executeSearch } from "@/lib/search";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  return {
    title: query ? `Search: "${query}" | GovCorp News` : "Search | GovCorp News",
    description: `Search results for ${query} across public sector enterprises, policies, and news.`,
  };
}

const ITEMS_PER_PAGE = 10;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page } = await searchParams;
  const query = q?.trim() || "";
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;

  let articles: PublicArticleCardProps[] = [];
  let total = 0;
  let totalPages = 0;

  if (query) {
    const result = await executeSearch({
      q: query,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    });
    articles = result.articles as PublicArticleCardProps[];
    total = result.total;
    totalPages = result.totalPages;
  }

  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <div className="w-full bg-background min-h-[75vh] pb-20 font-sans">
      {/* Top Header Banner */}
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
              <li className="font-semibold text-navy">Search</li>
              {query && (
                <>
                  <li>
                    <span className="text-gray-300">/</span>
                  </li>
                  <li className="font-medium text-gray-700 truncate max-w-[200px]">
                    &ldquo;{query}&rdquo;
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* Heading and Query Information */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-saffron rounded-xs"></span>
                <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-navy tracking-tight">
                  {query ? (
                    <>
                      Search Results for &ldquo;{query}&rdquo;
                    </>
                  ) : (
                    "Search GovCorp News"
                  )}
                </h1>
              </div>
              <p className="mt-2 text-sm text-gray-500 max-w-xl">
                {query
                  ? `Showing matches across headlines, reports, tags, and PSU company profiles.`
                  : `Enter a query in the search bar above to find public sector news.`}
              </p>
            </div>

            {query && total > 0 && (
              <div className="shrink-0 text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full border border-gray-200 w-fit">
                Showing {skip + 1}–{Math.min(skip + ITEMS_PER_PAGE, total)} of {total} articles
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Results Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {query ? (
          articles.length > 0 ? (
            <>
              {/* Dense 2-Column Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 bg-white border border-gray-200 rounded-xs px-4 sm:px-6 py-1">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} lang={lang} />
                ))}
              </div>

              {/* Pagination (if more than 10 results / totalPages > 1) */}
              {totalPages > 1 && (
                <nav
                  aria-label="Search Pagination"
                  className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  {/* Previous */}
                  <div>
                    {currentPage > 1 ? (
                      <Link
                        href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
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

                  {/* Page numbers */}
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
                          href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
                          className="w-9 h-9 flex items-center justify-center text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-navy hover:text-navy transition-colors"
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Next */}
                  <div>
                    {currentPage < totalPages ? (
                      <Link
                        href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
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
            /* Clear Zero Results Message (not blank page) */
            <div className="bg-white rounded-xs border border-gray-200 p-10 sm:p-14 text-center my-6 shadow-2xs">
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2 className="font-playfair text-2xl font-bold text-navy mb-2">
                  No articles found for &ldquo;{query}&rdquo;
                </h2>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  We couldn&apos;t find any articles matching your search. Please check your spelling or try searching with broader keywords like &ldquo;ONGC&rdquo;, &ldquo;airport&rdquo;, or &ldquo;aviation&rdquo;.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xs bg-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-saffron transition-colors shadow-2xs"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xs border border-gray-200 p-10 sm:p-14 text-center my-6 shadow-2xs">
            <div className="max-w-md mx-auto">
              <h2 className="font-playfair text-2xl font-bold text-navy mb-2">
                What would you like to search?
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Use the search icon in the top header to find stories on PSU companies, Maharatnas, Navratnas, aviation, defence, oil &amp; gas, and government policies.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xs bg-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-saffron transition-colors shadow-2xs"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
