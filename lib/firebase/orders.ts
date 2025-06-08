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
  type DocumentData,
  type QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

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
  customerAddress?: {
    street: string
    city: string
    state: string
    pincode: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentMethod: "razorpay" | "cod"
  paymentStatus: "pending" | "paid" | "failed"
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
}

export class FirebaseOrdersService {
  private static readonly COLLECTION_NAME = "orders"

  // Create a new order
  static async createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const order: Omit<Order, "id"> = {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), order)
      console.log("Order created with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  // Get a single order by ID
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, orderId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
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
  }): Promise<Order[]> {    try {
      let q = query(collection(db, this.COLLECTION_NAME), orderBy("createdAt", "desc"))

      if (filters?.status) {
        q = query(q, where("status", "==", filters.status))
      }

      if (filters?.customerEmail) {
        q = query(q, where("customerEmail", "==", filters.customerEmail))
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Order
      })
    } catch (error: any) {
      // If the composite index is not ready, fall back to a simpler query
      if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
        console.warn("Composite index not ready for getOrders, using fallback query...")
        try {
          // Fallback: get all orders without complex filtering
          let q = query(collection(db, this.COLLECTION_NAME))

          if (filters?.limit) {
            q = query(q, limit(filters.limit))
          }

          const querySnapshot = await getDocs(q)
          let orders = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
            } as Order
          })

          // Filter and sort in memory
          if (filters?.status) {
            orders = orders.filter(order => order.status === filters.status)
          }
          if (filters?.customerEmail) {
            orders = orders.filter(order => order.customerEmail === filters.customerEmail)
          }

          // Sort by createdAt
          orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

          return orders
        } catch (fallbackError) {
          console.error("Error in fallback getOrders query:", fallbackError)
          throw fallbackError
        }
      }
      
      console.error("Error getting orders:", error)
      throw error
    }
  }
  // Get orders by customer email
  static async getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
    try {
      // Try the optimized query first (requires composite index)
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("customerEmail", "==", customerEmail),
        orderBy("createdAt", "desc")
      )

      const querySnapshot = await getDocs(q)
      const orders: Order[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Order)
      })

      return orders
    } catch (error: any) {
      // If the composite index is not ready, fall back to a simpler query
      if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
        console.warn("Composite index not ready, using fallback query...")
        try {
          // Fallback: get all orders and filter in memory
          const q = query(
            collection(db, this.COLLECTION_NAME),
            where("customerEmail", "==", customerEmail)
          )

          const querySnapshot = await getDocs(q)
          const orders: Order[] = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            orders.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
            } as Order)
          })

          // Sort by createdAt in memory
          return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        } catch (fallbackError) {
          console.error("Error in fallback query:", fallbackError)
          throw fallbackError
        }
      }
      
      console.error("Error getting orders by customer:", error)
      throw error
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date(),
      })
      console.log("Order status updated:", orderId, status)
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId: string, paymentStatus: Order["paymentStatus"]): Promise<void> {
    try {
      const orderRef = doc(db, this.COLLECTION_NAME, orderId)
      await updateDoc(orderRef, {
        paymentStatus,
        updatedAt: new Date(),
      })
      console.log("Payment status updated:", orderId, paymentStatus)
    } catch (error) {
      console.error("Error updating payment status:", error)
      throw error
    }
  }

  // Get order statistics
  static async getOrderStats(): Promise<{
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    completedOrders: number
  }> {
    try {
      const orders = await this.getOrders()
      
      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders
          .filter(order => order.paymentStatus === "paid")
          .reduce((sum, order) => sum + order.total, 0),
        pendingOrders: orders.filter(order => order.status === "pending").length,
        completedOrders: orders.filter(order => order.status === "delivered").length,
      }

      return stats
    } catch (error) {
      console.error("Error getting order stats:", error)
      throw error
    }
  }
  // Real-time listener for orders
  static subscribeToOrders(
    callback: (orders: Order[]) => void,
    filters?: { status?: string; limit?: number }
  ): () => void {
    try {
      let q = query(collection(db, this.COLLECTION_NAME), orderBy("createdAt", "desc"))

      if (filters?.status) {
        q = query(q, where("status", "==", filters.status))
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit))
      }

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const orders: Order[] = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
            } as Order
          })
          callback(orders)
        },
        (error) => {
          console.error("Error in orders subscription:", error)
          // If index is not ready, provide empty array and retry later
          if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
            console.warn("Index not ready for real-time subscription, providing empty orders...")
            callback([])
          }
        }
      )

      return unsubscribe
    } catch (error) {
      console.error("Error subscribing to orders:", error)
      throw error
    }
  }

  // Delete order (admin only)
  static async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, orderId))
      console.log("Order deleted:", orderId)
    } catch (error) {
      console.error("Error deleting order:", error)
      throw error
    }
  }
}
