export default function SearchLoading() {
  return (
    <div className="w-full bg-background min-h-[75vh] pb-20 font-sans animate-pulse">
      {/* Search Header Banner Skeleton */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-3 w-12 bg-gray-200 rounded-xs" />
            <span className="text-gray-300">/</span>
            <div className="h-3 w-16 bg-gray-200 rounded-xs" />
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-2.5 h-8 bg-saffron rounded-xs" />
            <div className="h-9 w-64 sm:w-80 bg-gray-200 rounded-xs" />
          </div>
          <div className="h-3.5 w-72 bg-gray-100 rounded-xs" />
        </div>
      </section>

      {/* Results Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 bg-white border border-gray-200 rounded-xs px-4 sm:px-6 py-2 divide-y md:divide-y-0 divide-gray-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 bg-saffron/20 rounded-xs" />
                <div className="h-4.5 w-11/12 bg-gray-200 rounded-xs" />
                <div className="h-3 w-full bg-gray-100 rounded-xs" />
                <div className="h-2.5 w-32 bg-gray-100 rounded-xs" />
              </div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-navy/15 rounded-xs shrink-0" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
