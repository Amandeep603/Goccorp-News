"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchModal from "./SearchModal";
import { loadGoogleTranslateScript } from "@/components/public/GoogleTranslate";
import { t } from "@/lib/i18n";

export type SubItem = {
  id?: string;
  name: string;
  slug?: string;
  href: string;
};

export type NavItem = {
  id?: string;
  name: string;
  slug?: string;
  href: string;
  subItems?: SubItem[];
};

export interface HeaderProps {
  initialNavItems?: NavItem[];
}

export default function Header({ initialNavItems = [] }: HeaderProps = {}) {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"En" | "Hi">("En");
  const [searchOpen, setSearchOpen] = useState(false);

  // Sync state if initialNavItems changes
  useEffect(() => {
    if (initialNavItems && initialNavItems.length > 0) {
      setNavItems(initialNavItems);
    }
  }, [initialNavItems]);

  // Fetch from Category API only if initial items were missing on mount
  useEffect(() => {
    if (navItems.length > 0) return;
    let isMounted = true;
    async function loadLiveNavItems() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (data.navItems && data.navItems.length > 0 && isMounted) {
            setNavItems(data.navItems);
          }
        }
      } catch (err) {
        console.error("Live category fetch error in header:", err);
      }
    }
    loadLiveNavItems();
    return () => {
      isMounted = false;
    };
  }, [navItems.length]);

  useEffect(() => {
    const isHindi = document.cookie.includes("googtrans=/en/hi");
    setSelectedLanguage(isHindi ? "Hi" : "En");
  }, []);

  const handleLanguageChange = (lang: "En" | "Hi") => {
    if (lang === "Hi") {
      document.cookie = "lang=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=/en/hi; path=/";
      loadGoogleTranslateScript();
      window.location.reload();
    } else {
      // Revert to English: delete googtrans cookie entirely across root and host domains
      const hostname = typeof window !== "undefined" ? window.location.hostname : "";
      const domainParts = hostname ? hostname.split(".") : [];

      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "lang=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      if (hostname) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      }

      if (domainParts.length >= 2) {
        const rootDomain = domainParts.slice(-2).join(".");
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain};`;
      }

      window.location.reload();
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const toggleMobileDropdown = (name: string) => {
    setMobileOpenDropdown((prev) => (prev === name ? null : name));
  };

  const isHi = selectedLanguage === "Hi";

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
        {/* Top Thin Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 border-b border-gray-100">
            {/* Logo on Left */}
            <Link href="/" className="flex items-center notranslate" translate="no">
              <Image
                src="/logo.png"
                alt="GovCorp News"
                width={180}
                height={65}
                className="h-9 sm:h-11 w-auto max-w-[150px] sm:max-w-[180px] object-contain"
                priority
              />
            </Link>

            {/* Right Controls: Language Toggle & Search Icon + Mobile Menu Trigger */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Language Toggle */}
              <div
                className="inline-flex items-center rounded-full bg-gray-100 p-0.5 text-xs font-semibold font-sans notranslate"
                translate="no"
              >
                <button
                  type="button"
                  onClick={() => handleLanguageChange("En")}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer notranslate ${selectedLanguage === "En"
                      ? "bg-navy text-white shadow-xs"
                      : "text-gray-600 hover:text-navy"
                    }`}
                  translate="no"
                  aria-label="Switch to English"
                >
                  En
                </button>
                <span className="text-gray-300 text-xs select-none notranslate" translate="no">|</span>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("Hi")}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer notranslate ${selectedLanguage === "Hi"
                      ? "bg-navy text-white shadow-xs"
                      : "text-gray-600 hover:text-navy"
                    }`}
                  translate="no"
                  aria-label="Switch to Hindi"
                >
                  Hi
                </button>
              </div>

              {/* Search Icon (Magnifying glass) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 text-navy hover:text-saffron hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-navy hover:text-saffron rounded-md transition-colors"
                aria-label="Open mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Horizontal Navigation Bar */}
        <nav className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
          <ul className="flex items-center justify-between text-sm font-medium text-navy">
            {navItems.map((item) => {
              const hasDropdown = Boolean(item.subItems && item.subItems.length > 0);
              const isOpen = openDropdown === item.name;

              return (
                <li
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => hasDropdown && setOpenDropdown(item.name)}
                  onMouseLeave={() => hasDropdown && setOpenDropdown(null)}
                >
                  {hasDropdown ? (
                    <div className="inline-flex items-center">
                      <Link
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className={`inline-flex items-center py-3.5 pl-2 pr-1 transition-colors relative border-b-2 ${isOpen
                            ? "text-saffron border-saffron"
                            : "border-transparent text-navy hover:text-saffron hover:border-saffron"
                          }`}
                      >
                        <span className="notranslate" translate="no">{t(item.name, isHi)}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleDropdown(item.name)}
                        className={`py-3.5 pr-2 pl-0.5 border-b-2 transition-colors ${isOpen
                            ? "text-saffron border-saffron"
                            : "border-transparent text-gray-400 group-hover:text-saffron group-hover:border-saffron"
                          }`}
                        aria-expanded={isOpen}
                        aria-label={`Open ${t(item.name, isHi)} dropdown`}
                      >
                        <svg
                          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180 text-saffron" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="inline-flex items-center py-3.5 px-2 transition-colors relative border-b-2 border-transparent text-navy hover:text-saffron hover:border-saffron"
                    >
                      <span className="notranslate" translate="no">{t(item.name, isHi)}</span>
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {hasDropdown && (
                    <div
                      className={`absolute left-0 top-full w-52 bg-white rounded-b-md shadow-lg border border-gray-100 py-2 z-50 transition-all duration-150 ${isOpen
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible pointer-events-none -translate-y-1"
                        }`}
                    >
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-saffron hover:bg-gray-50 transition-colors notranslate"
                          translate="no"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {t(sub.name, isHi)}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Drawer */}
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 notranslate" translate="no">
                <Image
                  src="/logo.png"
                  alt="GovCorp News"
                  width={140}
                  height={51}
                  className="h-8 w-auto max-w-[140px] object-contain"
                  priority
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-navy rounded-md transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation List */}
              <div className="overflow-y-auto flex-1 px-4 py-3 font-sans">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const hasDropdown = Boolean(item.subItems && item.subItems.length > 0);
                    const isOpen = mobileOpenDropdown === item.name;

                    return (
                      <li key={item.name} className="border-b border-gray-100 last:border-b-0">
                        {hasDropdown ? (
                          <div>
                            <div className="w-full flex items-center justify-between py-3">
                              <Link
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-medium text-navy hover:text-saffron transition-colors notranslate"
                                translate="no"
                              >
                                {t(item.name, isHi)}
                              </Link>
                              <button
                                type="button"
                                onClick={() => toggleMobileDropdown(item.name)}
                                className="p-1 text-gray-400 hover:text-navy"
                                aria-label={`Toggle ${t(item.name, isHi)} submenu`}
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-saffron" : ""
                                    }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                            </div>
                            {isOpen && (
                              <ul className="pl-4 pb-2 space-y-1 bg-gray-50/70 rounded-md mb-2">
                                {item.subItems?.map((sub) => (
                                  <li key={sub.name}>
                                    <Link
                                      href={sub.href}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block py-2 text-sm text-gray-600 hover:text-saffron transition-colors notranslate"
                                      translate="no"
                                    >
                                      {t(sub.name, isHi)}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-3 font-medium text-navy hover:text-saffron transition-colors notranslate"
                            translate="no"
                          >
                            {t(item.name, isHi)}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
