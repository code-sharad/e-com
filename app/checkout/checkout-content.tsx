"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { CreditCard, MapPin, User } from "lucide-react"
import { FirebaseOrdersService, type Order } from "@/lib/firebase/orders"

declare global {
  interface Window {
    Razorpay: {
      new (options: {
        key: string
        amount: number
        currency: string
        name: string
        description: string
        order_id: string
        handler: (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => void
        prefill: {
          name: string
          email: string
          contact: string
        }
        theme: {
          color: string
        }
      }): {
        open: () => void
      }
    }
  }
}

export default function CheckoutContent() {
  const { state, dispatch } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "razorpay",
  })

  const [isProcessing, setIsProcessing] = useState(false)

  // Update form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const subtotal = state.total
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax

  // Create order function
  const createOrder = async (paymentMethod: "razorpay" | "cod", paymentStatus: "pending" | "paid" = "pending") => {
    try {
      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: state.items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        subtotal: subtotal,
        shipping: 0, // Free shipping
        total: total,
        status: "pending",
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
      }

      const orderId = await FirebaseOrdersService.createOrder(orderData)
      console.log("Order created successfully:", orderId)
      return orderId
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    const res = await loadRazorpay()

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?")
      return
    }

    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const orderData = await orderResponse.json()

      // Validate Razorpay key
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!razorpayKey) {
        throw new Error("Razorpay key is not configured")
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Global Saanvika",
        description: "Premium Jewelry & Art Collection",
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            // Create order in Firebase first
            const orderId = await createOrder("razorpay", "pending")

            // Verify payment
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId,
                orderData: {
                  customerEmail: formData.email,
                  total: total,
                },
              }),
            })

            if (verifyResponse.ok) {
              // Payment successful
              dispatch({ type: "CLEAR_CART" })
              router.push(`/order-success?orderId=${orderId}`)
            } else {
              alert("Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            alert("Payment verification failed")
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
        theme: {
          color: "#d4a574", // Gold color from our theme
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
          },
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error("Error creating Razorpay order:", error)
      alert("Failed to initiate payment. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill in all required fields")
      setIsProcessing(false)
      return
    }

    if (formData.paymentMethod === "razorpay") {
      await handleRazorpayPayment()
    } else {
      // Cash on Delivery
      try {
        const orderId = await createOrder("cod", "pending")
        dispatch({ type: "CLEAR_CART" })
        router.push(`/order-success?orderId=${orderId}`)
      } catch (error) {
        console.error("Error creating COD order:", error)
        alert("Failed to create order. Please try again.")
      } finally {
        setIsProcessing(false)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Checkout Form */}
      <div className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <div className="bg-card rounded-lg p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gold-500 mr-2" />
              <h2 className="font-serif text-xl font-semibold text-foreground">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card rounded-lg p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-gold-500 mr-2" />
              <h2 className="font-serif text-xl font-semibold text-foreground">Shipping Address</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-gold-500 mr-2" />
              <h2 className="font-serif text-xl font-semibold text-foreground">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 border border-gold-200/20 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={formData.paymentMethod === "razorpay"}
                  onChange={handleInputChange}
                  className="text-gold-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-foreground">Razorpay</p>
                    <div className="flex space-x-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">UPI</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Cards</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">NetBanking</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay securely with UPI, cards, net banking, or wallets
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 border border-gold-200/20 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                  className="text-gold-500"
                />
                <div>
                  <p className="font-medium text-foreground">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                </div>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold"
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing
              ? "Processing..."
              : formData.paymentMethod === "razorpay"
                ? `Pay ₹${total.toLocaleString()} with Razorpay`
                : `Place Order - ₹${total.toLocaleString()}`}
          </Button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="lg:sticky lg:top-8 lg:h-fit">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {state.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium text-foreground">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-gold-200/20 pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (18%)</span>
              <span className="font-medium">₹{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gold-200/20 pt-3">
              <span className="text-foreground">Total</span>
              <span className="text-gold-500">₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Security Badges */}
          <div className="mt-6 pt-6 border-t border-gold-200/20">
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span>🔒</span>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>💳</span>
                <span>Razorpay Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
