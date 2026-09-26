"use client";

import { useState } from "react";
import { generateSlug } from "@/lib/validations/article";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  order?: number;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    articles: number;
    children: number;
  };
}

interface CategoriesManagerProps {
  initialCategories: CategoryItem[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<string>("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Available parent options (cannot select self or child categories if editing)
  const parentOptions = categories.filter((c) => {
    if (!c.parentId) {
      if (editingCategory && c.id === editingCategory.id) return false;
      return true;
    }
    return false;
  });

  const handleOpenAddModal = (defaultParentId?: string) => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    const initialParent = defaultParentId || (parentOptions[0]?.id ?? "");
    setFormParentId(initialParent);
    setSlugManuallyEdited(false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parentId || "");
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Category name is required.");
      return;
    }

    if (!editingCategory && !formParentId) {
      setFormError("Parent category is required. Sub-categories must belong to a top-level parent tab.");
      return;
    }

    const finalSlug = formSlug ? generateSlug(formSlug) : generateSlug(formName);
    if (!finalSlug) {
      setFormError("A valid slug is required.");
      return;
    }

    setSaving(true);

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : `/api/admin/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          slug: finalSlug,
          parentId: formParentId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setFormError(data.error || "Failed to save category.");
      } else {
        if (editingCategory) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? data.category : c))
          );
          setSuccessMessage(`Category "${data.category.name}" updated successfully.`);
        } else {
          setCategories((prev) => [...prev, data.category]);
          setSuccessMessage(`Category "${data.category.name}" created successfully.`);
        }
        setModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch {
      setFormError("Something went wrong while saving category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to delete category.");
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        setSuccessMessage(data.message || `Category deleted successfully.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch {
      setErrorMessage("Something went wrong while deleting category.");
    } finally {
      setDeleting(false);
      setCategoryToDelete(null);
    }
  };

  // Build hierarchical list: Parent categories with their children directly beneath them
  const parentCategories = [...categories.filter((c) => !c.parentId)].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const childCategories = categories.filter((c) => Boolean(c.parentId));

  const hierarchicalList: Array<{ item: CategoryItem; isChild: boolean; parentName?: string }> = [];
  parentCategories.forEach((parent) => {
    hierarchicalList.push({ item: parent, isChild: false });
    const children = childCategories.filter((child) => child.parentId === parent.id);
    children.forEach((child) => {
      hierarchicalList.push({ item: child, isChild: true, parentName: parent.name });
    });
  });

  // Add any orphaned children if any exist
  const addedIds = new Set(hierarchicalList.map((h) => h.item.id));
  categories.forEach((cat) => {
    if (!addedIds.has(cat.id)) {
      hierarchicalList.push({ item: cat, isChild: Boolean(cat.parentId) });
    }
  });

  // Filter based on search query
  const filteredList = hierarchicalList.filter(({ item }) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      (item.parent?.name && item.parent.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Messages */}
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

      {/* Control Bar: Search & Actions */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search categories by name or slug..."
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

        {/* Add Sub-Category Button */}
        <button
          onClick={() => handleOpenAddModal()}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-navy hover:bg-navy/90 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Sub-Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Type / Parent</th>
                <th className="py-3 px-4 text-center">Subcategories</th>
                <th className="py-3 px-4 text-center">Articles</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                    {searchQuery ? "No categories matching your search query." : "No categories found."}
                  </td>
                </tr>
              ) : (
                filteredList.map(({ item, isChild, parentName }) => {
                  const articleCount = item._count?.articles ?? 0;
                  const childCount = item._count?.children ?? 0;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        isChild ? "bg-gray-50/30" : "bg-white"
                      }`}
                    >
                      {/* Name with indentation for children */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {isChild && (
                            <span className="text-gray-300 select-none pl-4 text-base font-mono">
                              ↳
                            </span>
                          )}
                          <span
                            className={`font-medium ${
                              isChild ? "text-gray-700" : "text-navy font-semibold"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                        /{item.slug}
                      </td>

                      {/* Parent / Type */}
                      <td className="py-3.5 px-4">
                        {isChild ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                            <span>Sub of</span>
                            <span className="font-semibold">{parentName || item.parent?.name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy/10 text-navy">
                            Parent Tab
                          </span>
                        )}
                      </td>

                      {/* Subcategory Count */}
                      <td className="py-3.5 px-4 text-center">
                        {!isChild ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {childCount}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Articles Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            articleCount > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {articleCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        {!isChild && (
                          <button
                            onClick={() => handleOpenAddModal(item.id)}
                            type="button"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-saffron bg-saffron/10 hover:bg-saffron hover:text-white rounded-md transition-colors cursor-pointer"
                            title={`Add a new sub-category under ${item.name}`}
                          >
                            + Add Sub
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-navy bg-gray-100 hover:bg-navy hover:text-white rounded-md transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        {isChild ? (
                          <button
                            onClick={() => setCategoryToDelete(item)}
                            type="button"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-md transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center px-2 py-1 text-2xs font-semibold text-gray-400 bg-gray-50 rounded-md select-none"
                            title="Fixed top-level navbar category tab (cannot be deleted)"
                          >
                            Core Tab
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-navy text-base">
                {editingCategory
                  ? editingCategory.parentId
                    ? "Edit Sub-Category"
                    : "Edit Parent Category"
                  : "Add New Sub-Category"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-navy text-lg font-bold p-1 leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
                  {formError}
                </div>
              )}

              {/* Parent Dropdown (Required for new sub-categories) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Parent Category {editingCategory && !editingCategory.parentId ? "(Core Tab)" : <span className="text-red-500">*</span>}
                </label>
                {editingCategory && !editingCategory.parentId ? (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-navy">
                    Fixed Top-Level Navigation Tab
                  </div>
                ) : (
                  <select
                    required
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white"
                  >
                    <option value="" disabled>-- Select Parent Category Tab --</option>
                    {parentOptions.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} (/{parent.slug})
                      </option>
                    ))}
                  </select>
                )}
                <p className="mt-1 text-2xs text-gray-400">
                  This item will appear as a sub-menu entry under this parent tab in the navbar.
                </p>
              </div>

              {/* Sub-category Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {editingCategory && !editingCategory.parentId ? "Category Name" : "Sub-category Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oil & Gas, Clean Energy, Banking"
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
                    placeholder="clean-energy"
                    value={formSlug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormSlug(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-r-lg text-sm font-mono text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>
                <p className="mt-1 text-2xs text-gray-400">
                  Auto-generated from name. Lowercase alphanumeric and hyphens only.
                </p>
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
                  <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-navy text-sm">Delete Category?</h4>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-navy">"{categoryToDelete.name}"</span>?
            </p>

            {(categoryToDelete._count?.children ?? 0) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs leading-relaxed">
                ⚠️ This category currently has <strong>{categoryToDelete._count?.children}</strong> subcategories. Deletion will be blocked until subcategories are reassigned or removed.
              </div>
            )}

            {(categoryToDelete._count?.articles ?? 0) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs leading-relaxed">
                ⚠️ This category currently has <strong>{categoryToDelete._count?.articles}</strong> articles. Deletion will be blocked until articles are moved to another category.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
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
