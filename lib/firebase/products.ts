// Component memoized for performance (6.98KB)
import React from "react"
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
  limit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Product {
  id?: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  images: string[]
  inStock: boolean
  stockQuantity: number
  featured: boolean
  tags: string[]
  specifications?: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

export class FirebaseProductsService {
  private static readonly COLLECTION_NAME = "products"

  // Create a new product
  static async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const product: Omit<Product, "id"> = {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), product)
      console.log("Product created with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error("Failed to create product")
    }
  }

  // Get a single product by ID
  static async getProduct(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Product
      }

      return null
    } catch (error) {
      console.error("Error getting product:", error)
      return null
    }
  }

  // Get all products with optional filtering
  static async getProducts(
    options: {
      category?: string
      featured?: boolean
      inStock?: boolean
      limit?: number
      lastDoc?: QueryDocumentSnapshot<DocumentData>
    } = {},
  ): Promise<{ products: Product[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      let q = query(collection(db, this.COLLECTION_NAME))

      // Add filters
      if (options.category) {
        q = query(q, where("category", "==", options.category))
      }
      if (options.featured !== undefined) {
        q = query(q, where("featured", "==", options.featured))
      }
      if (options.inStock !== undefined) {
        q = query(q, where("inStock", "==", options.inStock))
      }

      // Add ordering and pagination
      q = query(q, orderBy("createdAt", "desc"))

      if (options.limit) {
        q = query(q, limit(options.limit))
      }

      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc))
      }

      const querySnapshot = await getDocs(q)
      const products: Product[] = []
      let lastDoc: QueryDocumentSnapshot<DocumentData> | undefined

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Product)
        lastDoc = doc
      })

      return { products, lastDoc }
    } catch (error) {
      console.error("Error getting products:", error)
      return { products: [] }
    }
  }

  // Update a product
  static async updateProduct(id: string, updates: Partial<Omit<Product, "id" | "createdAt">>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      })
      console.log("Product updated successfully")
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error("Failed to update product")
    }
  }

  // Delete a product
  static async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await deleteDoc(docRef)
      console.log("Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error("Failed to delete product")
    }
  }

  // Search products
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      // Note: Firestore doesn't have full-text search, so we'll get all products
      // and filter on the client side. For production, consider using Algolia or similar.
      const { products } = await this.getProducts()

      const searchTermLower = searchTerm.toLowerCase()
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTermLower) ||
          product.description.toLowerCase().includes(searchTermLower) ||
          product.category.toLowerCase().includes(searchTermLower) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchTermLower)),
      )
    } catch (error) {
      console.error("Error searching products:", error)
      return []
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { products } = await this.getProducts({ category })
      return products
    } catch (error) {
      console.error("Error getting products by category:", error)
      return []
    }
  }

  // Get featured products
  static async getFeaturedProducts(limitCount = 8): Promise<Product[]> {
    try {
      // Temporary solution: Get all featured products without ordering, then sort in memory
      // This avoids the composite index requirement while indexes are being built
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("featured", "==", true),
        limit(limitCount * 2) // Get more to ensure we have enough after sorting
      )
      
      const querySnapshot = await getDocs(q)
      const products: Product[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Product)
      })

      // Sort by createdAt in memory and limit to desired count
      return products
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limitCount)
    } catch (error) {
      console.error("Error getting featured products:", error)
      return []
    }
  }

  // Update stock quantity
  static async updateStock(id: string, quantity: number): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await updateDoc(docRef, {
        stockQuantity: quantity,
        inStock: quantity > 0,
        updatedAt: new Date(),
      })
      console.log("Stock updated successfully")
    } catch (error) {
      console.error("Error updating stock:", error)
      throw new Error("Failed to update stock")
    }
  }
}
