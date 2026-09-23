"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import TipTapEditor from "@/components/admin/TipTapEditor";
import { generateSlug } from "@/lib/validations/article";
 
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface CompanyOption {
  id: string;
  name: string;
  slug: string;
}

interface AuthorOption {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
  slug: string;
}

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title?: string;
    titleHi?: string | null;
    slug?: string;
    summary?: string;
    summaryHi?: string | null;
    content?: string;
    contentHi?: string | null;
    imageUrl?: string | null;
    status?: string;
    isFeatured?: boolean;
    categoryId?: string | null;
    companyId?: string | null;
    authorId?: string | null;
    tags?: { name: string }[];
  };
  categories: CategoryOption[];
  companies: CompanyOption[];
  authors: AuthorOption[];
  isEdit?: boolean;
}

export default function ArticleForm({
  initialData,
  categories,
  companies,
  authors,
  isEdit = false,
}: ArticleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Options State (auto-refreshed live from database)
  const [liveCategories, setLiveCategories] = useState<CategoryOption[]>(categories);
  const [liveCompanies, setLiveCompanies] = useState<CompanyOption[]>(companies);
  const [liveAuthors, setLiveAuthors] = useState<AuthorOption[]>(authors);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [refreshingOptions, setRefreshingOptions] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [status, setStatus] = useState<"draft" | "published">(
    (initialData?.status as "draft" | "published") || "draft"
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [companyId, setCompanyId] = useState(initialData?.companyId || "");
  const [authorId, setAuthorId] = useState(initialData?.authorId || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);

  // Tags State
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    initialData?.tags?.map((t) => t.name) || []
  );

  // Live refresh of Categories, Companies, Authors, and Tags
  const refreshOptions = async () => {
    setRefreshingOptions(true);
    try {
      const [catRes, compRes, authRes, tagRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/companies"),
        fetch("/api/admin/authors"),
        fetch("/api/admin/tags"),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.categories) {
          setLiveCategories(
            catData.categories.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              parentId: c.parentId,
            }))
          );
        }
      }

      if (compRes.ok) {
        const compData = await compRes.json();
        if (compData.companies) {
          setLiveCompanies(
            compData.companies.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            }))
          );
        }
      }

      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.authors) {
          setLiveAuthors(
            authData.authors.map((a: any) => ({
              id: a.id,
              name: a.name,
            }))
          );
        }
      }

      if (tagRes.ok) {
        const tagData = await tagRes.json();
        if (tagData.tags) {
          setAvailableTags(
            tagData.tags.map((t: any) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Failed to live refresh dropdown options:", err);
    } finally {
      setRefreshingOptions(false);
    }
  };

  useEffect(() => {
    refreshOptions();
  }, []);

  // UI State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Tag Management
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,|,$/g, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Image Upload Handling
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WEBP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds the 5MB limit.");
      return;
    }

    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to upload image.");
      } else {
        setImageUrl(data.url);
      }
    } catch {
      setError("Network error occurred while uploading the image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Form Submission
  const handleSubmit = async (submitStatus: "draft" | "published") => {
    setError(null);
    setValidationErrors({});
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim() || null,
      status: submitStatus,
      isFeatured,
      categoryId: categoryId || null,
      companyId: companyId || null,
      authorId: authorId || null,
      tags,
    };

    try {
      const url = isEdit
        ? `/api/admin/articles/${initialData?.id}`
        : "/api/admin/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.details) {
          setValidationErrors(result.details);
          setError("Please review the highlighted form errors below.");
        } else {
          setError(result.error || "Something went wrong while saving the article.");
        }
      } else {
        router.push("/admin/articles");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Organize categories into hierarchical tree using liveCategories
  const parentCategories = liveCategories.filter((c) => !c.parentId);
  const childCategories = liveCategories.filter((c) => c.parentId);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(status);
      }}
      className="space-y-8 font-sans pb-16"
    >
      {/* Top Banner Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 shadow-2xs">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-semibold">{error}</div>
            {Object.keys(validationErrors).length > 0 && (
              <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-xs text-red-600">
                {Object.entries(validationErrors).map(([field, msgs]) => (
                  <li key={field}>
                    <strong className="capitalize">{field}:</strong> {msgs.join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Left 8 cols (Content), Right 4 cols (Metadata) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Title, Slug, Summary, Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Slug Box */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Maharatna PSUs Finalize ₹1.8 Trillion Clean Energy Corridor"
                className="w-full px-4 py-2.5 text-base font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy outline-none text-navy placeholder-gray-400 transition-all"
              />
              {validationErrors.title && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.title[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="block text-xs font-semibold text-gray-500 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-navy focus-within:border-navy">
                <span className="px-3 text-xs text-gray-400 font-mono select-none">
                  /article/
                </span>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(generateSlug(e.target.value));
                    setSlugManuallyEdited(true);
                  }}
                  placeholder="maharatna-psus-clean-energy-corridor"
                  className="w-full px-2 py-2 text-xs font-mono bg-white outline-none text-gray-800"
                />
              </div>
              {validationErrors.slug && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.slug[0]}</p>
              )}
            </div>
          </div>

          {/* Summary / Excerpt Box */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs">
            <label htmlFor="summary" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Article Summary / Deck <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">
              A concise 2-3 sentence overview shown in article cards and search results.
            </p>
            <textarea
              id="summary"
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide a compelling executive summary of the story..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy outline-none text-gray-800 transition-all"
            />
            {validationErrors.summary && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.summary[0]}</p>
            )}
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Article Body Content <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Format paragraphs, subheadings, bullet points, and inline images using the toolbar.
            </p>
            <TipTapEditor value={content} onChange={setContent} />
            {validationErrors.content && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.content[0]}</p>
            )}
          </div>
        </div>

        {/* Right Column: Featured Image, Categorization, Status & Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publish & Status Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="font-playfair font-bold text-base text-navy pb-2 border-b border-gray-100">
              Publishing Actions
            </h3>

            {/* Status Switcher */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Current Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    status === "draft"
                      ? "bg-saffron/10 text-saffron border-saffron shadow-2xs"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  📝 Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    status === "published"
                      ? "bg-green/10 text-green border-green shadow-2xs"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  🚀 Published
                </button>
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-navy rounded border-gray-300 focus:ring-navy cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Feature on Homepage Hero
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit("published")}
                className="w-full py-2.5 px-4 bg-navy hover:bg-navy/90 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {submitting && status === "published" ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>{isEdit ? "Update & Publish" : "Publish Article Now"}</span>
                )}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit("draft")}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting && status === "draft" ? "Saving Draft..." : "Save as Draft"}
              </button>

              <Link
                href="/admin/articles"
                className="block text-center text-xs text-gray-400 hover:text-navy pt-1 transition-colors"
              >
                Cancel and return
              </Link>
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <h3 className="font-playfair font-bold text-base text-navy pb-2 border-b border-gray-100">
              Featured Image
            </h3>

            {/* Image Preview */}
            {isValidImageUrl(imageUrl) ? (
              <div className="relative aspect-16/10 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                <Image
                  src={imageUrl}
                  alt="Article featured preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-red-600 text-white transition-colors text-xs"
                  title="Remove image"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-gray-50/50">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-xs text-gray-500 font-medium">No image selected</div>
                <div className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WEBP up to 5MB</div>
              </div>
            )}

            {/* Upload File Trigger */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-navy" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{imageUrl ? "Change Image" : "Upload File"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct URL Input */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Or enter image URL:
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or /uploads/..."
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-navy outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Categorization & Metadata Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-playfair font-bold text-base text-navy">
                Categorization
              </h3>
              <button
                type="button"
                onClick={refreshOptions}
                disabled={refreshingOptions}
                className="inline-flex items-center gap-1.5 text-2xs font-semibold text-navy hover:text-saffron transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200"
                title="Refresh categories, companies, authors, and tags from database"
              >
                <svg
                  className={`w-3.5 h-3.5 ${refreshingOptions ? "animate-spin text-saffron" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{refreshingOptions ? "Refreshing..." : "Refresh Options"}</span>
              </button>
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy outline-none text-gray-800 bg-white"
              >
                <option value="">-- Select Category --</option>
                {parentCategories.map((parent) => {
                  const subs = childCategories.filter((c) => c.parentId === parent.id);
                  return (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>{parent.name} (Main)</option>
                      {subs.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          &nbsp;&nbsp;↳ {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* Optional Company */}
            <div>
              <label htmlFor="company" className="block text-xs font-semibold text-gray-700 mb-1">
                Associated Company (Optional)
              </label>
              <select
                id="company"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy outline-none text-gray-800 bg-white"
              >
                <option value="">-- None / General --</option>
                {liveCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Author */}
            <div>
              <label htmlFor="author" className="block text-xs font-semibold text-gray-700 mb-1">
                Author (Optional)
              </label>
              <select
                id="author"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy outline-none text-gray-800 bg-white"
              >
                <option value="">-- Staff Reporter / Editorial Desk --</option>
                {liveAuthors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input & Live Selector */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Tags
              </label>

              {/* Quick Pick from Live Available Tags */}
              {availableTags.length > 0 && (
                <div>
                  <span className="text-2xs text-gray-500 font-medium block mb-1">
                    Pick from existing tags:
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-gray-50 rounded-lg border border-gray-200">
                    {availableTags.map((at) => {
                      const isSelected = tags.includes(at.name);
                      return (
                        <button
                          key={at.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              handleRemoveTag(at.name);
                            } else {
                              setTags([...tags, at.name]);
                            }
                          }}
                          className={`text-2xs px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-navy text-white border-navy font-semibold"
                              : "bg-white text-gray-600 border-gray-200 hover:border-navy hover:text-navy"
                          }`}
                        >
                          #{at.name} {isSelected ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-400">
                Or type a new tag and press Enter or comma.
              </p>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add new tag and press Enter..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy outline-none text-gray-800 mb-2"
              />

              {/* Selected Tag Badges */}
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title={`Remove tag ${tag}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
