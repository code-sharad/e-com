// Dashboard Service for Admin Analytics
import { getFirestore } from '@/lib/firebase'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp, 
  onSnapshot,
  QuerySnapshot,
  limit 
} from 'firebase/firestore'

export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  outOfStockProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalCustomers: number
  activeCustomers: number
  productsChange: string
  ordersChange: string
  revenueChange: string
  customersChange: string
}

export interface RecentActivity {
  id: string
  type: 'order' | 'product' | 'user'
  title: string
  description: string
  timestamp: Date
  status?: string
}

export class DashboardService {
  private static async getDb() {
    return await getFirestore()
  }

  private static calculatePercentageChange(current: number, previous: number): string {
    if (previous <= 0) return '+0%'
    const change = ((current - previous) / previous) * 100
    const percentage = Math.round(change)
    return `${percentage > 0 ? '+' : ''}${percentage}%`
  }

  private static async getCustomerStats() {
    try {
      const db = await this.getDb()
      const customersRef = collection(db, 'customers')
      const customersSnapshot = await getDocs(customersRef)
      const totalCustomers = customersSnapshot.size
      
      console.log('Customers loaded:', totalCustomers)
      
      // Count active customers (assuming customers without explicit status are active)
      const customers = customersSnapshot.docs.map(doc => doc.data()) as any[]
      const activeCustomers = customers.filter(c => c.status !== 'inactive' && c.status !== 'blocked').length

      // Calculate month-over-month change
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const lastMonthCustomers = customers.filter(c => {
        const joinDate = c.joinDate instanceof Timestamp ? c.joinDate.toDate() : new Date(c.joinDate || Date.now())
        return joinDate <= lastMonth
      })
      const customersChange = this.calculatePercentageChange(totalCustomers, lastMonthCustomers.length)

      return { totalCustomers, activeCustomers, customersChange }
    } catch (error) {
      console.error('Error getting customer stats:', error)
      return { totalCustomers: 0, activeCustomers: 0, customersChange: '+0%' }
    }
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('Loading dashboard stats...')
      const db = await this.getDb()
      
      // Get products stats
      const productsRef = collection(db, 'products')
      const productsSnapshot = await getDocs(productsRef)
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]
      console.log('Products loaded:', products.length)
      
      const totalProducts = products.length
      const activeProducts = products.filter(p => p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0)).length
      const outOfStockProducts = products.filter(p => p.stockQuantity === 0).length

      // Get orders stats
      const ordersRef = collection(db, 'orders')
      const ordersSnapshot = await getDocs(ordersRef)
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]
      console.log('Orders loaded:', orders.length)
      
      const totalOrders = orders.length
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

      // Calculate month-over-month changes
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const lastMonthOrders = orders.filter(o => {
        const orderDate = o.createdAt instanceof Timestamp ? o.createdAt.toDate() : new Date(o.createdAt || Date.now())
        return orderDate <= lastMonth
      })
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

      const productsChange = this.calculatePercentageChange(totalProducts, totalProducts - 1) // Simple calculation
      const ordersChange = this.calculatePercentageChange(totalOrders, lastMonthOrders.length)
      const revenueChange = this.calculatePercentageChange(totalRevenue, lastMonthRevenue)

      // Get customer stats
      const customerStats = await this.getCustomerStats()

      const stats = {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalCustomers: customerStats.totalCustomers,
        activeCustomers: customerStats.activeCustomers,
        productsChange,
        ordersChange,
        revenueChange,
        customersChange: customerStats.customersChange
      }
      
      console.log('Dashboard stats calculated:', stats)
      return stats
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      // Return default stats in case of error
      return {
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        activeCustomers: 0,
        productsChange: '+0%',
        ordersChange: '+0%',
        revenueChange: '+0%',
        customersChange: '+0%'
      }
    }
  }

  static async getRecentActivity(maxItems: number = 5): Promise<RecentActivity[]> {
    try {
      const db = await this.getDb()
      const activities: RecentActivity[] = []

      // Get recent orders
      const ordersRef = collection(db, 'orders')
      const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(maxItems))
      const ordersSnapshot = await getDocs(ordersQuery)
      
      ordersSnapshot.forEach(doc => {
        const order = doc.data()
        activities.push({
          id: doc.id,
          type: 'order',
          title: `New order #${doc.id.slice(0, 8)}`,
          description: `Order placed for ₹${order.totalAmount}`,
          timestamp: order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt || Date.now()),
          status: order.status
        })
      })

      // Get recent customers (if customers collection exists)
      try {
        const customersRef = collection(db, 'customers')
        const customersQuery = query(customersRef, orderBy('joinDate', 'desc'), limit(maxItems))
        const customersSnapshot = await getDocs(customersQuery)

        customersSnapshot.forEach(doc => {
          const customer = doc.data()
          activities.push({
            id: doc.id,
            type: 'user',
            title: 'New customer',
            description: `${customer.name} joined`,
            timestamp: customer.joinDate instanceof Timestamp ? customer.joinDate.toDate() : new Date(customer.joinDate || Date.now())
          })
        })
      } catch (customerError) {
        console.log('No customers collection found or error accessing it:', customerError)
      }

      // Sort all activities by timestamp and limit to maxItems
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, maxItems)

    } catch (error) {
      console.error('Error getting recent activity:', error)
      return []
    }
  }

  static async subscribeToRealtimeStats(callback: (stats: Partial<DashboardStats>) => void): Promise<() => void> {
    const db = await this.getDb()
    const ordersRef = collection(db, 'orders')
    const customersRef = collection(db, 'customers')
    const unsubscribers: (() => void)[] = []

    // Subscribe to orders changes
    const unsubscribeOrders = onSnapshot(ordersRef, async (snapshot: QuerySnapshot) => {
      const orders = snapshot.docs.map(doc => doc.data()) as any[]
      const totalOrders = orders.length
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)

      callback({
        totalOrders,
        pendingOrders,
        totalRevenue
      })
    })
    unsubscribers.push(unsubscribeOrders)

    // Subscribe to customers changes (with error handling)
    try {
      const unsubscribeCustomers = onSnapshot(customersRef, (snapshot: QuerySnapshot) => {
        const totalCustomers = snapshot.size
        const customers = snapshot.docs.map(doc => doc.data()) as any[]
        const activeCustomers = customers.filter((c: any) => c.status !== 'inactive' && c.status !== 'blocked').length

        callback({
          totalCustomers,
          activeCustomers
        })
      })
      unsubscribers.push(unsubscribeCustomers)
    } catch (error) {
      console.log('Could not subscribe to customers collection:', error)
    }

    // Return unsubscribe function that cleans up all subscriptions
    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }
}

