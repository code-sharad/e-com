"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background.avif?height=1080&width=1920"
          alt="Luxury Jewelry Collection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <Image src="/logo.png" alt="Global Saanvika" width={120} height={120} className="mx-auto mb-6" />
        </div>

        {/* Main Heading */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
          Exquisite
          <span className="block text-gold-400">Craftsmanship</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in">
          Discover our curated collection of premium jewelry, elegant photo frames, and stunning resin art pieces that
          celebrate timeless beauty and sophistication.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Link href="/category/jewelry">
            <Button
              size="lg"
              className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8 py-3 text-lg group"
            >
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 animate-fade-in">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-gold-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-white mb-2">Premium Quality</h3>
            <p className="text-gray-300 text-sm">Handcrafted with the finest materials</p>
          </div>

          <div className="text-center">
            <Sparkles className="h-8 w-8 text-gold-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-white mb-2">Unique Designs</h3>
            <p className="text-gray-300 text-sm">Exclusive pieces you won&apos;t find elsewhere</p>
          </div>

          <div className="text-center">
            <Sparkles className="h-8 w-8 text-gold-400 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-white mb-2">Timeless Elegance</h3>
            <p className="text-gray-300 text-sm">Designs that transcend trends</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gold-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gold-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
