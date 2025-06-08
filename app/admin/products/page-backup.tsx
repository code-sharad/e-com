// Component memoized for performance (16.26KB)
import React from "react"
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, Filter } from "lucide-react"
import { SimpleDropdown } from "@/components/simple-dropdown"
import { FirebaseProductsService, type Product } from "@/lib/firebase/products"

export default function AdminProductsPageWithFallback() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [isLoading, setIsLoading] = useState(false)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const { products: allProducts } = await FirebaseProductsService.getProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus && selectedStatus !== "all") {
      if (selectedStatus === "out-of-stock") {
        filtered = filtered.filter((product) => product.stockQuantity === 0)
      } else if (selectedStatus === "low-stock") {
        filtered = filtered.filter((product) => product.stockQuantity > 0 && product.stockQuantity < 10)
      } else if (selectedStatus === "active") {
        filtered = filtered.filter((product) => product.inStock)
      } else if (selectedStatus === "inactive") {
        filtered = filtered.filter((product) => !product.inStock)
      }
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter((product) => product.price >= Number.parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter((product) => product.price <= Number.parseFloat(priceRange.max))
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, selectedStatus, priceRange])

  // Load products on mount
  useEffect(() => {
    if (!user?.isAdmin) {
      router.push("/")
      return
    }
    loadProducts()
  }, [user, router, loadProducts])

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters()
  }, [products, applyFilters])

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      try {
        await FirebaseProductsService.deleteProduct(productId)
        loadProducts() // Refresh the list
        alert("Product deleted successfully!")
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("An error occurred while deleting the product.")
      }
    }
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/products/edit/${productId}`)
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setPriceRange({ min: "", max: "" })
  }

  const getStatusBadge = (inStock: boolean, stockQuantity: number) => {
    if (stockQuantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (stockQuantity < 10) {
      return <Badge variant="secondary">Low Stock</Badge>
    }
    if (!inStock) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Active
      </Badge>
    )
  }

  const stats = {
    total: products.length,
    active: products.filter((p) => p.inStock).length,
    outOfStock: products.filter((p) => p.stockQuantity === 0).length,
    lowStock: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity < 10).length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-gold-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gold-500 hover:text-gold-600">
                ← Back to Dashboard
              </Link>
              <h1 className="font-serif text-2xl font-bold text-foreground">Manage Products</h1>
            </div>
            <Link href="/admin/products/new">
              <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-gold-500" />
            </div>
          </div>

          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-foreground">{stats.outOfStock}</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-foreground">{stats.lowStock}</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="jewelry">Jewelry</SelectItem>
                <SelectItem value="photo-frames">Photo Frames</SelectItem>
                <SelectItem value="resin-art">Resin Art</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Input
              placeholder="Min Price"
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
            />

            <Input
              placeholder="Max Price"
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
            />
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price / MRP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Image
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            width={48}
                            height={48}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{product.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize text-sm text-foreground">{product.category.replace("-", " ")}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-foreground">₹{product.price.toLocaleString()}</div>
                          {product.originalPrice && (
                            <div className="text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground">{product.stockQuantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.inStock, product.stockQuantity)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <SimpleDropdown
                          onView={() => product.id && handleViewProduct(product.id)}
                          onEdit={() => product.id && handleEditProduct(product.id)}
                          onDelete={() => product.id && handleDeleteProduct(product.id, product.name)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all" || selectedStatus !== "all" || priceRange.min || priceRange.max
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first product"}
            </p>
            <div className="flex justify-center space-x-4">
              {(searchQuery ||
                selectedCategory !== "all" ||
                selectedStatus !== "all" ||
                priceRange.min ||
                priceRange.max) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <Link href="/admin/products/new">
                <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
