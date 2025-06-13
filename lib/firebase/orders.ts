// Component memoized for performance (9.97KB)
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
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { getFirestore } from "@/lib/firebase"

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  image?: string
}

export interface Order {
  id?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddress: {
    street: string
    city: string
    state: string
    pincode: string
  }
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'completed' | 'failed'
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export class FirebaseOrdersService {
  private static readonly COLLECTION_NAME = "orders"

  // Helper function to safely convert Timestamp to Date
  private static convertTimestampToDate(timestamp: any): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate()
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000)
    }
    if (timestamp instanceof Date) {
      return timestamp
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp)
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp)
    }
    return new Date() // fallback to current date
  }

  private static async getCollection() {
    const db = await getFirestore()
    return collection(db, this.COLLECTION_NAME)
  }
  // Create a new order
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const ordersCollection = await this.getCollection()
      const now = Timestamp.now()
      const docRef = await addDoc(ordersCollection, {
        ...orderData,
        createdAt: now,
        updatedAt: now
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  // Get a single order by ID
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const ordersCollection = await this.getCollection()
      const docRef = doc(ordersCollection, orderId)
      const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: this.convertTimestampToDate(data.createdAt),
          updatedAt: this.convertTimestampToDate(data.updatedAt)
        } as Order
      }

      return null
    } catch (error) {
      console.error("Error getting order:", error)
      throw error
    }
  }

  // Get all orders with optional filters
  static async getOrders(filters?: {
    status?: string
    customerEmail?: string
    limit?: number
  }): Promise<Order[]> {
    try {
      const ordersCollection = await this.getCollection()
      let q = query(ordersCollection, orderBy("createdAt", "desc"))

      if (filters?.status) {
        q = query(q, where("status", "==", filters.status))
      }

      if (filters?.customerEmail) {
        q = query(q, where("customerEmail", "==", filters.customerEmail))
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit))
      }      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: this.convertTimestampToDate(data.createdAt),
          updatedAt: this.convertTimestampToDate(data.updatedAt),
        } as Order
      })
    } catch (error) {
      console.error("Error getting orders:", error)
      throw error
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const ordersCollection = await this.getCollection()
      const docRef = doc(ordersCollection, orderId)
      await updateDoc(docRef, {
        status,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId: string, paymentStatus: Order['paymentStatus']): Promise<void> {
    try {
      const ordersCollection = await this.getCollection()
      const docRef = doc(ordersCollection, orderId)
      await updateDoc(docRef, {
        paymentStatus,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      throw error
    }
  }

  // Delete an order
  static async deleteOrder(orderId: string): Promise<void> {
    try {
      const ordersCollection = await this.getCollection()
      const docRef = doc(ordersCollection, orderId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Error deleting order:", error)
      throw error
    }
  }

  // Get order statistics
  static async getOrderStats(): Promise<{
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }> {
    try {
      const ordersCollection = await this.getCollection()
      const stats = {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }

      const querySnapshot = await getDocs(ordersCollection)
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        stats.total++
        stats[data.status as keyof typeof stats]++
      })

      return stats
    } catch (error) {
      console.error("Error getting order stats:", error)
      throw error
    }
  }

  // Subscribe to order updates
  static async subscribeToOrder(orderId: string, callback: (order: Order | null) => void): Promise<() => void> {
    const db = await getFirestore()
    const docRef = doc(db, this.COLLECTION_NAME, orderId)
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        callback({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Order)
      } else {
        callback(null)
      }
    })

    return unsubscribe
  }

  // Subscribe to all orders
  static async subscribeToAllOrders(callback: (orders: Order[]) => void): Promise<() => void> {
    const db = await getFirestore()
    const ordersRef = collection(db, this.COLLECTION_NAME)
    const q = query(ordersRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Order
      })
      callback(orders)
    })

    return unsubscribe
  }
}

