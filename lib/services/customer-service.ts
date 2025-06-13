import { getFirestore } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore'

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  joinDate: Date
  lastPurchase?: Date
  totalOrders: number
  totalSpent: number
  status: 'active' | 'inactive' | 'blocked'
}

export class CustomerService {
  private static async getCollection() {
    const db = await getFirestore()
    return collection(db, 'customers')
  }
  static async getAllCustomers(): Promise<Customer[]> {
    try {
      console.log('CustomerService: Fetching all customers...')
      const customersCollection = await this.getCollection()
      const querySnapshot = await getDocs(
        query(customersCollection, orderBy('joinDate', 'desc'))
      )
      
      console.log('CustomerService: Found', querySnapshot.size, 'customers')
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('CustomerService: Processing customer:', doc.id, data)
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          email: data.email || '',
          phone: data.phone,
          address: data.address,
          joinDate: data.joinDate ? (data.joinDate as Timestamp).toDate() : new Date(),
          lastPurchase: data.lastPurchase ? (data.lastPurchase as Timestamp).toDate() : undefined,
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || 0,
          status: data.status || 'active'
        }
      })
    } catch (error) {
      console.error('Error fetching customers:', error)
      // Return empty array instead of throwing to prevent app crashes
      return []
    }
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const customersCollection = await this.getCollection()
      const docRef = doc(customersCollection, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data()
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        joinDate: (data.joinDate as Timestamp).toDate(),
        lastPurchase: data.lastPurchase ? (data.lastPurchase as Timestamp).toDate() : undefined,
        totalOrders: data.totalOrders || 0,
        totalSpent: data.totalSpent || 0,
        status: data.status || 'active'
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw error
    }
  }

  static async updateCustomerStatus(id: string, status: Customer['status']): Promise<void> {
    try {
      const customersCollection = await this.getCollection()
      const docRef = doc(customersCollection, id)
      await updateDoc(docRef, { status })
    } catch (error) {
      console.error('Error updating customer status:', error)
      throw error
    }
  }

  static async getCustomersByStatus(status: Customer['status']): Promise<Customer[]> {
    try {
      const customersCollection = await this.getCollection()
      const querySnapshot = await getDocs(
        query(
          customersCollection,
          where('status', '==', status),
          orderBy('joinDate', 'desc')
        )
      )

      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          joinDate: (data.joinDate as Timestamp).toDate(),
          lastPurchase: data.lastPurchase ? (data.lastPurchase as Timestamp).toDate() : undefined,
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || 0,
          status: data.status || 'active'
        }
      })
    } catch (error) {
      console.error('Error fetching customers by status:', error)
      throw error
    }
  }

  static async createCustomer(customerData: Omit<Customer, 'id' | 'joinDate' | 'totalOrders' | 'totalSpent'>): Promise<string> {
    try {
      console.log('CustomerService: Creating new customer:', customerData.email)
      const customersCollection = await this.getCollection()
      const docRef = await addDoc(customersCollection, {
        ...customerData,
        joinDate: Timestamp.now(),
        totalOrders: 0,
        totalSpent: 0,
        status: customerData.status || 'active'
      })
      console.log('CustomerService: Customer created with ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  static async updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'joinDate'>>): Promise<void> {
    try {
      console.log('CustomerService: Updating customer:', id, updates)
      const customersCollection = await this.getCollection()
      const docRef = doc(customersCollection, id)
      await updateDoc(docRef, updates)
      console.log('CustomerService: Customer updated successfully')
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  static async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      console.log('CustomerService: Searching customers for:', searchTerm)
      const customers = await this.getAllCustomers()
      return customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm))
      )
    } catch (error) {
      console.error('Error searching customers:', error)
      return []
    }
  }

  static async getCustomerStats(): Promise<{
    total: number
    active: number
    inactive: number
    blocked: number
    totalRevenue: number
    averageOrderValue: number
  }> {
    try {
      console.log('CustomerService: Getting customer statistics')
      const customers = await this.getAllCustomers()
      
      const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
        blocked: customers.filter(c => c.status === 'blocked').length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        averageOrderValue: 0
      }
      
      const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0)
      stats.averageOrderValue = totalOrders > 0 ? stats.totalRevenue / totalOrders : 0
      
      console.log('CustomerService: Stats calculated:', stats)
      return stats
    } catch (error) {
      console.error('Error getting customer stats:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        blocked: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      }
    }
  }

  static async updateCustomerOrderStats(customerEmail: string): Promise<void> {
    try {
      console.log('CustomerService: Updating order stats for customer:', customerEmail)
      
      // Get all customers to find the one with this email
      const customers = await this.getAllCustomers()
      const customer = customers.find(c => c.email === customerEmail)
      
      if (!customer) {
        console.log('CustomerService: Customer not found, creating new customer record')
        // If customer doesn't exist, we might need to create them
        // This would typically be done when they place their first order
        return
      }

      // Get all orders for this customer
      const { FirebaseOrdersService } = await import('../firebase/orders')
      const orders = await FirebaseOrdersService.getOrders({ customerEmail })
      
      // Calculate stats
      const totalOrders = orders.length
      const totalSpent = orders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0)
      
      const lastPurchase = orders.length > 0 
        ? orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : undefined

      // Update customer record
      await this.updateCustomer(customer.id, {
        totalOrders,
        totalSpent,
        lastPurchase
      })
      
      console.log('CustomerService: Updated customer stats:', { totalOrders, totalSpent })
    } catch (error) {
      console.error('Error updating customer order stats:', error)
      // Don't throw error to avoid breaking order processing
    }
  }

  static async ensureCustomerExists(customerData: {
    name: string
    email: string
    phone?: string
    address?: string
  }): Promise<string> {
    try {
      console.log('CustomerService: Ensuring customer exists:', customerData.email)
      
      // Check if customer already exists
      const customers = await this.getAllCustomers()
      const existingCustomer = customers.find(c => c.email === customerData.email)
      
      if (existingCustomer) {
        console.log('CustomerService: Customer already exists:', existingCustomer.id)
        return existingCustomer.id
      }
      
      // Create new customer
      const customerId = await this.createCustomer({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        status: 'active'
      })
      
      console.log('CustomerService: Created new customer:', customerId)
      return customerId
    } catch (error) {
      console.error('Error ensuring customer exists:', error)
      throw error
    }
  }
}
