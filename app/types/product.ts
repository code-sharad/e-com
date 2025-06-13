export interface Product {
  id: string
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
  averageRating: number
  totalReviews: number
  ratings: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
} 
