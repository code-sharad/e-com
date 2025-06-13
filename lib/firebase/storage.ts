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

  // Upload a single image
  static async uploadImage(file: File, path: string): Promise<string> {
    try {
      // Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file provided')
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB.')
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.')
      }

      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const fullPath = `${path}/${fileName}`

      console.log(`Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to ${fullPath}`)

      const storageRef = ref(this.storage, fullPath)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      console.log("Image uploaded successfully:", downloadURL)
      return downloadURL
    } catch (error: any) {
      console.error("Error uploading image:", error)
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error("You don't have permission to upload files. Please make sure you're logged in.")
      } else if (error.code === 'storage/canceled') {
        throw new Error("Upload was canceled.")
      } else if (error.code === 'storage/unknown') {
        throw new Error("An unknown error occurred during upload. Please try again.")
      } else if (error.code === 'storage/invalid-checksum') {
        throw new Error("File was corrupted during upload. Please try again.")
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error("Storage quota exceeded. Please contact support.")
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error("Failed to upload image. Please check your connection and try again.")
      }
    }
  }

  // Upload multiple images
  static async uploadImages(files: File[], path: string): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => this.uploadImage(file, path))
      const urls = await Promise.all(uploadPromises)
      return urls
    } catch (error) {
      console.error("Error uploading images:", error)
      throw new Error("Failed to upload images")
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

