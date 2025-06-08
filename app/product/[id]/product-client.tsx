"use client"

import React, { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Check, Heart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useCart } from '@/components/cart-provider'
import { Product } from '@/types/product'
import { Badge } from '@/components/ui/badge'

interface ProductClientProps {
  id: string
}

export default function ProductClient({ id }: ProductClientProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { dispatch } = useCart()

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === product.images!.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images!.length - 1 : prev - 1
      )
    }
  }
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return notFound()
        
        const docRef = doc(db, 'products', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product)
        } else {
          notFound()
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!product?.images || product.images.length <= 1) return
      
      if (event.key === 'ArrowLeft') {
        prevImage()
      } else if (event.key === 'ArrowRight') {
        nextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product?.images])

  const handleAddToCart = () => {
    if (!product) return
    
    const item = {
      id: product.id!,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.jpg',
      category: product.category || 'Uncategorized',
    }
    
    dispatch({ type: 'ADD_ITEM', payload: item })
    setAdded(true)
    
    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-[500px]"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return notFound()

  return (
    <div className="container mx-auto py-6">
      <Link href="/" className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Gallery */}
        <div className="space-y-4">          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
            {product.images && product.images.length > 0 ? (
              <Image 
                src={product.images[selectedImageIndex]} 
                alt={`${product.name} - Image ${selectedImageIndex + 1}`} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <Image 
                src="/placeholder.jpg" 
                alt={product.name} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            
            {/* Navigation Arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-gold-500 ring-2 ring-gold-200' 
                      : 'border-gray-200 hover:border-gold-300'
                  }`}
                >
                  <Image 
                    src={image} 
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Image Counter */}
          {product.images && product.images.length > 1 && (
            <div className="text-center text-sm text-muted-foreground">
              {selectedImageIndex + 1} of {product.images.length}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-gold-500">₹{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          {product.category && (
            <Badge variant="outline" className="text-xs px-2 py-1">
              {product.category}
            </Badge>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size 
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-950 text-gold-600 dark:text-gold-300' 
                        : 'border-border hover:border-gold-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">Quantity</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setQuantity(q => q + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAddToCart} 
              className="flex-1 bg-gold-500 hover:bg-gold-600 text-black"
              disabled={added}
            >
              {added ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </>
              )}
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-t border-border pt-4 mt-8">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.material && (
                <>
                  <div className="text-muted-foreground">Material</div>
                  <div>{product.material}</div>
                </>
              )}
              {product.weight && (
                <>
                  <div className="text-muted-foreground">Weight</div>
                  <div>{product.weight}</div>
                </>
              )}
              {product.dimensions && (
                <>
                  <div className="text-muted-foreground">Dimensions</div>
                  <div>{product.dimensions}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}