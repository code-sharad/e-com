"use client"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"

export default function CartPage() {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id, quantity },
    })
  }

  const removeItem = (id: string) => {
    dispatch({
      type: "REMOVE_ITEM",
      payload: id,
    })
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-8 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">
                Discover our beautiful collections and add some items to your cart.
              </p>
              <Link href="/category/jewelry">
                <Button className="bg-gold-500 hover:bg-gold-600 text-black font-semibold">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {state.items.map((item) => (
                <div key={item.id} className="bg-card rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize mb-2">{item.category.replace("-", " ")}</p>
                      <p className="text-xl font-bold text-gold-500">₹{item.price.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-12 text-center font-medium">{item.quantity}</span>

                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gold-200/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Subtotal ({item.quantity} item{item.quantity > 1 ? "s" : ""})
                      </span>
                      <span className="font-semibold text-foreground">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 shadow-sm sticky top-8">
                <h2 className="font-serif text-xl font-bold text-foreground mb-6">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{state.total.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">₹{Math.round(state.total * 0.18).toLocaleString()}</span>
                  </div>

                  <div className="border-t border-gold-200/20 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-foreground">Total</span>
                      <span className="text-lg font-bold text-gold-500">
                        ₹{Math.round(state.total * 1.18).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link href="/checkout">
                    <Button className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Link href="/category/jewelry">
                    <Button variant="outline" className="w-full" size="lg">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {/* Security Badges */}
                <div className="mt-6 pt-6 border-t border-gold-200/20">
                  <p className="text-xs text-muted-foreground text-center mb-3">Secure checkout powered by</p>
                  <div className="flex justify-center space-x-4">
                    <div className="text-xs text-muted-foreground">🔒 SSL Encrypted</div>
                    <div className="text-xs text-muted-foreground">💳 Razorpay</div>
                  </div>
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
