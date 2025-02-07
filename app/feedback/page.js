'use client'

import { useState } from 'react';
import { Card, CardBody, Textarea, Button, Avatar, Progress, Chip } from '@nextui-org/react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useUserInfo } from '@/app/hooks/useUserName';
import { useApi } from '@/app/hooks/useApi';

export default function AppFeedbackPage() {
  const { data: session } = useSession();
  const { name, role, image } = useUserInfo(session?.user?.id);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Build the API URL with aggregates and pagination parameters.
  const apiUrl = `/api/feedback?aggregates=true&page=${currentPage}&limit=${limit}`;
  const { data: responseData, isLoading, mutate: refreshFeedback } = useApi(apiUrl);

  // Destructure the aggregates and paginated feedback list from our response.
  const aggregates = responseData?.aggregates || {};
  const feedbackList = responseData?.feedback || [];
  const totalFeedback = responseData?.total || 0;
  const totalPages = Math.ceil(totalFeedback / limit);

  // Use the aggregated average rating (or 0 if undefined).
  const averageRating = aggregates.average || 0;

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          feedback_text: feedbackText,
          user_role: role,
          user_name: name,
          user_image: image,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }
      // Refresh to get new feedback and updated aggregates.
      refreshFeedback();
      toast.success('Feedback submitted successfully');
      setRating(0);
      setFeedbackText('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(star)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
      {/* Submit Feedback Card */}
      <Card className="bg-white/95 backdrop-blur-md border-white/20">
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Submit App Feedback</h2>
            {role && (
              <Chip
                className="capitalize bg-orange-100 text-orange-500 border-orange-200"
                variant="flat"
              >
                {role}
              </Chip>
            )}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              src={image}
              name={name}
              size="md"
              className="border-2 border-orange-200"
            />
            <div>
              <div className="font-semibold">{name}</div>
              <RatingStars />
            </div>
          </div>
          <div className="mb-4">
            <Textarea
              label="Feedback"
              placeholder="Share your thoughts about the app..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              minRows={3}
              classNames={{
                input: 'bg-white/95 backdrop-blur-md',
                label: 'text-gray-600',
              }}
            />
          </div>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="w-full bg-orange-500 text-white hover:bg-orange-600"
          >
            Submit Feedback
          </Button>
        </CardBody>
      </Card>

      {/* Aggregates Card */}
      <Card className="bg-white/95 backdrop-blur-md border-white/20">
        <CardBody>
          <div className="text-center">
            <div className="text-4xl font-bold">{averageRating}</div>
            <div className="flex justify-center my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Based on {aggregates.total || 0} reviews
            </div>
            <div className="mt-4 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{star} stars</div>
                  <Progress
                    value={(aggregates[`star${star}`] / (aggregates.total || 1)) * 100}
                    classNames={{
                      base: 'bg-gray-100',
                      indicator: 'bg-orange-500',
                    }}
                  />
                  <div className="w-12 text-sm text-right">
                    {aggregates[`star${star}`]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Recent Feedback</h3>
        {isLoading ? (
          <div className="text-center text-gray-600">Loading feedback...</div>
        ) : feedbackList.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-md border-white/20">
            <CardBody>
              <p className="text-center text-gray-500">No feedback yet</p>
            </CardBody>
          </Card>
        ) : (
          feedbackList.map((feedback) => (
            <Card
              key={feedback.feedback_id}
              className="bg-white/95 backdrop-blur-md border-white/20"
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <Avatar
                    src={feedback.user_image}
                    name={feedback.user_name}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {feedback.user_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= feedback.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(feedback.created_at)}
                      </span>
                    </div>
                    {feedback.feedback_text && (
                      <p className="text-gray-600">{feedback.feedback_text}</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <Button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="bg-gray-300 hover:bg-gray-400"
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          disabled={currentPage >= totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="bg-gray-300 hover:bg-gray-400"
        >
          Next
        </Button>
      </div>
    </div>
  );
} 