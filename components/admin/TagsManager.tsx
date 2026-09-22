"use client";

import { useState } from "react";
import { generateSlug } from "@/lib/validations/article";

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  articleIds?: string[];
  _count?: {
    articles: number;
  };
}

interface TagsManagerProps {
  initialTags: TagItem[];
}

export default function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [tagToDelete, setTagToDelete] = useState<TagItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingTag(null);
    setFormName("");
    setFormSlug("");
    setSlugManuallyEdited(false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (tag: TagItem) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setSlugManuallyEdited(true);
    setFormError(null);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!slugManuallyEdited) {
      setFormSlug(generateSlug(val));
    }
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Tag name is required.");
      return;
    }

    const finalSlug = formSlug ? generateSlug(formSlug) : generateSlug(formName);
    if (!finalSlug) {
      setFormError("A valid slug is required.");
      return;
    }

    setSaving(true);

    try {
      const url = editingTag ? `/api/admin/tags/${editingTag.id}` : `/api/admin/tags`;
      const method = editingTag ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          slug: finalSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setFormError(data.error || "Failed to save tag.");
      } else {
        if (editingTag) {
          setTags((prev) =>
            prev.map((t) => (t.id === editingTag.id ? data.tag : t))
          );
          setSuccessMessage(`Tag "${data.tag.name}" updated successfully.`);
        } else {
          setTags((prev) => [...prev, data.tag]);
          setSuccessMessage(`Tag "${data.tag.name}" created successfully.`);
        }
        setModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch {
      setFormError("Something went wrong while saving tag.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    setDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/tags/${tagToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to delete tag.");
      } else {
        setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
        setSuccessMessage(data.message || `Tag deleted successfully.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch {
      setErrorMessage("Something went wrong while deleting tag.");
    } finally {
      setDeleting(false);
      setTagToDelete(null);
    }
  };

  const filteredTags = tags.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search tags by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-navy text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Add Tag Button */}
        <button
          onClick={handleOpenAddModal}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-navy hover:bg-navy/90 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Tag</span>
        </button>
      </div>

      {/* Tags Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4 text-center">Articles Using Tag</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                    {searchQuery ? "No tags matching your search query." : "No tags added yet."}
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag) => {
                  const articleCount =
                    tag._count?.articles ?? (tag.articleIds ? tag.articleIds.length : 0);

                  return (
                    <tr key={tag.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Name with pill style */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-navy border border-gray-200">
                          <span className="text-gray-400">#</span>
                          <span>{tag.name}</span>
                        </span>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                        /{tag.slug}
                      </td>

                      {/* Usage Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            articleCount > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {articleCount} {articleCount === 1 ? "article" : "articles"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(tag)}
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-navy bg-gray-100 hover:bg-navy hover:text-white rounded-md transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setTagToDelete(tag)}
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-md transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Tag Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-navy text-base">
                {editingTag ? "Edit Tag" : "Add New Tag"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-navy text-lg font-bold p-1 leading-none"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTag} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disinvestment, Renewable Energy, Capex"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 text-gray-500 text-xs rounded-l-lg select-none">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="renewable-energy"
                    value={formSlug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormSlug(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-r-lg text-sm font-mono text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-navy hover:bg-navy/90 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {saving && (
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{editingTag ? "Update Tag" : "Create Tag"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tagToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-navy text-sm">Delete Tag?</h4>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete tag <span className="font-semibold text-navy">"#{tagToDelete.name}"</span>?
            </p>

            {((tagToDelete._count?.articles ?? 0) > 0 || (tagToDelete.articleIds?.length ?? 0) > 0) && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs leading-relaxed">
                ⚠️ This tag is currently assigned to <strong>{tagToDelete._count?.articles ?? tagToDelete.articleIds?.length}</strong> article(s). Deletion is blocked to protect article references. Please remove the tag from those articles first.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setTagToDelete(null)}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTag}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {deleting && (
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
