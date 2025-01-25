'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { Building2, Phone, MapPin, Mail, FileText, Shield, Building } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function BusinessProfilePage() {
  const router = useRouter();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const response = await fetch('/api/onboarding');
      const result = await response.json();

      if (result.success) {
        setBusiness(result.data);
      } else {
        setError(result.message || 'Failed to load business profile');
      }
    } catch (error) {
      setError('Failed to load business profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-danger mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-danger text-lg mb-4">{error}</p>
        <Button 
          color="primary"
          onClick={() => router.push('/onboarding')}
        >
          Create Business Profile
        </Button>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-warning mb-4">
          <Building2 size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-4">No Business Profile Found</h2>
        <p className="text-gray-500 mb-6 text-center">
          You haven't created a business profile yet. Create one to start managing your queues.
        </p>
        <Button 
          color="primary"
          onClick={() => router.push('/onboarding')}
        >
          Create Business Profile
        </Button>
      </div>
    );
  }

  const businessTypes = {
    proprietorship: 'Proprietorship',
    partnership: 'Partnership',
    pvt_ltd: 'Private Limited',
    ltd: 'Limited',
    llp: 'Limited Liability Partnership',
    trust: 'Trust'
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card className="max-w-4xl mx-auto">
        <CardBody className="gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{business.name}</h1>
              <div className="flex gap-2 mt-2">
                <Chip color="primary" variant="flat">{businessTypes[business.business_type]}</Chip>
                <Chip color="secondary" variant="flat">{business.category}</Chip>
              </div>
            </div>
            <Button 
              color="primary" 
              variant="flat"
              onClick={() => router.push('/onboarding')}
            >
              Edit Profile
            </Button>
          </div>

          {/* Description */}
          {business.description && (
            <div className="text-gray-600 dark:text-gray-400">
              {business.description}
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="text-default-400" size={16} />
                  <span>{business.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="text-default-400" size={16} />
                  <span>{business.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="text-default-400" size={16} />
                  <span>{business.address}, {business.city} - {business.pincode}</span>
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal Information</h3>
              <div className="space-y-2">
                {business.gst_number && (
                  <div className="flex items-center gap-2">
                    <FileText className="text-default-400" size={16} />
                    <span>GST: {business.gst_number}</span>
                  </div>
                )}
                {business.pan_number && (
                  <div className="flex items-center gap-2">
                    <FileText className="text-default-400" size={16} />
                    <span>PAN: {business.pan_number}</span>
                  </div>
                )}
                {business.fssai_number && (
                  <div className="flex items-center gap-2">
                    <Shield className="text-default-400" size={16} />
                    <span>FSSAI: {business.fssai_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Date */}
          <div className="text-sm text-gray-500">
            Registered on: {new Date(business.created_at).toLocaleDateString()}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
