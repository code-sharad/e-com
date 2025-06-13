"use client"

import * as React from "react"
import Image from "next/image"
import { useState } from "react"

interface EnhancedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  fallbackSrc?: string
  onError?: () => void
}

export function EnhancedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  fallbackSrc = "/placeholder.jpg",
  onError,
  ...props
}: EnhancedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
      onError?.()
    }
  }

  // Reset error state when src changes
  React.useEffect(() => {
    if (src !== imgSrc && !hasError) {
      setImgSrc(src)
    }
  }, [src, imgSrc, hasError])

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    priority,
    onError: handleError,
    ...props
  }
  if (fill) {
    return <Image {...imageProps} fill alt={alt} />
  }

  return <Image {...imageProps} width={width} height={height} alt={alt} />
}

