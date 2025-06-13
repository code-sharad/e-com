// Image utility functions for handling uploads and processing

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

export class ImageUtils {
  // Convert file to base64 for preview
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Compress image before upload
  static compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          file.type,
          quality,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Generate thumbnail
  static generateThumbnail(file: File, size = 200): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        canvas.width = size
        canvas.height = size

        // Calculate crop area for square thumbnail
        const minDimension = Math.min(img.width, img.height)
        const x = (img.width - minDimension) / 2
        const y = (img.height - minDimension) / 2

        ctx.drawImage(img, x, y, minDimension, minDimension, 0, 0, size, size)
        resolve(canvas.toDataURL())
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Validate image file
  static validateImageFile(file: File, maxSizeInMB = 5): string | null {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]

    if (!allowedTypes.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, WebP, or GIF)"
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      return `Image size must be less than ${maxSizeInMB}MB`
    }

    return null
  }

  // Placeholder for Firebase upload (we'll implement this when setting up Firebase)
  static async uploadToFirebase(file: File, _path: string): Promise<ImageUploadResult> {
    // This will be implemented when we set up Firebase
    // For now, return a mock result
    try {
      const base64 = await this.fileToBase64(file)
      return {
        success: true,
        url: base64, // In Firebase, this would be the download URL
      }
    } catch (_error) {
      return {
        success: false,
        error: "Upload failed",
      }
    }
  }

  // Batch upload multiple images
  static async uploadMultipleImages(files: File[], basePath: string): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map((file, index) => {
      const fileName = `${Date.now()}_${index}_${file.name}`
      return this.uploadToFirebase(file, `${basePath}/${fileName}`)
    })

    return Promise.all(uploadPromises)
  }
}

