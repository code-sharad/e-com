"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, MapPin, Edit } from "lucide-react"
import AuthLoading from "@/components/auth-loading"

export default function ProfilePage() {
  const { user, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/auth/login")
    }
  }, [isInitialized, user, router])

  if (!isInitialized) {
    return <AuthLoading />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-8">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-semibold text-foreground">Personal Information</h2>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={user.name} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email} readOnly />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="Add phone number" />
                    </div>
                    <div>
                      <Label htmlFor="birthday">Birthday</Label>
                      <Input id="birthday" type="date" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Add your address" />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Account Summary</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium text-foreground">Jan 2024</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span className="font-medium text-foreground">5</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="font-medium text-gold-500">₹1,25,000</span>
                  </div>

                  {user.isAdmin && (
                    <div className="pt-4 border-t border-gold-200/20">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gold-100 text-gold-800">
                        Admin Account
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-lg p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Quick Actions</h3>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    View Orders
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>

                  {user.isAdmin && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/admin")}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
