"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, ArrowLeft, Plus, Minus } from "lucide-react"
import { FirebaseProductsService } from "@/lib/firebase/products"
import { ImageUpload } from "@/components/image-upload"

export default function NewProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([""])
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    mrp: "",
    stock: "",
    sku: "",
    weight: "",
    dimensions: "",
    material: "",
    care: "",
    status: "active" as const,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!user?.isAdmin) {
    router.push("/")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

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
    if (!formData.price || Number.parseFloat(formData.price) <= 0) newErrors.price = "Valid selling price is required"
    if (!formData.mrp || Number.parseFloat(formData.mrp) <= 0) newErrors.mrp = "Valid MRP is required"
    if (!formData.stock || Number.parseInt(formData.stock) < 0) newErrors.stock = "Valid stock quantity is required"

    // Price validation
    if (formData.price && formData.mrp && Number.parseFloat(formData.price) > Number.parseFloat(formData.mrp)) {
      newErrors.price = "Selling price cannot be higher than MRP"
    }

    // Images validation
    if (images.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert("Please fix the errors in the form before submitting.")
      return
    }

    setIsLoading(true)

    try {
      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: Number.parseFloat(formData.price),
        originalPrice: Number.parseFloat(formData.mrp),
        stockQuantity: Number.parseInt(formData.stock),
        inStock: formData.status === "active",
        images: images,
        tags: features.filter((f) => f.trim() !== ""),
        specifications: specifications.reduce(
          (acc, spec) => {
            if (spec.key.trim() && spec.value.trim()) {
              acc[spec.key.trim()] = spec.value.trim()
            }
            return acc
          },
          {} as Record<string, string>,
        ),
        featured: false,
      }

      // Save product
      const productId = await FirebaseProductsService.createProduct(productData)

      // Show success message
      alert(`Product "${productData.name}" has been added successfully!`)

      // Redirect to products list
      router.push("/admin/products")
    } catch (error) {
      console.error("Error adding product:", error)
      alert("An error occurred while adding the product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-gold-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/products" className="text-gold-500 hover:text-gold-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-serif text-2xl font-bold text-foreground">Add New Product</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

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
          <div className="bg-card rounded-lg p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Pricing & Inventory</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="mrp">MRP (₹) *</Label>
                <Input
                  id="mrp"
                  name="mrp"
                  type="number"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={errors.mrp ? "border-red-500" : ""}
                />
                {errors.mrp && <p className="text-red-500 text-sm mt-1">{errors.mrp}</p>}
              </div>

              <div>
                <Label htmlFor="price">Selling Price (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={errors.stock ? "border-red-500" : ""}
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Product Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 15 grams"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 x 1.5 inches"
                />
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  placeholder="e.g., Sterling Silver, Diamonds"
                />
              </div>

              <div>
                <Label htmlFor="care">Care Instructions</Label>
                <Input
                  id="care"
                  name="care"
                  value={formData.care}
                  onChange={handleInputChange}
                  placeholder="e.g., Store in jewelry box"
                />
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Key Features</h2>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Enter a key feature"
                    className="flex-1"
                  />
                  {features.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addFeature} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Specifications</h2>

            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center space-x-2">
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
                    <Button type="button" variant="outline" size="sm" onClick={() => removeSpecification(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSpecification} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Specification
              </Button>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Product Images *</h2>

            <ImageUpload initialImages={images} onImagesChange={setImages} maxImages={8} />

            {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/admin/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Product
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
