"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, ArrowLeft, Plus, Minus, Loader2 } from "lucide-react"
import { ProductService, type Product } from "@/lib/firebase/products"
import { ImageUpload } from "@/components/firebase/image-upload"

interface AdminEditClientProps {
  id: string
}

export default function AdminEditClient({ id }: AdminEditClientProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([""])
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    comparePrice: "",
    stockQuantity: "",
    sku: "",
    weight: "",
    material: "",
    careInstructions: "",
    featured: false,
    inStock: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load product data on mount
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true)
        const productData = await ProductService.getProduct(id)
        
        if (!productData) {
          router.push("/admin/products")
          return
        }

        setProduct(productData)
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          category: productData.category || "",
          price: productData.price?.toString() || "",
          comparePrice: productData.comparePrice?.toString() || "",
          stockQuantity: productData.stockQuantity?.toString() || "",
          sku: productData.sku || "",
          weight: productData.weight || "",
          material: productData.material || "",
          careInstructions: Array.isArray(productData.careInstructions) 
            ? productData.careInstructions.join("\n") 
            : productData.careInstructions || "",
          featured: productData.featured || false,
          inStock: productData.inStock !== false,
        })

        setImages(productData.images || [])
        setFeatures(productData.features && productData.features.length > 0 ? productData.features : [""])
        
        // Convert specifications object to array format
        const specsArray = productData.specifications 
          ? Object.entries(productData.specifications).map(([key, value]) => ({ key, value: String(value) }))
          : [{ key: "", value: "" }]
        setSpecifications(specsArray.length > 0 ? specsArray : [{ key: "", value: "" }])

      } catch (error) {
        console.error("Error loading product:", error)
        alert("Failed to load product data")
        router.push("/admin/products")
      } finally {
        setIsLoadingProduct(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id, router])

  if (!user?.isAdmin) {
    router.push("/")
    return null
  }

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Button asChild className="mt-4">
            <Link href="/admin/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }))
    }
  }

  const addFeature = () => {
    setFeatures((prev) => [...prev, ""])
  }

  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, value: string) => {
    setFeatures((prev) => prev.map((feature, i) => (i === index ? value : feature)))
  }

  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }])
  }

  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    setSpecifications((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required"
    }
    if (!formData.stockQuantity || isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = "Valid stock quantity is required"
    }

    // Image validation
    if (images.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {      // Prepare features and specifications
      const validFeatures = features.filter((feature) => feature.trim() !== "");
      const validSpecifications = specifications
        .filter((spec) => spec.key.trim() !== "" && spec.value.trim() !== "")
        .reduce((acc, spec) => ({ ...acc, [spec.key]: spec.value }), {});
      
      // Convert careInstructions string back to array if it contains newlines
      const careInstructionsArray = formData.careInstructions
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== "");const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        inStock: formData.inStock && Number(formData.stockQuantity) > 0,
        featured: formData.featured,
        images,
      }

      // Only add optional fields if they have values (avoid undefined)
      if (formData.comparePrice && !isNaN(Number(formData.comparePrice))) {
        productData.comparePrice = Number(formData.comparePrice)
      }
      if (formData.sku.trim()) {
        productData.sku = formData.sku.trim()
      }
      if (formData.weight.trim()) {
        productData.weight = formData.weight.trim()
      }
      if (formData.material.trim()) {
        productData.material = formData.material.trim()
      }
      if (careInstructionsArray.length > 0) {
        productData.careInstructions = careInstructionsArray
      }
      if (validFeatures.length > 0) {
        productData.features = validFeatures
      }
      if (Object.keys(validSpecifications).length > 0) {
        productData.specifications = validSpecifications
      }

      await ProductService.updateProduct(id, productData)
      
      alert("Product updated successfully!")
      router.push("/admin/products")
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <Link href="/admin/products">
                <Button variant="ghost" size="sm" className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Edit Product</h1>
            </div>
            <p className="text-muted-foreground">Update product information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="photo-frames">Photo Frames</SelectItem>
                    <SelectItem value="resin-art">Resin Art</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* SKU */}
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Product SKU"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price */}
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>              {/* Compare Price */}
              <div>
                <Label htmlFor="comparePrice">Compare Price (₹)</Label>
                <Input
                  id="comparePrice"
                  name="comparePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.comparePrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={errors.stockQuantity ? "border-red-500" : ""}
                />
                {errors.stockQuantity && <p className="text-red-500 text-sm mt-1">{errors.stockQuantity}</p>}
              </div>
            </div>

            {/* Status Checkboxes */}
            <div className="flex gap-6 mt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  name="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked as boolean }))}
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked as boolean }))}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Product Images</h2>
            <ImageUpload
              onImagesChange={setImages}
              initialImages={images}
              maxImages={5}
              folder="products"
            />
            {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
          </div>

          {/* Physical Properties */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Physical Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Weight */}
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 100g"
                />
              </div>

              {/* Material */}
              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  placeholder="e.g., Silver, Gold, Resin"
                />
              </div>
            </div>

            {/* Care Instructions */}
            <div className="mt-6">
              <Label htmlFor="careInstructions">Care Instructions</Label>
              <Textarea
                id="careInstructions"
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleInputChange}
                placeholder="Enter care instructions (one per line)"
                className="min-h-[80px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter each instruction on a new line
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1"
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, "key", e.target.value)}
                    placeholder="Specification name"
                    className="flex-1"
                  />
                  <Input
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, "value", e.target.value)}
                    placeholder="Specification value"
                    className="flex-1"
                  />
                  {specifications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSpecification(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSpecification}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Specification
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
