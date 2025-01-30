'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Card, CardBody, Textarea, Chip } from "@nextui-org/react";
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useUserInfo } from '@/app/hooks/useUserName';
import { useApi } from '@/app/hooks/useApi';

export default function FeedbackPage() {
  const { data: session } = useSession();
  const { role } = useUserInfo(session?.user?.id);
  const [formData, setFormData] = useState({
    userType: 'b2c',
    overallRating: 0,
    easeOfUseRating: 0,
    featureSatisfactionRating: 0,
    uiRating: 0,
    likedFeatures: [],
    improvementSuggestions: '',
    bugReport: '',
    featureRequests: '',
    businessValueRating: 0,
    customerSupportRating: 0,
    integrationEaseRating: 0,
    pricingSatisfactionRating: 0,
    businessImpact: '',
    roiFeedback: ''
  });

  // Debug log to see the actual role value
  useEffect(() => {
    console.log('User role from useUserInfo:', role);
  }, [role]);

  // Updated condition to check for 'business' role
  useEffect(() => {
    if (role === 'business') {
      setFormData(prev => ({ ...prev, userType: 'b2b' }));
    }
  }, [role]);

  // Updated condition to match the role value
  const isB2B = role === 'business';

  const featureSuggestions = [
    'Queue Management',
    'Real-time Updates',
    'Customer Notifications',
    'Analytics Dashboard',
    'Staff Management',
    'Mobile App',
    'Integration Options'
  ];

  const RatingStars = ({ value, onChange, size = "md" }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`${
              size === "sm" ? "w-4 h-4" : "w-6 h-6"
            } ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const data = await response.json();
      
      toast.success('Thank you for your feedback!');
      // Reset form
      setFormData({
        userType: isB2B ? 'b2b' : 'b2c',
        overallRating: 0,
        easeOfUseRating: 0,
        featureSatisfactionRating: 0,
        uiRating: 0,
        likedFeatures: [],
        improvementSuggestions: '',
        bugReport: '',
        featureRequests: '',
        businessValueRating: 0,
        customerSupportRating: 0,
        integrationEaseRating: 0,
        pricingSatisfactionRating: 0,
        businessImpact: '',
        roiFeedback: ''
      });
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const RatingItem = ({ label, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <RatingStars value={value} onChange={onChange} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardBody className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">App Feedback</h1>
            <p className="text-gray-600">
              {isB2B 
                ? "Help us improve your business experience"
                : "Help us improve your experience"
              }
            </p>
            <Chip 
              className="mt-2"
              color={isB2B ? "primary" : "secondary"}
              variant="flat"
            >
              {isB2B ? "Business Owner" : "Customer"}
            </Chip>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Overall Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RatingItem 
                  label="Overall Rating"
                  value={formData.overallRating}
                  onChange={(value) => setFormData({ ...formData, overallRating: value })}
                />
                <RatingItem 
                  label="Ease of Use"
                  value={formData.easeOfUseRating}
                  onChange={(value) => setFormData({ ...formData, easeOfUseRating: value })}
                />
                <RatingItem 
                  label="Feature Satisfaction"
                  value={formData.featureSatisfactionRating}
                  onChange={(value) => setFormData({ ...formData, featureSatisfactionRating: value })}
                />
                <RatingItem 
                  label="UI/UX Design"
                  value={formData.uiRating}
                  onChange={(value) => setFormData({ ...formData, uiRating: value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Features & Improvements</h3>
              <div className="flex flex-wrap gap-2">
                {featureSuggestions.map((feature) => (
                  <Chip
                    key={feature}
                    variant="flat"
                    className="cursor-pointer"
                    onClick={() => {
                      const newFeatures = formData.likedFeatures.includes(feature)
                        ? formData.likedFeatures.filter(f => f !== feature)
                        : [...formData.likedFeatures, feature];
                      setFormData({ ...formData, likedFeatures: newFeatures });
                    }}
                    color={formData.likedFeatures.includes(feature) ? "primary" : "default"}
                  >
                    {feature}
                  </Chip>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="Suggestions for Improvement"
                  placeholder="What could we do better?"
                  value={formData.improvementSuggestions}
                  onChange={(e) => setFormData({ ...formData, improvementSuggestions: e.target.value })}
                />
                <Textarea
                  label="Bug Report"
                  placeholder="Did you encounter any issues?"
                  value={formData.bugReport}
                  onChange={(e) => setFormData({ ...formData, bugReport: e.target.value })}
                />
              </div>
              <Textarea
                label="Feature Requests"
                placeholder="What features would you like to see?"
                value={formData.featureRequests}
                onChange={(e) => setFormData({ ...formData, featureRequests: e.target.value })}
              />
            </div>

            {isB2B && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RatingItem 
                    label="Business Value"
                    value={formData.businessValueRating}
                    onChange={(value) => setFormData({ ...formData, businessValueRating: value })}
                  />
                  <RatingItem 
                    label="Customer Support"
                    value={formData.customerSupportRating}
                    onChange={(value) => setFormData({ ...formData, customerSupportRating: value })}
                  />
                  <RatingItem 
                    label="Integration Ease"
                    value={formData.integrationEaseRating}
                    onChange={(value) => setFormData({ ...formData, integrationEaseRating: value })}
                  />
                  <RatingItem 
                    label="Pricing Satisfaction"
                    value={formData.pricingSatisfactionRating}
                    onChange={(value) => setFormData({ ...formData, pricingSatisfactionRating: value })}
                  />
                  <Textarea
                    label="Business Impact"
                    placeholder="How has our app impacted your business operations?"
                    value={formData.businessImpact}
                    onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
                    className="md:col-span-2"
                  />
                  <Textarea
                    label="ROI Feedback"
                    placeholder="What kind of return on investment have you seen?"
                    value={formData.roiFeedback}
                    onChange={(e) => setFormData({ ...formData, roiFeedback: e.target.value })}
                    className="md:col-span-2"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full"
            >
              Submit Feedback
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
} 