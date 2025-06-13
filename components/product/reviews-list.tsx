"use client"

import { useState, useEffect, useCallback } from 'react'
import { Review } from '@/types/review'
import { Button } from '@/components/ui/button'
import { ReviewCard } from './review-card'
import { ReviewForm } from './review-form'
import { Star, Filter } from 'lucide-react'
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { getFirestore } from '@/lib/firebase'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/auth/auth-provider'

interface ReviewsListProps {
  productId: string
  isAdmin?: boolean
}

type RatingDistribution = {
  1: number
  2: number
  3: number
  4: number
  5: number
}

interface RatingStats {
  average: number
  total: number
  distribution: RatingDistribution
}

export function ReviewsList({ productId, isAdmin }: ReviewsListProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<RatingStats>({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  })
  const [filter, setFilter] = useState<number | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const ensureValidDate = (timestamp: Timestamp | Date | { seconds: number } | string | number | null): Date => {
    try {
      // If it's null, return current date
      if (!timestamp) {
        console.warn('Null timestamp, using current date');
        return new Date();
      }

      // If it's already a Date object
      if (timestamp instanceof Date) {
        // Check if it's a valid date
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid Date object found, using current date');
          return new Date();
        }
        return timestamp;
      }
      
      // If it's a Firestore Timestamp
      if (timestamp instanceof Timestamp) {
        try {
          const date = timestamp.toDate();
          if (isNaN(date.getTime())) {
            console.warn('Invalid Firestore Timestamp, using current date');
            return new Date();
          }
          return date;
        } catch (error) {
          console.warn('Error converting Firestore Timestamp:', error);
          return new Date();
        }
      }
      
      // If it's a timestamp object with seconds
      if (typeof timestamp === 'object' && 'seconds' in timestamp) {
        const date = new Date(timestamp.seconds * 1000);
        if (isNaN(date.getTime())) {
          console.warn('Invalid timestamp seconds, using current date');
          return new Date();
        }
        return date;
      }
      
      // If it's a string, try to parse it
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date;
        }
        console.warn('Invalid date string:', timestamp);
      }
      
      // If it's a number (Unix timestamp)
      if (typeof timestamp === 'number') {
        // Check if it's in seconds or milliseconds
        const dateMs = timestamp > 1000000000000 ? timestamp : timestamp * 1000;
        const date = new Date(dateMs);
        if (!isNaN(date.getTime())) {
          return date;
        }
        console.warn('Invalid numeric timestamp:', timestamp);
      }
      
      // If all else fails, return current date
      console.warn('Unable to parse timestamp, using current date:', timestamp);
      return new Date();
    } catch (error) {
      console.error('Error in ensureValidDate:', error, timestamp);
      return new Date();
    }
  };  const fetchReviews = useCallback(async () => {
    try {
      const db = await getFirestore()
      const reviewsRef = collection(db, 'reviews')
      const q = query(
        reviewsRef,
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const reviewsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const validDate = ensureValidDate(data.createdAt);
        
        return {
          id: doc.id,
          ...data,
          createdAt: validDate
        }
      }) as Review[]
      
      // Filter out any reviews that still have invalid data
      const validReviews = reviewsData.filter(review => {
        try {
          // Additional validation to ensure review has required fields
          return (
            review.rating && 
            review.rating >= 1 && 
            review.rating <= 5 &&
            review.title &&
            review.comment &&
            review.createdAt instanceof Date &&
            !isNaN(review.createdAt.getTime())
          );
        } catch (error) {
          console.warn('Filtering out invalid review:', review.id, error);
          return false;
        }
      });
      
      // Calculate stats
      const total = validReviews.length
      const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let sum = 0
      
      validReviews.forEach(review => {
        const rating = review.rating as 1|2|3|4|5
        distribution[rating] = (distribution[rating] || 0) + 1
        sum += rating
      })
      
      setStats({
        average: total > 0 ? sum / total : 0,
        total,
        distribution
      })
      
      setReviews(validReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    fetchReviews()
  }

  const filteredReviews = filter
    ? reviews.filter((review: Review) => review.rating === filter)
    : reviews

  if (loading) {
    return <div>Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4">
            <ReviewForm
              productId={productId}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}

      {/* Rating Summary */}
      <div className="bg-muted/50 p-6 rounded-xl">
        <div className="flex items-baseline gap-4">
          <div className="text-4xl font-bold">{stats.average.toFixed(1)}</div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(stats.average)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Based on {stats.total} reviews
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2 mt-4">
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => setFilter(filter === rating ? null : rating)}
              className={`w-full flex items-center gap-2 group ${
                filter === rating ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-1 w-12">
                <span>{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
              <Progress
                value={stats.total > 0 ? (stats.distribution[rating as 1|2|3|4|5] / stats.total) * 100 : 0}
                className="h-2 flex-1"
              />
              <span className="w-12 text-sm text-right">
                {stats.distribution[rating as 1|2|3|4|5]}
              </span>
            </button>
          ))}
        </div>

        {/* Write Review Button */}
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            className="gap-2"
            onClick={() => {
              if (!user) {
                alert('Please log in to write a review')
                return
              }
              setShowReviewForm(true)
            }}
          >
            <Star className="h-4 w-4" />
            Write a Review
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      {reviews.length > 0 && filter !== null && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">
              {filter ? `Showing ${filter}-star reviews` : 'All Reviews'}
            </span>
          </div>
          {filter && (
            <Button variant="ghost" size="sm" onClick={() => setFilter(null)}>
              Clear Filter
            </Button>
          )}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <p className="text-muted-foreground">
            {filter
              ? `No ${filter}-star reviews yet`
              : 'No reviews yet. Be the first to review this product!'}
          </p>
          {!filter && (
            <Button
              variant="outline"
              size="lg"
              className="mt-4 gap-2"
              onClick={() => {
                if (!user) {
                  alert('Please log in to write a review')
                  return
                }
                setShowReviewForm(true)
              }}
            >
              <Star className="h-4 w-4" />
              Write a Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review: Review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isAdmin={isAdmin}
              onAdminResponse={async (reviewId, response) => {
                // TODO: Implement admin response functionality
                console.log('Admin response:', { reviewId, response })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
} 
