"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/firebase/image-upload'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getFirestore } from '@/lib/firebase'
import { useAuth } from '@/components/auth/auth-provider'

interface ReviewFormProps {
  productId: string
  onSuccess: () => void
  onCancel: () => void
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to submit a review')
      return
    }

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!title.trim()) {
      setError('Please enter a review title')
      return
    }

    if (!comment.trim()) {
      setError('Please enter your review')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const reviewData = {
        productId,
        userId: user.uid,
        userName: user.name || 'Anonymous',
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
        createdAt: serverTimestamp(),
        verified: true, // You might want to check if the user has actually purchased the product
        likes: 0
      }

      const db = await getFirestore()
      await addDoc(collection(db, 'reviews'), reviewData)
      onSuccess()
    } catch (error) {
      console.error('Error submitting review:', error)
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
      <h3 className="text-2xl font-semibold mb-6">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Your Rating *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Review Title *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
          />
        </div>

        {/* Review Comment */}
        <div className="space-y-2">
          <label htmlFor="comment" className="block text-sm font-medium">
            Your Review *
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
            placeholder="Share your experience with this product"
            rows={4}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Add Photos</label>
          <ImageUpload
            onImagesChange={setImages}
            initialImages={images}
            maxImages={3}
            folder="reviews"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 
