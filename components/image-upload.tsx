// Component memoized for performance (5.25KB)
"use client"

import type React from "react"
import { useState, useCallback } from "react"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FirebaseStorageService } from "@/lib/firebase/storage"

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void
  initialImages?: string[]
  maxImages?: number
  folder?: string
}

export function ImageUpload({
  onImagesChange,
  initialImages = [],
  maxImages = 5,
  folder = "products",
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return

      const fileArray = Array.from(files)
      const remainingSlots = maxImages - images.length
      const filesToUpload = fileArray.slice(0, remainingSlots)

      if (filesToUpload.length === 0) {
        alert(`Maximum ${maxImages} images allowed`)
        return
      }

      setUploading(true)
      try {
        const uploadedUrls = await FirebaseStorageService.uploadImages(filesToUpload, folder)
        const newImages = [...images, ...uploadedUrls]
        setImages(newImages)
        onImagesChange(newImages)
      } catch (error) {
        console.error("Upload error:", error)
        alert("Failed to upload images. Please try again.")
      } finally {
        setUploading(false)
      }
    },
    [images, maxImages, folder, onImagesChange],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  const removeImage = useCallback(
    async (index: number) => {
      try {
        const imageUrl = images[index]
        await FirebaseStorageService.deleteImage(imageUrl)

        const newImages = images.filter((_, i) => i !== index)
        setImages(newImages)
        onImagesChange(newImages)
      } catch (error) {
        console.error("Error removing image:", error)
        // Still remove from UI even if deletion fails
        const newImages = images.filter((_, i) => i !== index)
        setImages(newImages)
        onImagesChange(newImages)
      }
    },
    [images, onImagesChange],
  )

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || images.length >= maxImages}
        />

        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">Uploading images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Drop images here or click to upload</p>
              <p className="text-xs text-gray-500 mt-1">
                {images.length}/{maxImages} images uploaded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
