import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, getStorage } from "firebase/storage"
import { initializeApp, getApp } from 'firebase/app'

// Get the Firebase app instance
const app = (() => {
  try {
    return getApp();
  } catch {
    return initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }
})();

export class FirebaseStorageService {
  private static storage = getStorage(app);

  // Upload a single image with retry logic
  static async uploadImage(file: File, path: string, maxRetries: number = 3): Promise<string> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Validate file
        if (!file || file.size === 0) {
          throw new Error('Invalid file provided')
        }

        // Check file size (max 5MB for better reliability)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error('File size too large. Maximum size is 5MB.')
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.')
        }

        const timestamp = Date.now()
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
        const fullPath = `${path}/${fileName}`

        console.log(`Uploading file (attempt ${attempt}/${maxRetries}): ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to ${fullPath}`)

        // Create storage reference
        const storageRef = ref(this.storage, fullPath)
        
        // Create upload task with timeout
        const uploadPromise = uploadBytes(storageRef, file)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
        })
        
        const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any
        const downloadURL = await getDownloadURL(snapshot.ref)

        console.log("Image uploaded successfully:", downloadURL)
        return downloadURL
        
      } catch (error: any) {
        lastError = error
        console.error(`Upload attempt ${attempt}/${maxRetries} failed:`, error)
        
        // Don't retry for validation errors
        if (error.message.includes('Invalid file') || 
            error.message.includes('File size too large') || 
            error.message.includes('Invalid file type') ||
            error.code === 'storage/unauthorized' ||
            error.code === 'storage/quota-exceeded') {
          break
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Cap at 5 seconds
          console.log(`Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    // All retries failed, throw the last error with better message
    console.error("All upload attempts failed:", lastError)
    
    // Provide more specific error messages
    if (lastError.code === 'storage/retry-limit-exceeded') {
      throw new Error("Upload failed due to network issues. Please check your internet connection and try again.")
    } else if (lastError.code === 'storage/unauthorized') {
      throw new Error("You don't have permission to upload files. Please make sure you're logged in.")
    } else if (lastError.code === 'storage/canceled') {
      throw new Error("Upload was canceled.")
    } else if (lastError.code === 'storage/unknown') {
      throw new Error("An unknown error occurred during upload. Please try again.")
    } else if (lastError.code === 'storage/invalid-checksum') {
      throw new Error("File was corrupted during upload. Please try again.")
    } else if (lastError.code === 'storage/quota-exceeded') {
      throw new Error("Storage quota exceeded. Please contact support.")
    } else if (lastError.message.includes('timeout')) {
      throw new Error("Upload timed out. Please check your connection and try with a smaller file.")
    } else if (lastError.message) {
      throw new Error(lastError.message)
    } else {
      throw new Error("Failed to upload image after multiple attempts. Please check your connection and try again.")
    }
  }

  // Upload multiple images with individual error handling
  static async uploadImages(files: File[], path: string): Promise<string[]> {
    try {
      console.log(`Starting upload of ${files.length} files...`)
      const uploadResults: Array<{ success: boolean; url?: string; error?: string }> = []
      
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`)
          const url = await this.uploadImage(file, path)
          uploadResults.push({ success: true, url })
        } catch (error: any) {
          console.error(`Failed to upload file ${file.name}:`, error)
          uploadResults.push({ success: false, error: error.message })
        }
        
        // Add small delay between uploads to prevent overwhelming
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      // Check if any uploads succeeded
      const successfulUploads = uploadResults.filter(result => result.success)
      const failedUploads = uploadResults.filter(result => !result.success)
      
      if (successfulUploads.length === 0) {
        // All uploads failed
        const firstError = failedUploads[0]?.error || "Unknown error"
        throw new Error(`All uploads failed. First error: ${firstError}`)
      }
      
      if (failedUploads.length > 0) {
        // Some uploads failed
        console.warn(`${failedUploads.length} out of ${files.length} uploads failed`)
        // Still return successful URLs, but log the failures
        failedUploads.forEach((failure, index) => {
          console.warn(`File ${index + 1} failed: ${failure.error}`)
        })
      }
      
      const urls = successfulUploads.map(result => result.url!).filter(Boolean)
      console.log(`Successfully uploaded ${urls.length} out of ${files.length} files`)
      return urls
      
    } catch (error: any) {
      console.error("Error uploading images:", error)
      throw new Error(error.message || "Failed to upload images")
    }
  }

  // Delete an image
  static async deleteImage(url: string): Promise<void> {
    try {
      const imageRef = ref(this.storage, url)
      await deleteObject(imageRef)
      console.log("Image deleted successfully")
    } catch (error) {
      console.error("Error deleting image:", error)
      throw new Error("Failed to delete image")
    }
  }

  // Get all images in a folder
  static async getImagesInFolder(path: string): Promise<string[]> {
    try {
      const folderRef = ref(this.storage, path)
      const result = await listAll(folderRef)

      const urlPromises = result.items.map((item) => getDownloadURL(item))
      const urls = await Promise.all(urlPromises)

      return urls
    } catch (error) {
      console.error("Error getting images:", error)
      return []
    }
  }
}

