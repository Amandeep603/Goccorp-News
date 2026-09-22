"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { generateSlug } from "@/lib/validations/article";

export interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  sector: string | null;
  logoUrl: string | null;
  _count?: {
    articles: number;
  };
}

interface CompaniesManagerProps {
  initialCompanies: CompanyItem[];
}

export default function CompaniesManager({ initialCompanies }: CompaniesManagerProps) {
  const [companies, setCompanies] = useState<CompanyItem[]>(initialCompanies);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSector, setFormSector] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete State
  const [companyToDelete, setCompanyToDelete] = useState<CompanyItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormName("");
    setFormSlug("");
    setFormSector("");
    setFormLogoUrl("");
    setSlugManuallyEdited(false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (comp: CompanyItem) => {
    setEditingCompany(comp);
    setFormName(comp.name);
    setFormSlug(comp.slug);
    setFormSector(comp.sector || "");
    setFormLogoUrl(comp.logoUrl || "");
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

  // Upload Logo using /api/admin/upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setFormError(data.error || "Failed to upload logo.");
      } else {
        setFormLogoUrl(data.url);
      }
    } catch {
      setFormError("An error occurred while uploading company logo.");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Company name is required.");
      return;
    }

    const finalSlug = formSlug ? generateSlug(formSlug) : generateSlug(formName);
    if (!finalSlug) {
      setFormError("A valid slug is required.");
      return;
    }

    setSaving(true);

    try {
      const url = editingCompany
        ? `/api/admin/companies/${editingCompany.id}`
        : `/api/admin/companies`;
      const method = editingCompany ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          slug: finalSlug,
          sector: formSector.trim() || null,
          logoUrl: formLogoUrl.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setFormError(data.error || "Failed to save company.");
      } else {
        if (editingCompany) {
          setCompanies((prev) =>
            prev.map((c) => (c.id === editingCompany.id ? data.company : c))
          );
          setSuccessMessage(`Company "${data.company.name}" updated successfully.`);
        } else {
          setCompanies((prev) => [...prev, data.company]);
          setSuccessMessage(`Company "${data.company.name}" created successfully.`);
        }
        setModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch {
      setFormError("Something went wrong while saving company.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    setDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/companies/${companyToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to delete company.");
      } else {
        setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
        setSuccessMessage(data.message || `Company deleted successfully.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch {
      setErrorMessage("Something went wrong while deleting company.");
    } finally {
      setDeleting(false);
      setCompanyToDelete(null);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.sector && c.sector.toLowerCase().includes(q))
    );
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
            placeholder="Search companies by name, slug, or sector..."
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

        {/* Add Company Button */}
        <button
          onClick={handleOpenAddModal}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-navy hover:bg-navy/90 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Company</span>
        </button>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Sector / Classification</th>
                <th className="py-3 px-4 text-center">Articles</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    {searchQuery ? "No companies matching your search query." : "No companies added yet."}
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((comp) => {
                  const articleCount = comp._count?.articles ?? 0;

                  return (
                    <tr key={comp.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Logo + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 shrink-0 overflow-hidden flex items-center justify-center relative">
                            {comp.logoUrl ? (
                              <Image
                                src={comp.logoUrl}
                                alt={comp.name}
                                width={40}
                                height={40}
                                unoptimized
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <span className="text-xs font-bold text-gray-400">
                                {comp.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-navy block">{comp.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                        /{comp.slug}
                      </td>

                      {/* Sector */}
                      <td className="py-3.5 px-4">
                        {comp.sector ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {comp.sector}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
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
                        <button
                          onClick={() => handleOpenEditModal(comp)}
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-navy bg-gray-100 hover:bg-navy hover:text-white rounded-md transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setCompanyToDelete(comp)}
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

      {/* Add / Edit Company Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-navy text-base">
                {editingCompany ? "Edit Company" : "Add New Company"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-navy text-lg font-bold p-1 leading-none"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCompany} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NTPC Limited, ONGC, Coal India"
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
                    placeholder="ntpc-limited"
                    value={formSlug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormSlug(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-r-lg text-sm font-mono text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Sector / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Power, Defence, Maharatna, Navratna"
                  value={formSector}
                  onChange={(e) => setFormSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Company Logo
                </label>

                {formLogoUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 rounded-md bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <Image
                        src={formLogoUrl}
                        alt="Company Logo"
                        width={48}
                        height={48}
                        unoptimized
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-gray-500 truncate">{formLogoUrl}</p>
                      <button
                        type="button"
                        onClick={() => setFormLogoUrl("")}
                        className="text-2xs font-semibold text-red-600 hover:text-red-700 mt-1 cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="w-full py-3 px-4 border-2 border-dashed border-gray-200 hover:border-navy/40 rounded-lg text-xs font-medium text-gray-600 hover:text-navy transition-colors flex items-center justify-center gap-2 cursor-pointer bg-gray-50/50"
                    >
                      {uploadingLogo ? (
                        <>
                          <span className="w-3 h-3 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />
                          <span>Uploading logo...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Click to upload logo (PNG, JPG, WEBP)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving || uploadingLogo}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingLogo}
                  className="px-4 py-2 text-xs font-bold text-white bg-navy hover:bg-navy/90 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {saving && (
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{editingCompany ? "Update Company" : "Create Company"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-navy text-sm">Delete Company?</h4>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-navy">"{companyToDelete.name}"</span>?
            </p>

            {(companyToDelete._count?.articles ?? 0) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs leading-relaxed">
                ℹ️ This company is associated with <strong>{companyToDelete._count?.articles}</strong> article(s). Deleting it will safely unlink the company from those articles.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCompanyToDelete(null)}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCompany}
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
