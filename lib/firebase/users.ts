import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface UserProfile {
  id?: string
  email: string
  name: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    pincode: string
  }
  isAdmin?: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export class FirebaseUsersService {
  private static readonly COLLECTION_NAME = "users"

  // Get a single user by ID
  static async getUser(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate(),
        } as UserProfile
      }

      return null
    } catch (error) {
      console.error("Error getting user:", error)
      throw error
    }
  }

  // Get all users with optional filters
  static async getUsers(filters?: {
    isAdmin?: boolean
    limit?: number
  }): Promise<UserProfile[]> {
    try {
      let q = query(collection(db, this.COLLECTION_NAME), orderBy("createdAt", "desc"))

      if (filters?.isAdmin !== undefined) {
        q = query(q, where("isAdmin", "==", filters.isAdmin))
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
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate(),
        } as UserProfile
      })
    } catch (error) {
      console.error("Error getting users:", error)
      throw error
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<{
    totalUsers: number
    newUsersThisMonth: number
    activeUsersThisWeek: number
    adminUsers: number
  }> {
    try {
      const users = await this.getUsers()
      
      const now = new Date()
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const stats = {
        totalUsers: users.length,
        newUsersThisMonth: users.filter(user => user.createdAt >= oneMonthAgo).length,
        activeUsersThisWeek: users.filter(user => 
          user.lastLoginAt && user.lastLoginAt >= oneWeekAgo
        ).length,
        adminUsers: users.filter(user => user.isAdmin).length,
      }

      return stats
    } catch (error) {
      console.error("Error getting user stats:", error)
      throw error
    }
  }

  // Real-time listener for user count
  static subscribeToUserCount(callback: (count: number) => void): () => void {
    try {
      const q = query(collection(db, this.COLLECTION_NAME))

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        callback(querySnapshot.size)
      })

      return unsubscribe
    } catch (error) {
      console.error("Error subscribing to user count:", error)
      throw error
    }
  }
}
