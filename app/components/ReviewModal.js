'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@nextui-org/react";
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewModal({ isOpen, onClose, queueId, onReviewSubmitted, autoPrompt, queueName }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [waitTimeRating, setWaitTimeRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [ambianceRating, setAmbianceRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueId,
          rating,
          title,
          text: review,
          waitTimeRating,
          serviceRating,
          ambianceRating
        })
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error?.includes('duplicate key value')) {
          throw new Error('You have already submitted a review for this queue today');
        }
        throw new Error(data.error || 'Failed to submit review');
      }
      
      toast.success('Review submitted successfully');
      onReviewSubmitted?.();
      onClose();
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          {autoPrompt 
            ? `How was your experience at ${queueName}?`
            : 'Write a Review'
          }
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Overall Rating</label>
              <RatingStars value={rating} onChange={setRating} />
            </div>

            <Input
              label="Review Title"
              placeholder="Sum up your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Textarea
              label="Review"
              placeholder="Share your experience"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              minRows={3}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Wait Time Rating</label>
              <RatingStars value={waitTimeRating} onChange={setWaitTimeRating} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service Rating</label>
              <RatingStars value={serviceRating} onChange={setServiceRating} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ambiance Rating</label>
              <RatingStars value={ambianceRating} onChange={setAmbianceRating} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="bordered" onPress={onClose}>Cancel</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
            Submit Review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 