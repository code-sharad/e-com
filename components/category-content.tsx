"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import SearchBar from "@/components/search-bar"
import { SearchFilterBar } from "@/components/search-filter-bar"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
}

interface CategoryContentProps {
  allProducts: Product[]
  title: string
  description: string
}

export default function CategoryContent({ allProducts, title, description }: CategoryContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [products, setProducts] = useState(allProducts)

  useEffect(() => {
    let filteredProducts = [...allProducts]

    // Apply search filter
    if (searchQuery) {
      filteredProducts = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply price range filter
    if (minPrice) {
      filteredProducts = filteredProducts.filter((product) => product.price >= Number.parseFloat(minPrice))
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter((product) => product.price <= Number.parseFloat(maxPrice))
    }

    // Apply sorting
    if (sortBy === "priceAsc") {
      filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sortBy === "priceDesc") {
      filteredProducts.sort((a, b) => b.price - a.price)
    } else if (sortBy === "nameAsc") {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "nameDesc") {
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name))
    }

    setProducts(filteredProducts)
  }, [searchQuery, minPrice, maxPrice, sortBy, allProducts])

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <main className="pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{description}</p>

          {/* Category Search */}
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} placeholder={`Search ${title.toLowerCase()}...`} />
          </div>
        </div>

        {/* Filters and Sort */}
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          sortBy={sortBy}
          handleSortChange={handleSortChange}
          totalProducts={products.length}
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* No products found */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
