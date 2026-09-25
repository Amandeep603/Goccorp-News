import Link from "next/link";
import prisma from "@/lib/prisma";
import ArticleForm from "@/components/admin/ArticleForm";

export const metadata = {
  title: "New Article | GovCorp News Admin",
};

export default async function NewArticlePage() {
  const [categories, companies, authors] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: { name: "asc" },
    }),
    prisma.company.findMany({
      select: { id: true, name: true, slug: true, sector: true },
      orderBy: { name: "asc" },
    }),
    prisma.author.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-navy hover:underline">
              Admin
            </Link>
            <span>/</span>
            <Link href="/admin/articles" className="hover:text-navy hover:underline">
              Articles
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-semibold">New</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-7 bg-saffron rounded-xs" />
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Create New Article
            </h1>
          </div>
        </div>

        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors shadow-2xs w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Articles</span>
        </Link>
      </div>

      {/* Form Component */}
      <ArticleForm
        categories={categories}
        companies={companies}
        authors={authors}
        isEdit={false}
      />
    </div>
  );
}
