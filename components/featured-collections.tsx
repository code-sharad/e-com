"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import { FirebaseProductsService, type Product } from "@/lib/firebase/products"

interface DisplayProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
}

export default function FeaturedCollections() {
  const [featuredProducts, setFeaturedProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showingRecent, setShowingRecent] = useState(false)

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        // First try to get featured products
        let products = await FirebaseProductsService.getFeaturedProducts(4)
        let isShowingRecent = false
        
        // If no featured products, get recent products instead
        if (products.length === 0) {
          console.log('No featured products found, showing recent products instead')
          const { products: allProducts } = await FirebaseProductsService.getProducts({ limit: 4 })
          products = allProducts
          isShowingRecent = true
        }
        
        const displayProducts = products.map(product => ({
          id: product.id || '',
          name: product.name,
          price: product.price,
          image: product.images[0] || '/placeholder.svg',
          category: product.category
        }))
        
        setFeaturedProducts(displayProducts)
        setShowingRecent(isShowingRecent)
      } catch (error) {
        console.error("Error loading featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [])
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {showingRecent ? "Latest Collections" : "Featured Collections"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {showingRecent 
              ? "Explore our newest arrivals, featuring the latest designs and exceptional craftsmanship."
              : "Discover our most coveted pieces, carefully curated for those who appreciate exceptional craftsmanship and timeless beauty."
            }
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/category/jewelry">
            <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8 py-3">
              View All Collections
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
