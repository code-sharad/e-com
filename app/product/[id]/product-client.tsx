"use client"

import React, { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { ShoppingCart, Check, Heart, ChevronLeft, Package, Info, Tag, Send, Settings, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCart } from '@/components/cart/cart-provider'
import { Product } from '@/types/product'
import { getFirestore } from '@/lib/firebase'
import { ProductImages } from '@/components/product/product-images'
import { ReviewsList } from '@/components/product/reviews-list'
import { cn } from '@/lib/utils/common'
import { ProductService } from '@/lib/firebase/products'
import { toast } from 'sonner'
import Image from 'next/image'

interface ProductClientProps {
  id: string
  initialData?: Product | null
}

interface FirebaseProduct {
  name: string
  description: string
  price: number
  category: string
  featured: boolean
  comparePrice?: number
  images?: string[]
  sizes?: string[]
  stockQuantity?: number
  sku?: string
  weight?: string
  dimensions?: string
  material?: string
  careInstructions?: string
  features?: string[]
  specifications?: Record<string, string>
  averageRating?: number
  totalReviews?: number
  ratings?: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export default function ProductClient({ id, initialData }: ProductClientProps) {
  const router = useRouter()
  const { dispatch } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [product, setProduct] = useState<Product | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [isWishlist, setIsWishlist] = useState(false)

  useEffect(() => {
    if (!initialData) {
      const loadProduct = async () => {
        try {
          setLoading(true)
          const data = await ProductService.getProduct(id)
          if (data) {
            setProduct(data)
          } else {
            setProduct(null)
          }
        } catch (error) {
          console.error('Error loading product:', error)
          toast.error('Failed to load product details', { description: 'Please try again later' })
          setProduct(null)
        } finally {
          setLoading(false)
        }
      }
      loadProduct()
    }
  }, [id, initialData])

  const handleAddToCart = () => {
    if (!product) return
    
    try {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl,
          category: product.category,
          quantity
        }
      })
      toast.success(`${product.name} has been added to your cart.`)
    } catch (error) {
      toast.error('Failed to add item to cart. Please try again.')
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (product?.stockQuantity && newQuantity > 0 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity)
    }
  }

  // Share functionality
  const handleShare = async () => {
    if (!product) return

    const shareData = {
      title: product.name,
      text: `Check out this amazing ${product.category}: ${product.name}`,
      url: window.location.href,
    }

    // Check if native sharing is supported
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Product shared successfully!')
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback to copying link
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast.success('Product link copied to clipboard!')
      })
      .catch(() => {
        toast.error('Failed to copy link')
      })
  }

  const handleShareFacebook = () => {
    if (!product) return
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out this amazing ${product.category}: ${product.name}`)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank')
  }

  const handleShareTwitter = () => {
    if (!product) return
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out this amazing ${product.category}: ${product.name}`)
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
  }

  const handleShareWhatsApp = () => {
    if (!product) return
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out this amazing ${product.category}: ${product.name} - ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="animate-pulse max-w-6xl mx-auto space-y-8">
          <div className="h-6 w-32 bg-gray-800 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-800 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-800 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 w-3/4 bg-gray-800 rounded"></div>
              <div className="h-6 w-24 bg-gray-800 rounded"></div>
              <div className="h-10 w-32 bg-gray-800 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-800 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return <div>Loading...</div>
  }

  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Back Navigation */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <ProductImages images={product.images || []} name={product.name} />

          {/* Right Column - Content */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold flex-1">{product.name}</h1>
              
              {/* Quick Share Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#C4A484] hover:bg-[#C4A484]/10 p-2"
                    title="Share this product"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                  <DropdownMenuItem onClick={handleShare} className="text-white hover:bg-gray-800">
                    <Send className="mr-2 h-4 w-4" />
                    Share Product
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink} className="text-white hover:bg-gray-800">
                    <Tag className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareFacebook} className="text-white hover:bg-gray-800">
                    <Heart className="mr-2 h-4 w-4" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareTwitter} className="text-white hover:bg-gray-800">
                    <Info className="mr-2 h-4 w-4" />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareWhatsApp} className="text-white hover:bg-gray-800">
                    <Package className="mr-2 h-4 w-4" />
                    Share on WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.comparePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-green-500 font-medium">
                    {discount}% off
                  </span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={product.stockQuantity ? quantity >= product.stockQuantity : false}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-[#C4A484] hover:bg-[#B39479] text-black"
                onClick={handleAddToCart}
              >
                {product.inStock ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                ) : (
                  <>
                    Out of Stock
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "border-[#C4A484] text-[#C4A484]",
                  isWishlist && "bg-[#C4A484] text-black"
                )}
                onClick={() => setIsWishlist(!isWishlist)}
              >
                <Heart className="h-4 w-4" />
              </Button>
              
              {/* Share Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-[#C4A484] text-[#C4A484] hover:bg-[#C4A484] hover:text-black"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                  <DropdownMenuItem onClick={handleShare} className="text-white hover:bg-gray-800">
                    <Send className="mr-2 h-4 w-4" />
                    Share Product
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink} className="text-white hover:bg-gray-800">
                    <Tag className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareFacebook} className="text-white hover:bg-gray-800">
                    <Heart className="mr-2 h-4 w-4" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareTwitter} className="text-white hover:bg-gray-800">
                    <Info className="mr-2 h-4 w-4" />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareWhatsApp} className="text-white hover:bg-gray-800">
                    <Package className="mr-2 h-4 w-4" />
                    Share on WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Product Description */}
            <div className="prose prose-invert max-w-none">
              <p>{product.description}</p>
            </div>

            {/* Physical Properties */}
            {(product.weight || product.dimensions || product.material || product.sku) && (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-[#C4A484] mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Physical Properties
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.weight && (
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-[#C4A484] flex-shrink-0" />
                      <div>
                        <span className="text-gray-400 text-sm">Weight</span>
                        <p className="text-white font-medium">{product.weight}</p>
                      </div>
                    </div>
                  )}
                  
                  {product.dimensions && (
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-[#C4A484] flex-shrink-0" />
                      <div>
                        <span className="text-gray-400 text-sm">Dimensions</span>
                        <p className="text-white font-medium">
                          {typeof product.dimensions === 'object' && product.dimensions.length 
                            ? `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height}`
                            : typeof product.dimensions === 'string' 
                            ? product.dimensions 
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {product.material && (
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-[#C4A484] flex-shrink-0" />
                      <div>
                        <span className="text-gray-400 text-sm">Material</span>
                        <p className="text-white font-medium">{product.material}</p>
                      </div>
                    </div>
                  )}
                  
                  {product.sku && (
                    <div className="flex items-center gap-3">
                      <Tag className="h-4 w-4 text-[#C4A484] flex-shrink-0" />
                      <div>
                        <span className="text-gray-400 text-sm">SKU</span>
                        <p className="text-white font-medium">{product.sku}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-[#C4A484] mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Key Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#C4A484] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-[#C4A484] mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Specifications
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
                      <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Care Instructions */}
            {product.careInstructions && product.careInstructions.length > 0 && (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-[#C4A484] mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Care Instructions
                </h3>
                <ul className="space-y-2">
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-[#C4A484] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <ReviewsList productId={id} />
        </div>
      </div>
    </div>
  )
}