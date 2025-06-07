import { FirebaseProductsService, type Product } from "./firebase/products"
import { FirebaseOrdersService, type Order } from "./firebase/orders"
import { FirebaseUsersService } from "./firebase/users"

export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  outOfStockProducts: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  totalCustomers: number
  newCustomersThisMonth: number
  revenueChange: string
  ordersChange: string
  customersChange: string
  productsChange: string
}

export interface RecentActivity {
  id: string
  type: "order" | "product" | "user"
  title: string
  description: string
  timestamp: Date
  status?: string
}

export class DashboardService {
  // Get comprehensive dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {      // Fetch data from all services in parallel
      const [productsResult, orderStats, userStats] = await Promise.all([
        FirebaseProductsService.getProducts(),
        FirebaseOrdersService.getOrderStats(),
        FirebaseUsersService.getUserStats(),
      ])

      const products = productsResult.products

      // Calculate product statistics
      const activeProducts = products.filter((p: Product) => p.inStock && p.stockQuantity > 0).length
      const outOfStockProducts = products.filter((p: Product) => !p.inStock || p.stockQuantity === 0).length

      // For now, we'll calculate simple change percentages
      // In a real app, you'd compare with previous period data
      const stats: DashboardStats = {
        totalProducts: products.length,
        activeProducts,
        outOfStockProducts,
        totalOrders: orderStats.totalOrders,
        pendingOrders: orderStats.pendingOrders,
        completedOrders: orderStats.completedOrders,
        totalRevenue: orderStats.totalRevenue,
        totalCustomers: userStats.totalUsers,
        newCustomersThisMonth: userStats.newUsersThisMonth,
        // These would be calculated based on historical data
        revenueChange: "+15%",
        ordersChange: "+8%", 
        customersChange: "+5%",
        productsChange: "+12%",
      }

      return stats
    } catch (error) {
      console.error("Error getting dashboard stats:", error)
      throw error
    }
  }

  // Get recent activity across all entities
  static async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {    try {
      const [recentOrdersResult, allProductsResult] = await Promise.all([
        FirebaseOrdersService.getOrders({ limit: 5 }),
        FirebaseProductsService.getProducts(),
      ])

      const recentOrders = recentOrdersResult
      const allProducts = allProductsResult.products
      const activities: RecentActivity[] = []

      // Add recent orders
      recentOrders.forEach((order: Order) => {
        activities.push({
          id: `order-${order.id}`,
          type: "order",
          title: `New order from ${order.customerName}`,
          description: `Order total: ₹${order.total.toLocaleString()}`,
          timestamp: order.createdAt,
          status: order.status,
        })
      })      // Add recent products (created in last 7 days)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recentProductsFiltered = allProducts
        .filter((product: Product) => product.createdAt >= oneWeekAgo)
        .slice(0, 3)

      recentProductsFiltered.forEach((product: Product) => {
        activities.push({
          id: `product-${product.id}`,
          type: "product",
          title: `New product added: ${product.name}`,
          description: `Price: ₹${product.price.toLocaleString()}`,
          timestamp: product.createdAt,
        })
      })

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
    } catch (error) {
      console.error("Error getting recent activity:", error)
      throw error
    }
  }

  // Set up real-time listeners for dashboard
  static subscribeToRealtimeStats(
    callback: (stats: Partial<DashboardStats>) => void
  ): () => void {
    const unsubscribeFunctions: (() => void)[] = []

    try {
      // Subscribe to orders for real-time revenue and order updates
      const unsubscribeOrders = FirebaseOrdersService.subscribeToOrders((orders) => {
        const totalRevenue = orders
          .filter(order => order.paymentStatus === "paid")
          .reduce((sum, order) => sum + order.total, 0)
        
        const pendingOrders = orders.filter(order => order.status === "pending").length
        const completedOrders = orders.filter(order => order.status === "delivered").length

        callback({
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
          completedOrders,
        })
      })
      unsubscribeFunctions.push(unsubscribeOrders)

      // Subscribe to user count
      const unsubscribeUsers = FirebaseUsersService.subscribeToUserCount((count) => {
        callback({ totalCustomers: count })
      })
      unsubscribeFunctions.push(unsubscribeUsers)

      // Return cleanup function
      return () => {
        unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
      }
    } catch (error) {
      console.error("Error setting up real-time listeners:", error)
      throw error
    }
  }

  // Get sales analytics for charts
  static async getSalesAnalytics(days: number = 30): Promise<{
    dailyRevenue: Array<{ date: string; revenue: number; orders: number }>
    topProducts: Array<{ name: string; revenue: number; quantity: number }>
    categoryBreakdown: Array<{ category: string; revenue: number; percentage: number }>
  }> {    try {
      const ordersResult = await FirebaseOrdersService.getOrders()
      const productsResult = await FirebaseProductsService.getProducts()
      
      const orders = ordersResult
      const products = productsResult.products

      // Calculate daily revenue for the last N days
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      const dailyRevenue: { [key: string]: { revenue: number; orders: number } } = {}

      orders
        .filter(order => order.createdAt >= startDate && order.paymentStatus === "paid")
        .forEach(order => {
          const dateKey = order.createdAt.toISOString().split('T')[0]
          if (!dailyRevenue[dateKey]) {
            dailyRevenue[dateKey] = { revenue: 0, orders: 0 }
          }
          dailyRevenue[dateKey].revenue += order.total
          dailyRevenue[dateKey].orders += 1
        })

      const dailyRevenueArray = Object.entries(dailyRevenue).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))

      // Calculate top products by revenue
      const productRevenue: { [key: string]: { name: string; revenue: number; quantity: number } } = {}

      orders
        .filter(order => order.paymentStatus === "paid")
        .forEach(order => {
          order.items.forEach(item => {
            if (!productRevenue[item.productId]) {
              productRevenue[item.productId] = {
                name: item.productName,
                revenue: 0,
                quantity: 0,
              }
            }
            productRevenue[item.productId].revenue += item.price * item.quantity
            productRevenue[item.productId].quantity += item.quantity
          })
        })

      const topProducts = Object.values(productRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Calculate category breakdown
      const categoryRevenue: { [key: string]: number } = {}
      const totalRevenue = orders
        .filter(order => order.paymentStatus === "paid")
        .reduce((sum, order) => sum + order.total, 0)

      orders
        .filter(order => order.paymentStatus === "paid")        .forEach((order: Order) => {
          order.items.forEach(item => {
            const product = products.find((p: Product) => p.id === item.productId)
            const category = product?.category || "Unknown"
            
            if (!categoryRevenue[category]) {
              categoryRevenue[category] = 0
            }
            categoryRevenue[category] += item.price * item.quantity
          })
        })

      const categoryBreakdown = Object.entries(categoryRevenue).map(([category, revenue]) => ({
        category,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      }))

      return {
        dailyRevenue: dailyRevenueArray,
        topProducts,
        categoryBreakdown,
      }
    } catch (error) {
      console.error("Error getting sales analytics:", error)
      throw error
    }
  }
}
