"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ArticleImagePlaceholder from "./ArticleImagePlaceholder";
import { getBadgeColor } from "./ArticleCard";

interface SearchResultItem {
  id: string;
  title: string;
  titleHi?: string | null;
  slug: string;
  summary: string;
  imageUrl?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  category?: { id: string; name: string; slug: string } | null;
  company?: { id: string; name: string; slug: string } | null;
  author?: { id: string; name: string } | null;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Debounced API search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=8`);
        const data = await res.json();
        if (data.success) {
          setResults(data.articles || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
        setResults([]);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-start justify-center pt-14 sm:pt-20 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xs shadow-2xl border border-gray-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative flex items-center border-b border-gray-200 px-4 py-3 bg-white">
          <svg
            className="w-5 h-5 text-gray-400 shrink-0 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, PSU companies, sectors (e.g. ONGC, airport)..."
            className="w-full text-sm sm:text-base text-navy placeholder-gray-400 focus:outline-none bg-transparent"
          />

          {loading && (
            <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin shrink-0 mx-2" />
          )}

          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-navy text-xs font-bold shrink-0 mx-1"
              aria-label="Clear query"
            >
              ✕
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-xs font-semibold text-gray-400 hover:text-navy bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-xs transition-colors"
          >
            ESC
          </button>
        </form>

        {/* Results Container */}
        <div className="overflow-y-auto p-2 divide-y divide-gray-100">
          {query.trim() && hasSearched && !loading && results.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="font-playfair text-lg font-bold text-navy mb-1">
                No articles found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-gray-500 font-sans">
                Try searching for broader keywords like &ldquo;ONGC&rdquo;, &ldquo;airport&rdquo;, or &ldquo;aviation&rdquo;.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Top Matches ({results.length})
              </div>

              {results.map((item) => {
                const categoryName = item.category?.name || "News";
                const displayDate = item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "";

                return (
                  <Link
                    key={item.id}
                    href={`/article/${item.slug}`}
                    onClick={onClose}
                    className="group flex items-start gap-3 p-3 rounded-xs hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`inline-block px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider rounded-xs border ${getBadgeColor(
                            categoryName
                          )}`}
                        >
                          {categoryName}
                        </span>
                        {item.company && (
                          <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                            {item.company.name}
                          </span>
                        )}
                      </div>

                      <h4 className="font-playfair font-bold text-navy group-hover:text-saffron transition-colors text-sm sm:text-[15px] leading-snug line-clamp-2 mb-1">
                        {item.title}
                      </h4>

                      <p className="font-sans text-xs text-gray-500 line-clamp-1 mb-1">
                        {item.summary}
                      </p>

                      <div className="text-[10px] text-gray-400 font-sans">
                        {item.author?.name} {displayDate && `• ${displayDate}`}
                      </div>
                    </div>

                    {/* Small thumbnail */}
                    <div className="w-14 h-14 shrink-0 rounded-xs overflow-hidden bg-navy relative border border-gray-200">
                      {item.imageUrl && item.imageUrl.trim() !== "" ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized={item.imageUrl.startsWith("/uploads/") || item.imageUrl.includes("blob.vercel-storage.com")}
                        />
                      ) : (
                        <ArticleImagePlaceholder iconClassName="w-5 h-5 text-white/25" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {query.trim() && (
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-sans">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded-xs font-mono text-[10px]">Enter</kbd> to view all results</span>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-navy font-semibold hover:text-saffron transition-colors"
            >
              See all results →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
