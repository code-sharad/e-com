"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description?: string
}

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { dispatch } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAdding(true)

    // Add to cart
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: 1
      },
    })

    // Show feedback
    setTimeout(() => {
      setIsAdding(false)
      setJustAdded(true)

      // Reset feedback after 2 seconds
      setTimeout(() => {
        setJustAdded(false)
      }, 2000)
    }, 300)
  }

  return (
    <div
      className={`group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageError ? "/placeholder.svg" : (product.image || "/placeholder.svg")}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Wishlist button */}
          <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-gold-500 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mb-3 capitalize">{product.category.replace("-", " ")}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gold-500">₹{product.price.toLocaleString()}</span>

          <Button
            onClick={handleAddToCart}
            size="sm"
            className={`font-medium transition-all duration-300 ${
              justAdded ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gold-500 hover:bg-gold-600 text-black"
            }`}
            disabled={isAdding}
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
            ) : justAdded ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-1" />
            )}
            {isAdding ? "Adding..." : justAdded ? "Added!" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  )
}

