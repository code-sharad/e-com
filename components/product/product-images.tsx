"use client"

import * as React from "react"
import Image from "next/image"
import { useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ProductImagesProps {
  images: string[]
  name: string
}

export function ProductImages({ images, name }: ProductImagesProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]))
  }

  // If no images provided, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
        <Image
          src="/placeholder.jpg"
          alt={name}
          fill
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden"
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-square">
              <Image
                src={imageErrors.has(index) ? "/placeholder.jpg" : image}
                alt={`${name} - View ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                onError={() => handleImageError(index)}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  )
} 
