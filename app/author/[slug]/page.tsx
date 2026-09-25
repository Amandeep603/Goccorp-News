import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/public/ArticleCard";

export const revalidate = 60;

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const ITEMS_PER_PAGE = 8;

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  const author = await prisma.author.findUnique({
    where: { slug },
  });

  if (!author) {
    return {
      title: "Author Not Found | GovCorp News",
    };
  }

  const title = `${author.name} — Articles | GovCorp News`;
  const description =
    author.bio ||
    `Read all reporting, analysis, and articles by ${author.name} on GovCorp News.`;
  const canonicalUrl = `/author/${author.slug || slug}`;
  const ogImageUrl = author.imageUrl || "/logo.png";

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
      type: "profile",
      images: [
        {
          url: ogImageUrl,
          alt: `${author.name} | GovCorp News`,
        },
      ],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AuthorProfilePage({
  params,
  searchParams,
}: AuthorPageProps) {
  const { slug: rawSlug } = await params;
  const { page: rawPage } = await searchParams;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;

  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // 1. Fetch Author
  const author = await prisma.author.findUnique({
    where: { slug },
  });

  if (!author) {
    notFound();
  }

  // 2. Count published articles
  const whereClause = {
    status: "published",
    authorId: author.id,
  };

  const totalArticles = await prisma.article.count({
    where: whereClause,
  });

  const totalPages = Math.max(1, Math.ceil(totalArticles / ITEMS_PER_PAGE));
  const currentPage = Math.max(
    1,
    Math.min(totalPages, parseInt(rawPage || "1", 10) || 1)
  );
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // 3. Fetch paginated articles
  const articles = await prisma.article.findMany({
    where: whereClause,
    include: {
      category: true,
      company: true,
      author: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: ITEMS_PER_PAGE,
    skip,
  });

  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full bg-background min-h-screen pb-20 font-sans">
      {/* Top Header / Profile Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-navy hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              <li>
                <span className="text-gray-500">Authors</span>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              <li className="font-medium text-gray-800">{author.name}</li>
            </ol>
          </nav>

          {/* Author Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            {/* Avatar / Photo */}
            <div className="shrink-0">
              {author.imageUrl && author.imageUrl.trim() !== "" ? (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-navy/20 shadow-sm">
                  <Image
                    src={author.imageUrl}
                    alt={author.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized={author.imageUrl.startsWith("/uploads/") || author.imageUrl.includes("blob.vercel-storage.com")}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-navy/10 text-navy font-playfair font-bold flex items-center justify-center text-2xl sm:text-3xl border-2 border-navy/20 shadow-sm">
                  {initials}
                </div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full bg-navy/10 text-navy border border-navy/20">
                  Correspondent
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {totalArticles} {totalArticles === 1 ? "Published Article" : "Published Articles"}
                </span>
              </div>

              <h1 className="font-playfair text-3xl sm:text-4xl font-extrabold text-navy tracking-tight mb-2">
                {author.name}
              </h1>

              {author.bio && (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {author.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Articles Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-6 bg-saffron rounded-xs"></span>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Articles by {author.name}
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {articles.length > 0 ? (
          <>
            <div className="bg-white border border-gray-200 rounded-lg px-4 sm:px-6 py-2 shadow-xs">
              {articles.map((art) => (
                <ArticleCard key={art.id} article={art} lang={lang} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
                {/* Previous Button */}
                <div>
                  {currentPage > 1 ? (
                    <Link
                      href={`/author/${author.slug}?page=${currentPage - 1}`}
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
                        href={`/author/${author.slug}?page=${pageNum}`}
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
                      href={`/author/${author.slug}?page=${currentPage + 1}`}
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
              No published articles yet
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Articles written by {author.name} will appear here once published.
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
