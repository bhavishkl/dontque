'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Progress } from "@nextui-org/react";
import { Star, ThumbsUp } from 'lucide-react';

export default function ReviewsList({ queueId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [queueId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?queueId=${queueId}`);
      const data = await response.json();
      console.log(data);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRatingStats = () => {
    const total = reviews.length;
    const stats = {
      average: reviews.reduce((sum, r) => sum + r.rating, 0) / total,
      distribution: Array(5).fill(0)
    };
    
    reviews.forEach(r => stats.distribution[r.rating - 1]++);
    return stats;
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  const stats = calculateRatingStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats.average.toFixed(1)}</div>
              <div className="flex justify-center my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= stats.average
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {reviews.length} reviews
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{rating} stars</div>
                  <Progress
                    value={(stats.distribution[rating - 1] / reviews.length) * 100}
                    className="flex-1"
                  />
                  <div className="w-12 text-sm text-right">
                    {stats.distribution[rating - 1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.rating_id}>
            <CardBody>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {review.user_profile.image && (
                      <img
                        src={review.user_profile.image}
                        alt={review.user_profile.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{review.user_profile.name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {review.review_title && (
                <h4 className="font-medium mb-2">{review.review_title}</h4>
              )}
              <p className="text-gray-600">{review.review_text}</p>
              
              <div className="mt-4 flex gap-6 text-sm text-gray-600">
                <div>Wait Time: {review.wait_time_rating}/5</div>
                <div>Service: {review.service_rating}/5</div>
                <div>Ambiance: {review.ambiance_rating}/5</div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
} 