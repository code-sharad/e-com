import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage"
import { storage } from "@/lib/firebase"

export class FirebaseStorageService {
  // Upload a single image
  static async uploadImage(file: File, path: string): Promise<string> {
    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const fullPath = `${path}/${fileName}`

      const storageRef = ref(storage, fullPath)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      console.log("Image uploaded successfully:", downloadURL)
      return downloadURL
    } catch (error) {
      console.error("Error uploading image:", error)
      throw new Error("Failed to upload image")
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
      const imageRef = ref(storage, url)
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
      const folderRef = ref(storage, path)
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
