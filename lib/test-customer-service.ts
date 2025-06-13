// Test script to verify customer service functionality
import { CustomerService } from '@/lib/services/customer-service'
import { FirebaseUsersService } from '@/lib/firebase/users'
import { FirebaseOrdersService } from '@/lib/firebase/orders'

export async function testCustomerService() {
  console.log('=== Testing Customer Service ===')
  
  try {
    // Test 1: Check if we can fetch users
    console.log('1. Testing FirebaseUsersService...')
    const users = await FirebaseUsersService.getUsers()
    console.log(`Found ${users.length} users`)
    
    // Test 2: Check if we can fetch orders
    console.log('2. Testing FirebaseOrdersService...')
    const orders = await FirebaseOrdersService.getOrders()
    console.log(`Found ${orders.length} orders`)
    
    // Test 3: Check if customer service works
    console.log('3. Testing CustomerService...')
    const customers = await CustomerService.getAllCustomers()
    console.log(`Found ${customers.length} customers`)
    
    // Test 4: Check customer stats
    const stats = await FirebaseUsersService.getUserStats()
    console.log('User stats:', stats)
    
    return {
      success: true,
      usersCount: users.length,
      ordersCount: orders.length,
      customersCount: customers.length,
      stats
    }
  } catch (error) {
    console.error('Test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
