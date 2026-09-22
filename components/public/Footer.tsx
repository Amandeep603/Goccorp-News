"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-navy text-gray-300 font-sans border-t border-navy/50">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Logo & Tagline */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="inline-block bg-white px-3 py-1.5 rounded-md shadow-xs">
              <Image
                src="/logo.png"
                alt="GovCorp News"
                width={150}
                height={54}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm text-gray-300 font-medium leading-relaxed max-w-sm">
              India&apos;s PSU &amp; Corporate News Network
            </p>
          </div>

          {/* Middle: Three Link Columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6 sm:gap-8">
            {/* Company Column */}
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
                Company
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-saffron transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-saffron transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-saffron transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Sections Column */}
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
                Sections
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/companies" className="text-gray-300 hover:text-saffron transition-colors">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link href="/sectors" className="text-gray-300 hover:text-saffron transition-colors">
                    Sectors
                  </Link>
                </li>
                <li>
                  <Link href="/government" className="text-gray-300 hover:text-saffron transition-colors">
                    Government
                  </Link>
                </li>
                <li>
                  <Link href="/market" className="text-gray-300 hover:text-saffron transition-colors">
                    Market
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
                Legal
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-saffron transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-saffron transition-colors">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Mail & Social Icons */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-3">
                News Desk
              </h3>
              <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                Got news to share? Mail us at{" "}
                <a
                  href="mailto:news@govcorpnews.com"
                  className="text-white font-medium hover:text-saffron underline decoration-saffron/40 hover:decoration-saffron transition-colors"
                >
                  news@govcorpnews.com
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="mt-6">
              <span className="block text-xs uppercase text-gray-400 font-semibold tracking-wider mb-3">
                Follow Us
              </span>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-[#1877F2] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>

                {/* X (formerly Twitter) */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-black hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-[#0A66C2] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-[#25D366] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/govcorpnews"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-[linear-gradient(45deg,#f09433_0%,#dc2743_50%,#bc1888_100%)] hover:text-white transition-all duration-200"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="border-t border-white/10 bg-navy/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
          <p>© 2026 GovCorp News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
