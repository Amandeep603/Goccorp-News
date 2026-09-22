export default function ArticleLoading() {
  return (
    <div className="w-full bg-background min-h-screen pb-20 font-sans animate-pulse">
      {/* Top Header Bar Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumbs skeleton */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-3 w-12 bg-gray-200 rounded-xs" />
            <span className="text-gray-300">/</span>
            <div className="h-3 w-16 bg-gray-200 rounded-xs" />
            <span className="text-gray-300">/</span>
            <div className="h-3 w-36 bg-gray-200 rounded-xs" />
          </div>

          {/* Badges skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-20 bg-saffron/20 rounded-full" />
            <div className="h-5 w-28 bg-navy/10 rounded-full" />
          </div>

          {/* Headline skeleton */}
          <div className="space-y-3 mb-5">
            <div className="h-9 sm:h-11 w-full bg-gray-200 rounded-xs" />
            <div className="h-9 sm:h-11 w-4/5 bg-gray-200 rounded-xs" />
          </div>

          {/* Summary skeleton */}
          <div className="space-y-2 mb-6">
            <div className="h-4.5 w-full bg-gray-100 rounded-xs" />
            <div className="h-4.5 w-5/6 bg-gray-100 rounded-xs" />
          </div>

          {/* Byline & Share Strip skeleton */}
          <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy/15" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-gray-200 rounded-xs" />
                <div className="h-2.5 w-36 bg-gray-100 rounded-xs" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-100" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          {/* Featured Image skeleton */}
          <div className="aspect-16/9 sm:aspect-21/10 w-full bg-navy/15" />

          {/* Article Body skeleton */}
          <div className="p-6 sm:p-10 lg:p-12 space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded-xs" />
            <div className="h-4 w-full bg-gray-200 rounded-xs" />
            <div className="h-4 w-11/12 bg-gray-200 rounded-xs" />
            <div className="h-4 w-4/5 bg-gray-100 rounded-xs" />

            <div className="pt-4 space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded-xs" />
              <div className="h-4 w-full bg-gray-200 rounded-xs" />
              <div className="h-4 w-3/4 bg-gray-100 rounded-xs" />
            </div>

            <div className="pt-4 space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded-xs" />
              <div className="h-4 w-5/6 bg-gray-100 rounded-xs" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
