'use client';

import { Input, Select, SelectItem, Textarea, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { Building2, Phone, MapPin, Mail, FileText, Globe, Users, Calendar, Shield, Building } from "lucide-react";
import { cityCoordinates } from '../utils/cities';
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState('');

  // Load data from localStorage after component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('onboardingData');
    if (savedData) {
      // Instead of immediately setting data, show the recovery modal
      setShowRecoveryModal(true);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading && Object.keys(data).length > 0) {
      localStorage.setItem('onboardingData', JSON.stringify(data));
    }
  }, [data, isLoading]);

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (Object.keys(data).length > 0) {
        // Store the intended URL
        setPendingNavigation(url);
        setShowExitModal(true);
        // Prevent the navigation
        router.events.emit('routeChangeError');
        throw 'Route change aborted';
      }
    };

    window.addEventListener('popstate', (e) => {
      if (Object.keys(data).length > 0) {
        e.preventDefault();
        setShowExitModal(true);
      }
    });

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [data, router]);

  const handleExit = () => {
    // Clear data and proceed with navigation
    localStorage.removeItem('onboardingData');
    setData({});
    setShowExitModal(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    } else {
      router.back();
    }
  };

  const handleStay = () => {
    setShowExitModal(false);
    setPendingNavigation('');
  };

  // Clear data function
  const clearStoredData = () => {
    localStorage.removeItem('onboardingData');
    setData({});
    setShowRecoveryModal(false);
  };

  // Handle recovering saved data
  const handleRecover = () => {
    const savedData = localStorage.getItem('onboardingData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
    setShowRecoveryModal(false);
  };

  // Auto-save every 2 seconds of inactivity
  const debouncedSave = debounce((newData) => {
    localStorage.setItem('onboardingData', JSON.stringify(newData));
  }, 2000);

  // Validation functions
  const isValidName = (name) => {
    return name && name.trim().length >= 3;
  };

  const isValidLocation = () => {
    return data.city && 
           data.pincode?.length === 6 && 
           data.address?.trim().length >= 10;
  };

  const isValidContact = () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return phoneRegex.test(data.phone) && emailRegex.test(data.email);
  };

  const isValidDocuments = () => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return gstRegex.test(data.gst) && panRegex.test(data.pan);
  };

  const handleChange = (field, value) => {
    let formattedValue = value;
    
    switch (field) {
      case 'phone':
        formattedValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'pincode':
        formattedValue = value.replace(/\D/g, '').slice(0, 6);
        break;
      case 'gst':
      case 'pan':
        formattedValue = value.toUpperCase();
        break;
      default:
        formattedValue = value;
    }

    const newData = {
      ...data,
      [field]: formattedValue
    };
    
    setData(newData);
    debouncedSave(newData);
  };

  const isFoodBusiness = data.category === 'Restaurants' || data.category === 'Food Services';

  const placeholderClasses = "text-gray-400 dark:text-gray-500";

  if (isLoading) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6">
            <CardBody>
              <div className="space-y-8">
                {/* Main Header */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Business Details</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Let's get started by collecting some basic information about your business.
                  </p>
                </div>

                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <Input
                      label="Business Name"
                      placeholder="e.g., Apollo Hospitals, Cafe Coffee Day"
                      value={data.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      variant="bordered"
                      startContent={<Building2 className="text-default-400" size={16} />}
                      classNames={{
                        input: "text-md",
                        label: "text-md font-medium",
                        inputWrapper: "opacity-100",
                        placeholder: placeholderClasses
                      }}
                      color={data.name ? (isValidName(data.name) ? "success" : "danger") : "default"}
                    />

                    <Select
                      label="Business Type"
                      placeholder="Select your business type"
                      selectedKeys={data.businessType ? new Set([data.businessType]) : new Set([])}
                      onSelectionChange={(keys) => handleChange('businessType', Array.from(keys)[0])}
                      variant="bordered"
                      startContent={<Building className="text-default-400" size={16} />}
                      classNames={{
                        trigger: "h-12",
                        label: "text-md font-medium"
                      }}
                    >
                      <SelectItem value="proprietorship">Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="pvt_ltd">Private Limited</SelectItem>
                      <SelectItem value="ltd">Limited Company</SelectItem>
                      <SelectItem value="llp">LLP</SelectItem>
                      <SelectItem value="trust">Trust/NGO</SelectItem>
                    </Select>

                    <Select
                      label="Business Category"
                      placeholder="Select your business category"
                      selectedKeys={data.category ? new Set([data.category]) : new Set([])}
                      onSelectionChange={(keys) => handleChange('category', Array.from(keys)[0])}
                      variant="bordered"
                      classNames={{
                        trigger: "h-12",
                        label: "text-md font-medium"
                      }}
                    >
                      {[/* eslint-disable indent */
                        'Restaurants',
                        'Healthcare',
                        'Retail',
                        'Banking',
                        'Government Services',
                        'Education',
                        'Professional Services',
                        'Entertainment',
                        'Food Services'
                      ].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Location Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Location Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="City"
                        placeholder="Select your city"
                        selectedKeys={data.city ? new Set([data.city]) : new Set([])}
                        onSelectionChange={(keys) => handleChange('city', Array.from(keys)[0])}
                        variant="bordered"
                        startContent={<MapPin className="text-default-400" size={16} />}
                        classNames={{
                          trigger: "h-12",
                          label: "text-md font-medium"
                        }}
                      >
                        {Object.keys(cityCoordinates).map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </Select>

                      <Input
                        label="Pincode"
                        placeholder="e.g., 400001"
                        value={data.pincode || ''}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        variant="bordered"
                        classNames={{
                          input: "text-md",
                          label: "text-md font-medium",
                          placeholder: placeholderClasses
                        }}
                      />
                    </div>

                    <Input
                      label="Business Address"
                      placeholder="e.g., Shop 123, Ground Floor, ABC Complex, MG Road"
                      value={data.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      variant="bordered"
                      startContent={<MapPin className="text-default-400" size={16} />}
                      classNames={{
                        input: "text-md",
                        label: "text-md font-medium",
                        placeholder: placeholderClasses
                      }}
                    />
                  </div>
                </div>

                {/* Contact Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Contact Number"
                      placeholder="e.g., 9876543210"
                      value={data.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      variant="bordered"
                      startContent={<Phone className="text-default-400" size={16} />}
                      classNames={{
                        input: "text-md",
                        label: "text-md font-medium",
                        placeholder: placeholderClasses
                      }}
                    />

                    <Input
                      label="Business Email"
                      placeholder="e.g., contact@yourbusiness.com"
                      value={data.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      variant="bordered"
                      startContent={<Mail className="text-default-400" size={16} />}
                      classNames={{
                        input: "text-md",
                        label: "text-md font-medium",
                        placeholder: placeholderClasses
                      }}
                    />
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Legal Documents</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="GST Number"
                        placeholder="e.g., 27AAACC4175D1ZY"
                        value={data.gst || ''}
                        onChange={(e) => handleChange('gst', e.target.value)}
                        variant="bordered"
                        startContent={<FileText className="text-default-400" size={16} />}
                        classNames={{
                          input: "text-md",
                          label: "text-md font-medium",
                          placeholder: placeholderClasses
                        }}
                      />

                      <Input
                        label="PAN Number"
                        placeholder="e.g., AAACC4175D"
                        value={data.pan || ''}
                        onChange={(e) => handleChange('pan', e.target.value)}
                        variant="bordered"
                        startContent={<FileText className="text-default-400" size={16} />}
                        classNames={{
                          input: "text-md",
                          label: "text-md font-medium",
                          placeholder: placeholderClasses
                        }}
                      />
                    </div>

                    {isFoodBusiness && (
                      <Input
                        label="FSSAI License Number"
                        placeholder="e.g., 12345678901234"
                        value={data.fssai || ''}
                        onChange={(e) => handleChange('fssai', e.target.value)}
                        variant="bordered"
                        startContent={<Shield className="text-default-400" size={16} />}
                        description="Required for food-related businesses"
                        classNames={{
                          input: "text-md",
                          label: "text-md font-medium",
                          placeholder: placeholderClasses
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Description Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <Textarea
                    label="Business Description"
                    placeholder="e.g., We are a multi-specialty hospital providing quality healthcare services since 2010..."
                    value={data.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    variant="bordered"
                    classNames={{
                      input: "text-md",
                      label: "text-md font-medium",
                      placeholder: placeholderClasses
                    }}
                    minRows={3}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recovery Modal */}
      <Modal 
        isOpen={showRecoveryModal} 
        onClose={() => clearStoredData()}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>
            Saved Draft Found
          </ModalHeader>
          <ModalBody>
            <p>
              We found a saved draft of your form. Would you like to continue where you left off?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              variant="light" 
              onPress={() => clearStoredData()}
            >
              Start Fresh
            </Button>
            <Button 
              color="primary" 
              onPress={handleRecover}
            >
              Continue Draft
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Exit Modal */}
      <Modal 
        isOpen={showExitModal} 
        onClose={handleStay}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>
            Unsaved Changes
          </ModalHeader>
          <ModalBody>
            <p>
              You have unsaved changes in your form. Are you sure you want to leave? Your changes will be lost.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              variant="light" 
              onPress={handleStay}
            >
              Stay
            </Button>
            <Button 
              color="primary" 
              onPress={handleExit}
            >
              Leave
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
