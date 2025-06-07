import { type NextRequest, NextResponse } from "next/server"

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_IRVAiW1M1BMpIV"
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "V0pkr9NdJGC95gR0pcqx4KTg"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "INR", receipt, notes } = await request.json()

    // Validate required fields
    if (!amount || !receipt) {
      return NextResponse.json({ error: "Amount and receipt are required" }, { status: 400 })
    }

    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes,
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Razorpay API error:", errorData)
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 })
    }

    const order = await response.json()

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
