import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import PasswordChangePrompt from "@/components/admin/PasswordChangePrompt";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch current admin user record to check mustChangePassword
  const adminUser = session?.user?.email
    ? await prisma.adminUser.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          mustChangePassword: true,
        },
      })
    : null;

  // Real database counts from MongoDB
  const [totalArticles, publishedArticles, draftArticles, totalCategories, totalCompanies, totalAuthors] =
    await Promise.all([
      prisma.article.count().catch(() => 0),
      prisma.article.count({ where: { status: "published" } }).catch(() => 0),
      prisma.article.count({ where: { status: "draft" } }).catch(() => 0),
      prisma.category.count().catch(() => 0),
      prisma.company.count().catch(() => 0),
      prisma.author.count().catch(() => 0),
    ]);

  const adminName = adminUser?.name || session?.user?.name || "Admin";
  const adminEmail = adminUser?.email || session?.user?.email || "admin@govcorpnews.com";
  const mustChangePassword = adminUser?.mustChangePassword ?? false;

  const statCards = [
    {
      title: "Total Articles",
      count: totalArticles,
      subtitle: "All records in repository",
      badge: "Total",
      badgeColor: "bg-navy/10 text-navy border-navy/20",
      icon: (
        <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      ),
    },
    {
      title: "Published",
      count: publishedArticles,
      subtitle: "Live stories on site",
      badge: "Public",
      badgeColor: "bg-green/10 text-green border-green/20",
      icon: (
        <svg className="w-6 h-6 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Drafts",
      count: draftArticles,
      subtitle: "Unpublished editorial drafts",
      badge: "Drafts",
      badgeColor: "bg-saffron/10 text-saffron border-saffron/20",
      icon: (
        <svg className="w-6 h-6 text-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      title: "Total Categories",
      count: totalCategories,
      subtitle: "Base sections & subcategories",
      badge: "Active",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: (
        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Password Change Banner & Modal if mustChangePassword is true */}
      <PasswordChangePrompt
        initialMustChangePassword={mustChangePassword}
        adminEmail={adminEmail}
      />

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-8 bg-saffron rounded-xs" />
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Welcome back, {adminName}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            GovCorp News Content Management System • Connected to MongoDB Atlas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green/10 text-green border border-green/20">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            Database Online
          </span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                {card.icon}
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>

            <div>
              <div className="text-3xl font-bold text-navy tracking-tight">
                {card.count}
              </div>
              <div className="text-sm font-semibold text-gray-700 mt-1">
                {card.title}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {card.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overview & Quick Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <h2 className="font-playfair font-bold text-lg text-navy">
              System Collections Overview
            </h2>
            <span className="text-xs font-medium text-gray-500">
              MongoDB • govcorp_news
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 font-medium">Categories</div>
              <div className="text-xl font-bold text-navy mt-1">{totalCategories}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Seeded & active</div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 font-medium">Companies</div>
              <div className="text-xl font-bold text-navy mt-1">{totalCompanies}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">PSUs & Maharatnas</div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 font-medium">Authors</div>
              <div className="text-xl font-bold text-navy mt-1">{totalAuthors}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Staff & analysts</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition-colors shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span>View Categories ({totalCategories})</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              <span>Preview Public Website</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Admin Account Summary Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="font-playfair font-bold text-lg text-navy pb-3 border-b border-gray-100 mb-4">
              Current Session
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Admin Email</span>
                <span className="font-semibold text-gray-800 text-sm">{adminEmail}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Assigned Role</span>
                <span className="inline-block font-bold text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-green/10 text-green border border-green/20">
                  {adminUser?.role || "super_admin"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Password Status</span>
                {mustChangePassword ? (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    Temporary password (change required)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-green font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green" />
                    Secure personal password set
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
            GovCorp News Core Engine • Next.js 16 + MongoDB
          </div>
        </div>
      </div>
    </div>
  );
}
