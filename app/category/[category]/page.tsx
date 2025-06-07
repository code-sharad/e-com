import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CategoryContent from "@/components/category-content"
import { FirebaseProductsService } from "@/lib/firebase/products"

// Add generateStaticParams for static export
export async function generateStaticParams() {
  // Return the known categories for static generation
  return [
    { category: 'jewelry' },
    { category: 'photo-frames' },
    { category: 'resin-art' }
  ]
}

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

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params

  if (!categoryTitles[category as keyof typeof categoryTitles]) {
    notFound()
  }

  // Fetch products from Firebase
  const firebaseProducts = await FirebaseProductsService.getProductsByCategory(category)
  
  // Transform Firebase products to match CategoryContent interface
  const allProducts = firebaseProducts.map(product => ({
    id: product.id || '',
    name: product.name,
    price: product.price,
    image: product.images[0] || '/placeholder.svg',
    category: product.category
  }))
  
  const title = categoryTitles[category as keyof typeof categoryTitles]
  const description = categoryDescriptions[category as keyof typeof categoryDescriptions]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CategoryContent allProducts={allProducts} title={title} description={description} />
      <Footer />
    </div>
  )
}
