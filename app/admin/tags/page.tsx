import Link from "next/link";
import prisma from "@/lib/prisma";
import TagsManager from "@/components/admin/TagsManager";

export const metadata = {
  title: "Tags Management | GovCorp News Admin",
  description: "View, create, edit, and manage news tags and article taxonomies",
};

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { name: "asc" },
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
            <span className="text-gray-700 font-semibold">Tags</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-7 bg-saffron rounded-xs" />
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Tags
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Categorize and index articles by topics, themes, keywords, and events.
          </p>
        </div>
      </div>

      {/* Tags Manager Component */}
      <TagsManager initialTags={tags} />
    </div>
  );
}
