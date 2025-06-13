import type React from "react"
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/common/theme-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import AuthWrapper from "@/components/auth/auth-wrapper"
import { Providers } from '@/components/common/providers'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { cn } from '@/lib/utils/common'

export const metadata: Metadata = {
  title: {
    default: 'Saanvika Ecommerce - Premium Jewelry Collection',
    template: '%s | Saanvika Ecommerce'
  },
  description: 'Discover our exquisite collection of premium jewelry. Quality craftsmanship, timeless designs, and exceptional service.',
  keywords: ['jewelry', 'ecommerce', 'premium', 'collection', 'gold', 'silver', 'diamonds'],
  authors: [{ name: 'Saanvika Ecommerce' }],
  creator: 'Saanvika Ecommerce',
  publisher: 'Saanvika Ecommerce',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://saanvika-ecommerce.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Saanvika Ecommerce - Premium Jewelry Collection',
    description: 'Discover our exquisite collection of premium jewelry. Quality craftsmanship, timeless designs, and exceptional service.',
    url: 'https://saanvika-ecommerce.com',
    siteName: 'Saanvika Ecommerce',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saanvika Ecommerce - Premium Jewelry Collection',
    description: 'Discover our exquisite collection of premium jewelry. Quality craftsmanship, timeless designs, and exceptional service.',
    creator: '@saanvika',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/firebase-init.js" defer></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                      console.log('ServiceWorker registration successful:', registration.scope);
                    },
                    (err) => {
                      console.log('ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          'selection:bg-gold-500/30'
        )}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <AuthWrapper>
                <CartProvider>{children}</CartProvider>
              </AuthWrapper>
            </AuthProvider>
          </ThemeProvider>
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

