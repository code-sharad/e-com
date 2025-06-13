"use client"

import { Star, Heart, CheckCircle } from 'lucide-react'
import { Review } from '@/types/review'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { Timestamp } from 'firebase/firestore'

interface ReviewCardProps {
  review: Review
  isAdmin?: boolean
  onAdminResponse: (reviewId: string, response: string) => Promise<void>
}

export function ReviewCard({ review, isAdmin, onAdminResponse }: ReviewCardProps) {
  const formatDate = (date: Date | string | number | Timestamp) => {
    if (date instanceof Timestamp) {
      return formatDistanceToNow(date.toDate(), { addSuffix: true })
    }
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date)
      : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  }

  const formattedDate = formatDate(review.createdAt)

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{review.userName}</h3>
            {review.verified && (
              <span className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {formattedDate}
            </span>
          </div>
        </div>
        {!isAdmin && (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Heart className="h-4 w-4 mr-1" />
            {review.likes || 0}
          </Button>
        )}
      </div>

      <div>
        <h4 className="font-medium">{review.title}</h4>
        <p className="mt-1 text-muted-foreground">{review.comment}</p>
      </div>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-2">
          {review.images.map((image, index) => (
            <div key={index} className="relative w-20 h-20">
              <Image
                src={image}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {review.adminResponse && (
        <div className="mt-4 pl-4 border-l-2">
          <p className="text-sm font-medium">Response from Global Saanvika:</p>
          <p className="mt-1 text-sm text-muted-foreground">{review.adminResponse}</p>
        </div>
      )}

      {isAdmin && !review.adminResponse && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              const response = prompt('Enter your response to this review:')
              if (response && onAdminResponse) {
                onAdminResponse(review.id!, response)
              }
            }}
          >
            Respond to Review
          </Button>
        </div>
      )}
    </div>
  )
} 
