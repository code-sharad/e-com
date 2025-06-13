import { notFound } from "next/navigation"
import Navbar from "@/components/common/navbar"
import Footer from "@/components/common/footer"
import CategoryContent from "@/components/category/category-content"
import { ProductService } from "@/lib/firebase/products"
import { Suspense } from "react"
import { preloadFirebase } from "@/lib/firebase"

// Generate static params for static export
export async function generateStaticParams() {
  // Return empty array for static export - pages will be generated on demand
  return []
}

// Preload Firebase modules
preloadFirebase()

const categoryTitles = {
  jewelry: "Jewelry Collection",
  "photo-frames": "Photo Frames",
  "resin-art": "Resin Art",
}

const categoryDescriptions = {
  jewelry:
    "Discover our exquisite collection of handcrafted jewelry pieces, each designed to celebrate your unique style and elegance.",
  "photo-frames":
    "Preserve your precious memories in our beautifully crafted photo frames, designed to complement any space.",
  "resin-art":
    "Explore our contemporary resin art collection, where creativity meets craftsmanship in stunning visual displays.",
}

// Loading component
function CategoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

// Product list component with proper typing
async function ProductList({ category, title, description }: { category: string, title: string, description: string }) {
  const firebaseProducts = await ProductService.getProductsByCategory(category)
  
  // Transform Firebase products to match CategoryContent interface
  const allProducts = firebaseProducts.map(product => ({
    id: product.id || '',
    name: product.name,
    price: product.price,
    image: product.images?.[0] || '/placeholder.svg',
    category: product.category
  }))

  return <CategoryContent allProducts={allProducts} title={title} description={description} />
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params

  if (!categoryTitles[category as keyof typeof categoryTitles]) {
    notFound()
  }

  const title = categoryTitles[category as keyof typeof categoryTitles]
  const description = categoryDescriptions[category as keyof typeof categoryDescriptions]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<CategoryLoading />}>
        <ProductList category={category} title={title} description={description} />
      </Suspense>
      <Footer />
    </div>
  )
}
