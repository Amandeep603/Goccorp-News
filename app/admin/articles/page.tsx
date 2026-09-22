import Link from "next/link";
import prisma from "@/lib/prisma";
import ArticlesTable from "@/components/admin/ArticlesTable";

export const metadata = {
  title: "Articles Management | GovCorp News Admin",
  description: "View, edit, filter, and publish articles",
};

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      author: {
        select: { id: true, name: true },
      },
      company: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-navy hover:underline">
              Admin
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-semibold">Articles</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-7 bg-saffron rounded-xs" />
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Articles
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Create, edit, manage publication status, and organize news stories.
          </p>
        </div>

        {/* New Article Action Button */}
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy hover:bg-navy/90 text-white text-xs sm:text-sm font-bold transition-all shadow-xs w-fit cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Article</span>
        </Link>
      </div>

      {/* Articles Table with Client Filter Tabs & Actions */}
      <ArticlesTable initialArticles={articles} />
    </div>
  );
}
