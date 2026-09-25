import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ArticleForm from "@/components/admin/ArticleForm";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Article | GovCorp News Admin",
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  const [article, categories, companies, authors] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        tags: {
          select: { name: true },
        },
      },
    }),
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

  if (!article) {
    notFound();
  }

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
            <span className="text-gray-700 font-semibold truncate max-w-[200px]">
              {article.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-7 bg-saffron rounded-xs" />
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Edit Article
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {article.status === "published" && (
            <Link
              href={`/article/${article.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>View Live</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          )}

          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Articles</span>
          </Link>
        </div>
      </div>

      {/* Form Component */}
      <ArticleForm
        initialData={article}
        categories={categories}
        companies={companies}
        authors={authors}
        isEdit={true}
      />
    </div>
  );
}
