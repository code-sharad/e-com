"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import SearchBar from "@/components/search-bar"
import { Search } from "lucide-react"
import { FirebaseProductsService, type Product } from "@/lib/firebase/products"

interface DisplayProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [allProducts, setAllProducts] = useState<DisplayProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Load all products on component mount
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const { products } = await FirebaseProductsService.getProducts()
        const displayProducts = products.map(product => ({
          id: product.id || '',
          name: product.name,
          price: product.price,
          image: product.images[0] || '/placeholder.svg',
          category: product.category,
          description: product.description
        }))
        setAllProducts(displayProducts)
        setFilteredProducts(displayProducts)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAllProducts()
  }, [])

  useEffect(() => {
    const query = searchParams.get("q") || ""
    setSearchQuery(query)
    filterProducts(query)
  }, [searchParams, allProducts])

  const filterProducts = (query: string) => {
    if (!query.trim()) {
      setFilteredProducts(allProducts)
      return
    }

    const filtered = allProducts.filter((product) => {
      const searchTerm = query.toLowerCase()
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
      )
    })

    setFilteredProducts(filtered)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterProducts(query)
    
    // Update URL without page reload
    const newUrl = query ? `/search?q=${encodeURIComponent(query)}` : "/search"
    window.history.pushState({}, "", newUrl)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Search Products
              </h1>
              <div className="max-w-md mx-auto">
                <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Search Products"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {searchQuery
                ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`
                : "Discover our complete collection of handcrafted items"}
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
            </div>
          </div>

          {/* Results */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search terms.`
                  : "Start searching to discover our amazing products."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="text-gold-500 hover:text-gold-600 font-medium"
                >
                  View all products
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </div>
        <Footer />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
