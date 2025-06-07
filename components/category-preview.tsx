"use client"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const categories = [
  {
    name: "Jewelry",
    description: "Exquisite handcrafted jewelry pieces",
    image: "/Jewe.avif?height=500&width=400",
    href: "/category/jewelry",
    count: "150+ pieces",
  },
  {
    name: "Photo Frames",
    description: "Elegant frames for your precious memories",
    image: "/photo_frame.avif?height=500&width=400",
    href: "/category/photo-frames",
    count: "80+ designs",
  },
  {
    name: "Resin Art",
    description: "Stunning contemporary resin artwork",
    image: "/ocean-art1.jpg?height=500&width=400",
    href: "/category/resin-art",
    count: "60+ creations",
  },
]

export default function CategoryPreview() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explore Our Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From timeless jewelry to contemporary art pieces, discover the perfect addition to your collection across
            our diverse range of categories.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-lg bg-card shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gold-400 font-medium">{category.count}</span>
                    <ArrowRight className="h-5 w-5 text-gold-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <h3 className="font-serif text-2xl font-bold mb-2">{category.name}</h3>

                  <p className="text-gray-200 text-sm">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
