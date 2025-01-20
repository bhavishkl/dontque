'use client'

import { useState } from 'react';
import { Button, Card, CardBody, Progress } from "@nextui-org/react";
import BusinessDetailsStep from '../components/OnboardingSteps/BusinessDetailsStep';
import QueueConfigStep from '../components/OnboardingSteps/QueueConfigStep';
import ServicesStep from '../components/OnboardingSteps/ServicesStep';
import StaffingStep from '../components/OnboardingSteps/StaffingStep';
import ReviewStep from '../components/OnboardingSteps/ReviewStep';
import SuccessStep from '../components/OnboardingSteps/SuccessStep';
import { completeOnboarding } from '../utils/onboardingUtils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueId, setQueueId] = useState(null);
  const [formData, setFormData] = useState({
    business: {},
    queue: {},
    services: [],
    staff: []
  });

  const totalSteps = 6;
  
  const handleNext = async () => {
    if (currentStep === 5) {
      // Handle form submission
      setIsSubmitting(true);
      try {
        const result = await completeOnboarding(formData);
        if (result.success) {
          setQueueId(result.queueId);
          setCurrentStep(6);
          toast.success('Queue setup completed successfully!');
        } else {
          toast.error('Failed to complete setup: ' + result.error);
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Setup error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return <BusinessDetailsStep 
          data={formData.business} 
          onUpdate={(data) => updateFormData('business', data)} 
        />;
      case 2:
        return <QueueConfigStep 
          data={formData.queue} 
          onUpdate={(data) => updateFormData('queue', data)} 
        />;
      case 3:
        return <ServicesStep 
          data={formData.services} 
          onUpdate={(data) => updateFormData('services', data)} 
        />;
      case 4:
        return <StaffingStep 
          data={formData.staff} 
          onUpdate={(data) => updateFormData('staff', data)} 
        />;
      case 5:
        return <ReviewStep formData={formData} />;
      case 6:
        return <SuccessStep queueId={queueId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="w-full">
          <CardBody className="p-6">
            {/* Progress Bar */}
            <div className="mb-8">
              <Progress 
                value={(currentStep / totalSteps) * 100}
                className="h-2"
                color="primary"
              />
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep} of {totalSteps}
              </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            {currentStep < 6 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="flat"
                  color="default"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>
                <Button
                  color="primary"
                  onClick={handleNext}
                  isLoading={isSubmitting}
                >
                  {currentStep === 5 ? 'Complete Setup' : 'Next Step'}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
} 