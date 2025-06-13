export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-4 px-4">
        {/* Breadcrumb */}
        <div className="animate-pulse flex items-center gap-2 mb-4">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <span>/</span>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <span>/</span>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column - Images */}
            <div className="lg:col-span-5 p-4 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="grid grid-cols-6 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Information */}
            <div className="lg:col-span-7 p-4 lg:p-8 space-y-6">
              <div className="space-y-4">
                {/* Title and Rating */}
                <div className="space-y-2">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>

                {/* Size Selection */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex gap-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-4">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="space-y-1">
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="space-y-4 pt-4">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 