"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  isTopStory?: boolean;
  topStoryOrder?: number;
  publishedAt: string | Date | null;
  createdAt: string | Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author?: {
    id: string;
    name: string;
  } | null;
  company?: {
    id: string;
    name: string;
  } | null;
}

interface ArticlesTableProps {
  initialArticles: ArticleRow[];
}

export default function ArticlesTable({ initialArticles }: ArticlesTableProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleRow[]>(initialArticles);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<ArticleRow | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Status Toggle Handler
  const handleToggleStatus = async (article: ArticleRow) => {
    setTogglingId(article.id);
    setErrorMessage(null);

    const newStatus = article.status === "published" ? "draft" : "published";

    try {
      const res = await fetch(`/api/admin/articles/${article.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to update article status.");
      } else {
        // Update local state
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id
              ? {
                  ...a,
                  status: data.status,
                  publishedAt: data.status === "published" ? new Date() : null,
                }
              : a
          )
        );
      }
    } catch {
      setErrorMessage("Something went wrong while updating article status.");
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Article Handler
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;

    setDeletingId(articleToDelete.id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/articles/${articleToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to delete article.");
      } else {
        setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
        setArticleToDelete(null);
        router.refresh();
      }
    } catch {
      setErrorMessage("Something went wrong while deleting the article.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtering
  const filteredArticles = articles.filter((article) => {
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "published"
        ? article.status === "published"
        : article.status === "draft";

    const matchesSearch =
      searchQuery.trim() === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author?.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const allCount = articles.length;
  const publishedCount = articles.filter((a) => a.status === "published").length;
  const draftCount = articles.filter((a) => a.status === "draft").length;

  const formatDate = (date: string | Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar: Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-navy shadow-xs"
                : "text-gray-600 hover:text-navy"
            }`}
          >
            All ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("published")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "published"
                ? "bg-white text-green shadow-xs"
                : "text-gray-600 hover:text-green"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("draft")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "draft"
                ? "bg-white text-saffron shadow-xs"
                : "text-gray-600 hover:text-saffron"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy outline-none text-gray-800"
          />
        </div>
      </div>

      {/* Articles Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Title &amp; Slug</th>
                  <th scope="col" className="px-4 py-3.5">Category</th>
                  <th scope="col" className="px-4 py-3.5">Author</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Date</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredArticles.map((article) => {
                  const isPublished = article.status === "published";
                  const isToggling = togglingId === article.id;

                  return (
                    <tr key={article.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Title */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="font-semibold text-gray-900 text-sm line-clamp-1">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="hover:text-navy hover:underline"
                          >
                            {article.title}
                          </Link>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                          <span className="truncate max-w-[240px]">/article/{article.slug}</span>
                          {article.isFeatured && (
                            <span className="px-1.5 py-0.2 rounded-xs bg-saffron/15 text-saffron font-bold text-[10px] uppercase">
                              Featured
                            </span>
                          )}
                          {article.isTopStory && (
                            <span className="px-1.5 py-0.2 rounded-xs bg-navy/15 text-navy font-bold text-[10px] uppercase">
                              Top Story{article.topStoryOrder ? ` #${article.topStoryOrder}` : ""}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {article.category ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-navy/10 text-navy border border-navy/20">
                            {article.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Uncategorized</span>
                        )}
                      </td>

                      {/* Author */}
                      <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                        {article.author?.name || "Editorial Staff"}
                      </td>

                      {/* Status with Quick Toggle */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleStatus(article)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                            isPublished
                              ? "bg-green/10 text-green border-green/30 hover:bg-green/20"
                              : "bg-saffron/10 text-saffron border-saffron/30 hover:bg-saffron/20"
                          } ${isToggling ? "opacity-50 cursor-wait" : ""}`}
                          title={`Click to switch to ${isPublished ? "Draft" : "Published"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished ? "bg-green" : "bg-saffron"
                            }`}
                          />
                          <span>{isToggling ? "Updating..." : isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-[11px]">
                        {formatDate(article.publishedAt || article.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Live preview link if published */}
                          {isPublished && (
                            <Link
                              href={`/article/${article.slug}`}
                              target="_blank"
                              className="p-1.5 text-gray-400 hover:text-navy rounded hover:bg-gray-100 transition-colors"
                              title="View on live website"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                          )}

                          {/* Edit */}
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="p-1.5 text-navy hover:text-saffron rounded hover:bg-navy/5 transition-colors font-medium inline-flex items-center gap-1"
                            title="Edit article"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setArticleToDelete(article)}
                            className="p-1.5 text-red-600 hover:text-red-800 rounded hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Delete article"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="font-playfair font-bold text-lg text-navy mb-1">
              No articles found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
              {searchQuery
                ? `No articles match the search query "${searchQuery}".`
                : activeTab !== "all"
                ? `There are currently no ${activeTab} articles.`
                : "Your newsroom repository is currently empty."}
            </p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy/90 transition-colors shadow-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Article</span>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <div className="text-center mb-6">
              <h3 className="font-playfair font-bold text-xl text-navy">
                Delete Article?
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-gray-800">
                  &ldquo;{articleToDelete.title}&rdquo;
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setArticleToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={handleDeleteArticle}
                className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deletingId ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
