"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, MoreHorizontal, Package, Filter } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductService, type Product } from "@/lib/firebase/products"

export default function AdminProductsClient() {
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
      const { products: allProducts } = await ProductService.getProducts()
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
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((product) => {
        if (selectedStatus === "in-stock") return product.stockQuantity > 0
        if (selectedStatus === "low-stock") return product.stockQuantity > 0 && product.stockQuantity <= 5
        if (selectedStatus === "out-of-stock") return product.stockQuantity === 0
        return true
      })
    }

    // Price range filter
    if (priceRange.min !== "") {
      filtered = filtered.filter((product) => product.price >= Number(priceRange.min))
    }
    if (priceRange.max !== "") {
      filtered = filtered.filter((product) => product.price <= Number(priceRange.max))
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, selectedStatus, priceRange])

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setPriceRange({ min: "", max: "" })
  }
  const handleDeleteProduct = async (productId: string) => {
    console.log('Attempting to delete product with ID:', productId)
    
    if (!productId) {
      alert("Product ID is missing. Cannot delete product.")
      return
    }
    
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      console.log('Calling ProductService.deleteProduct with ID:', productId)
      await ProductService.deleteProduct(productId)
      console.log('Product deleted successfully, reloading products...')
      
      // Show success message
      alert("Product deleted successfully!")
      
      // Reload products after deletion
      await loadProducts() 
    } catch (error) {
      console.error("Error deleting product:", error)
      alert(`Failed to delete product. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Load products on mount
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters()
  }, [products, searchQuery, selectedCategory, selectedStatus, priceRange, applyFilters])

  // If not authenticated, show nothing (handled by parent layout)
  if (!user) {
    return null
  }

  const productsToDisplay = filteredProducts.length > 0 ? filteredProducts : products

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg p-4 mb-8 border border-border">
        <div className="flex items-center mb-4">
          <Filter className="mr-2 h-5 w-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
              <SelectItem value="photo-frames">Photo Frames</SelectItem>
              <SelectItem value="resin-art">Resin Art</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock (≤ 5)</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Price Range */}
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min ₹"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-1/2"
            />
            <Input
              type="number"
              placeholder="Max ₹"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-1/2"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={resetFilters} className="mr-2">
            Reset
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                      <p>Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : productsToDisplay.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No products found</p>
                    {Object.values(priceRange).some(Boolean) ||
                    selectedCategory !== "all" ||
                    selectedStatus !== "all" ||
                    searchQuery ? (
                      <Button variant="link" onClick={resetFilters} className="mt-2">
                        Clear filters
                      </Button>
                    ) : (
                      <Button asChild variant="link" className="mt-2">
                        <Link href="/admin/products/new">Add your first product</Link>
                      </Button>
                    )}                  </td>
                </tr>
              ) : (
                productsToDisplay.map((product) => (
                  <tr key={product.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 relative rounded overflow-hidden mr-3 bg-background">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3">₹{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">{product.stockQuantity}</td>
                    <td className="px-4 py-3">
                      {product.stockQuantity > 5 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
                      ) : product.stockQuantity > 0 ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/product/${product.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                console.log('Delete clicked for product:', product.id, product.name)
                                if (product.id) {
                                  handleDeleteProduct(product.id)
                                } else {
                                  alert("Product ID is missing. Cannot delete product.")
                                }
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

