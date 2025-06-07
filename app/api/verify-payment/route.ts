import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { FirebaseOrdersService } from "@/lib/firebase/orders"

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "V0pkr9NdJGC95gR0pcqx4KTg"

export async function POST(request: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId,
      orderData 
    } = await request.json()

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Payment is verified - update order status in Firebase
      if (orderId) {
        try {
          await FirebaseOrdersService.updatePaymentStatus(orderId, "paid")
          await FirebaseOrdersService.updateOrderStatus(orderId, "processing")
          console.log("Order updated successfully:", orderId)
        } catch (error) {
          console.error("Error updating order:", error)
          // Even if order update fails, payment was successful
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        orderId: orderId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
