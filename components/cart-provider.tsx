"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  category: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  return { total, itemCount }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[]
  let totals: { total: number; itemCount: number }

  switch (action.type) {
    case "LOAD_CART": {
      totals = calculateTotals(action.payload)
      return {
        items: action.payload,
        total: totals.total,
        itemCount: totals.itemCount,
      }
    }

    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }

      totals = calculateTotals(newItems)

      // Save to localStorage
      localStorage.setItem("cart_items", JSON.stringify(newItems))

      return {
        items: newItems,
        total: totals.total,
        itemCount: totals.itemCount,
      }
    }

    case "REMOVE_ITEM": {
      newItems = state.items.filter((item) => item.id !== action.payload)
      totals = calculateTotals(newItems)

      // Save to localStorage
      localStorage.setItem("cart_items", JSON.stringify(newItems))

      return {
        items: newItems,
        total: totals.total,
        itemCount: totals.itemCount,
      }
    }

    case "UPDATE_QUANTITY": {
      newItems = state.items
        .map((item) =>
          item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item,
        )
        .filter((item) => item.quantity > 0)

      totals = calculateTotals(newItems)

      // Save to localStorage
      localStorage.setItem("cart_items", JSON.stringify(newItems))

      return {
        items: newItems,
        total: totals.total,
        itemCount: totals.itemCount,
      }
    }

    case "CLEAR_CART": {
      // Clear localStorage
      localStorage.removeItem("cart_items")

      return {
        items: [],
        total: 0,
        itemCount: 0,
      }
    }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart_items")
      if (savedCart) {
        const cartItems = JSON.parse(savedCart)
        if (Array.isArray(cartItems)) {
          dispatch({ type: "LOAD_CART", payload: cartItems })
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      localStorage.removeItem("cart_items")
    }
  }, [])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
