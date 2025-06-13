// Component memoized for performance (6.98KB)
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
  Timestamp,
  type OrderByDirection,
} from "firebase/firestore"
import { getFirestore } from "@/lib/firebase"
import { type Product } from '@/types/product'
export type { Product }

interface FirebaseProduct {
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stockQuantity: number
  inStock: boolean
  featured: boolean
  comparePrice?: number
  sizes?: string[]
  sku?: string
  weight?: string
  dimensions?: {
    length: number
    width: number
    height: number
  }
  material?: string
  careInstructions?: string[]
  features?: string[]
  specifications?: Record<string, string>
  averageRating?: number
  totalReviews?: number
  ratings?: {
    [key: string]: number
  }
  createdAt?: Date
  updatedAt?: Date
}

export class ProductService {
  private static COLLECTION_NAME = "products"

  // Helper function to add timeout to Firebase operations
  private static withTimeout<T>(promise: Promise<T>, timeoutMs: number = 20000): Promise<T> {
    // Use shorter timeout during build time
    const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
    const adjustedTimeout = isBuildTime ? Math.min(timeoutMs, 15000) : timeoutMs
    
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${adjustedTimeout}ms`)), adjustedTimeout)
      )
    ])
  }

  private static transformProduct(docId: string, data: FirebaseProduct): Product {
    return {
      id: docId,
      ...data,
      imageUrl: data.images[0] || '/placeholder.jpg',
    }
  }

  // Helper function to serialize Firestore data for client components
  private static serializeProduct(data: any): Product {
    const serialized = { ...data }
    
    // Convert Timestamp objects to plain Date objects or ISO strings
    if (serialized.createdAt && typeof serialized.createdAt.toDate === 'function') {
      serialized.createdAt = serialized.createdAt.toDate().toISOString()
    }
    if (serialized.updatedAt && typeof serialized.updatedAt.toDate === 'function') {
      serialized.updatedAt = serialized.updatedAt.toDate().toISOString()
    }
    
    // Ensure all nested objects are plain objects
    if (serialized.dimensions && typeof serialized.dimensions === 'object') {
      serialized.dimensions = { ...serialized.dimensions }
    }
    if (serialized.ratings && typeof serialized.ratings === 'object') {
      serialized.ratings = { ...serialized.ratings }
    }
    if (serialized.specifications && typeof serialized.specifications === 'object') {
      serialized.specifications = { ...serialized.specifications }
    }
    
    return serialized as Product
  }

  // Create a new product
  static async createProduct(product: Omit<Product, 'id'>) {
    try {
      const db = await getFirestore()
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...product,
        createdAt: Timestamp.now()
      })
      console.log('Product created with ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  // Get a single product by ID
  static async getProduct(id: string): Promise<Product | null> {
    try {
      const db = await getFirestore()
      const productRef = doc(db, this.COLLECTION_NAME, id)
      const productDoc = await this.withTimeout(getDoc(productRef), 30000) // 30 second timeout
      
      if (productDoc.exists()) {
        const rawData = {
          id: productDoc.id,
          ...productDoc.data()
        }
        return this.serializeProduct(rawData)
      }
      
      return null
    } catch (error) {
      console.error('Error getting product:', error)
      throw error
    }
  }

  // Get all products with optional filtering
  static async getProducts({
    category,
    featured,
    limit: limitCount = 10,
    orderByField = 'createdAt',
    orderDirection = 'desc' as OrderByDirection
  }: {
    category?: string
    featured?: boolean
    limit?: number
    orderByField?: string
    orderDirection?: OrderByDirection
  } = {}) {
    try {
      const db = await getFirestore()
      const productsRef = collection(db, this.COLLECTION_NAME)
      let q = query(productsRef)

      if (category) {
        q = query(q, where('category', '==', category))
      }

      if (featured !== undefined) {
        q = query(q, where('featured', '==', featured))
      }

      q = query(q, orderBy(orderByField, orderDirection))

      if (limitCount > 0) {
        q = query(q, firestoreLimit(limitCount))
      }

      // Add timeout to the Firebase query - shorter timeout for build
      const querySnapshot = await this.withTimeout(getDocs(q), 20000) // 20 second timeout
      const products = querySnapshot.docs.map(doc => {
        const rawData = {
          id: doc.id,
          ...doc.data()
        }
        return this.serializeProduct(rawData)
      })

      return { products }
    } catch (error) {
      console.error('Error getting products:', error)
      throw error
    }
  }

  // Update a product
  static async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const db = await getFirestore()
      const productRef = doc(db, this.COLLECTION_NAME, id)
      await updateDoc(productRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
      console.log('Product updated successfully')
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  // Delete a product
  static async deleteProduct(id: string): Promise<void> {
    try {
      console.log('ProductService.deleteProduct called with ID:', id)
      
      if (!id || id.trim() === '') {
        throw new Error('Product ID is required for deletion')
      }
      
      const db = await getFirestore()
      console.log('Got Firestore instance')
      
      const productRef = doc(db, this.COLLECTION_NAME, id)
      console.log('Created product reference for deletion:', id)
      
      await deleteDoc(productRef)
      console.log('Product deleted successfully from Firestore:', id)
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  // Search products
  static async searchProducts(searchTerm: string, maxResults: number = 10): Promise<Product[]> {
    try {
      const db = await getFirestore()
      const productsRef = collection(db, this.COLLECTION_NAME)
      const q = query(
        productsRef,
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        firestoreLimit(maxResults)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const rawData = {
          id: doc.id,
          ...doc.data()
        }
        return this.serializeProduct(rawData)
      })
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const db = await getFirestore()
      const productsRef = collection(db, this.COLLECTION_NAME)
      const q = query(productsRef, where('category', '==', category))
      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map(doc => {
        const rawData = {
          id: doc.id,
          ...doc.data()
        }
        return this.serializeProduct(rawData)
      })
      return products
    } catch (error) {
      console.error('Error getting products by category:', error)
      throw error
    }
  }

  // Get featured products
  static async getFeaturedProducts(limitCount = 8): Promise<Product[]> {
    try {
      const db = await getFirestore()
      const productsRef = collection(db, this.COLLECTION_NAME)
      const q = query(productsRef, where('featured', '==', true), firestoreLimit(limitCount))
      
      const querySnapshot = await getDocs(q)
      const products = querySnapshot.docs.map(doc => {
        const rawData = {
          id: doc.id,
          ...doc.data()
        }
        return this.serializeProduct(rawData)
      })

      return products
    } catch (error) {
      console.error('Error getting featured products:', error)
      throw error
    }
  }

  // Update stock quantity
  static async updateStock(id: string, quantity: number): Promise<void> {
    try {
      const db = await getFirestore()
      const productRef = doc(db, this.COLLECTION_NAME, id)
      await updateDoc(productRef, {
        stockQuantity: quantity,
        inStock: quantity > 0,
        updatedAt: Timestamp.now()
      })
      console.log('Stock updated successfully')
    } catch (error) {
      console.error('Error updating stock:', error)
      throw error
    }
  }
}

