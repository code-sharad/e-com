import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/cart-provider"
import { AuthProvider } from "@/components/auth-provider"
import AuthWrapper from "@/components/auth-wrapper"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Global Saanvika - Premium Jewelry Collection",
  description:
    "Discover exquisite jewelry, photo frames, and resin art from Global Saanvika. Luxury craftsmanship meets timeless elegance.",
  keywords: "jewelry, premium jewelry, photo frames, resin art, luxury accessories",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AuthWrapper>
              <CartProvider>{children}</CartProvider>
            </AuthWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
