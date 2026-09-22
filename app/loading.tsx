export default function HomeLoading() {
  return (
    <div className="w-full bg-background pb-14 animate-pulse">
      {/* 1. Ticker Strip Skeleton */}
      <div className="bg-white border-b border-gray-200 h-10 flex items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="h-5 w-20 bg-saffron/30 rounded-xs shrink-0" />
        <div className="ml-4 h-3.5 w-72 sm:w-96 bg-gray-200 rounded-xs" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 space-y-8">
        {/* 2. Hero Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Hero Card */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-xs border border-gray-200 p-5 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Category Badge skeleton */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-16 bg-navy/10 rounded-xs" />
                <div className="h-4 w-24 bg-saffron/20 rounded-xs" />
              </div>

              {/* Headline skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-7 sm:h-8 w-11/12 bg-gray-200 rounded-xs" />
                <div className="h-7 sm:h-8 w-3/4 bg-gray-200 rounded-xs" />
              </div>

              {/* Text + Image Split */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="flex-1 space-y-2.5 w-full">
                  <div className="h-3.5 w-full bg-gray-100 rounded-xs" />
                  <div className="h-3.5 w-full bg-gray-100 rounded-xs" />
                  <div className="h-3.5 w-4/5 bg-gray-100 rounded-xs" />
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="h-3 w-28 bg-gray-200 rounded-xs" />
                    <div className="h-3 w-20 bg-gray-100 rounded-xs" />
                  </div>
                </div>

                <div className="w-full sm:w-56 md:w-64 shrink-0 aspect-16/10 bg-navy/15 rounded-xs" />
              </div>
            </div>
          </div>

          {/* Side Feed Skeleton */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xs border border-gray-200 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="pb-2 border-b-2 border-navy flex items-center justify-between">
              <div className="h-4 w-24 bg-navy/20 rounded-xs" />
              <div className="h-3 w-16 bg-gray-200 rounded-xs" />
            </div>

            <div className="divide-y divide-gray-200 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-14 bg-gray-200 rounded-xs" />
                    <div className="h-4 w-full bg-gray-200 rounded-xs" />
                    <div className="h-3 w-4/5 bg-gray-100 rounded-xs" />
                    <div className="h-2.5 w-24 bg-gray-100 rounded-xs" />
                  </div>
                  <div className="w-20 h-20 bg-navy/15 rounded-xs shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Section Skeletons */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b-2 border-navy">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-saffron rounded-xs" />
              <div className="h-5 w-32 bg-gray-200 rounded-xs" />
            </div>
            <div className="h-3.5 w-20 bg-gray-200 rounded-xs" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 bg-white border border-gray-200 rounded-xs p-4 divide-y md:divide-y-0 divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-3 flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 bg-saffron/20 rounded-xs" />
                  <div className="h-4 w-11/12 bg-gray-200 rounded-xs" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded-xs" />
                  <div className="h-2.5 w-28 bg-gray-100 rounded-xs" />
                </div>
                <div className="w-20 h-20 bg-navy/15 rounded-xs shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
