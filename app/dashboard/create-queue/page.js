'use client'

import { Input, Select, SelectItem, Switch, Card, CardBody, Button, Chip } from "@nextui-org/react";
import { Clock, Users, Plus, X, Edit2, DollarSign, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { cityCoordinates } from "@/app/utils/cities";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateQueuePage() {
  const router = useRouter();
  // Initialize state with default values and generate queue UUID on mount
  const [data, setData] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    location: '',
    address: '',
    openingTime: '',
    closingTime: '',
    counters: [],
    services: [],
    staff: []
  });

  // Generate queue UUID when component mounts
  useEffect(() => {
    setData(prev => ({
      ...prev,
      id: uuidv4()
    }));
  }, []);

  const [showCounterForm, setShowCounterForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffEnabled, setStaffEnabled] = useState(false);
  const [counterData, setCounterData] = useState({
    name: "",
    maxCapacity: "",
    serviceStartTime: ""
  });
  const [serviceData, setServiceData] = useState({
    name: "",
    estTimeToServe: "", // Changed from duration to estTimeToServe
    price: "",
    description: "",
    linkedCounters: []
  });
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: '',
    assignedCounter: ''
  });
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);
  const [editingStaffIndex, setEditingStaffIndex] = useState(null);

  const roles = [
    { value: 'manager', label: 'Queue Manager' },
    { value: 'operator', label: 'Counter Operator' },
    { value: 'assistant', label: 'Queue Assistant' }
  ];

  const handleChange = (field, value) => {
    setData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleAddCounter = () => {
    const counters = data.counters || [];
    const counterWithId = {
      ...counterData,
      id: uuidv4(),
      maxCapacity: counterData.maxCapacity ? parseInt(counterData.maxCapacity) : 0
    };
    
    setData(prevData => ({
      ...prevData,
      counters: [...counters, counterWithId]
    }));
    setCounterData({
      name: "",
      maxCapacity: "",
      serviceStartTime: ""
    });
    setShowCounterForm(false);
  };

  const handleAddService = () => {
    const services = data.services || [];
    const serviceWithId = {
      ...serviceData,
      id: uuidv4()
    };

    if (editingServiceIndex !== null) {
      const updatedServices = [...services];
      updatedServices[editingServiceIndex] = serviceWithId;
      handleChange('services', updatedServices);
      setEditingServiceIndex(null);
    } else {
      handleChange('services', [...services, serviceWithId]);
    }
    setServiceData({
      name: "",
      estTimeToServe: "",
      price: "",
      description: "",
      linkedCounters: []
    });
    setShowServiceForm(false);
  };

  const handleEditService = (index) => {
    setServiceData(data.services[index]);
    setEditingServiceIndex(index);
    setShowServiceForm(true);
  };

  const handleDeleteService = (index) => {
    const updatedServices = (data.services || []).filter((_, i) => i !== index);
    handleChange('services', updatedServices);
  };

  const handleAddStaff = () => {
    const staff = data.staff || [];
    const staffWithId = {
      ...newStaff,
      id: uuidv4()
    };

    if (editingStaffIndex !== null) {
      const updatedStaff = [...staff];
      updatedStaff[editingStaffIndex] = staffWithId;
      handleChange('staff', updatedStaff);
      setEditingStaffIndex(null);
    } else {
      handleChange('staff', [...staff, staffWithId]);
    }
    setNewStaff({
      name: '',
      email: '',
      role: '',
      assignedCounter: ''
    });
    setShowStaffForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading toast
    const loadingToast = toast.loading('Creating queue...');
    
    try {
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (!response.ok) {
        toast.error(result.message || 'Failed to create queue');
        return;
      }
      
      if (result.success) {
        // Show success toast and redirect
        toast.success('Queue created successfully', {
          description: 'Redirecting to dashboard...',
          duration: 2000,
        });
        
        // Short delay before redirect to show the success message
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh(); // Refresh the page data
        }, 1000);
      } else {
        toast.error(result.message || 'Failed to create queue');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error creating queue:', error);
      toast.error('Failed to create queue');
    }
  };

  // Common fields for all queue types
  const renderCommonFields = () => (
    <div className="space-y-6">
      {/* Basic Queue Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <Input
          label="Queue Name"
          placeholder="Enter queue name"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          isRequired
        />
        <Input
          label="Description"
          placeholder="Brief description of your queue"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        <Select
          label="Category"
          placeholder="Select queue category"
          selectedKeys={data.category ? new Set([data.category]) : new Set([])}
          onSelectionChange={(keys) => handleChange('category', Array.from(keys)[0])}
        >
          <SelectItem key="retail">Retail</SelectItem>
          <SelectItem key="healthcare">Healthcare</SelectItem>
          <SelectItem key="government">Government</SelectItem>
          <SelectItem key="education">Education</SelectItem>
          <SelectItem key="restaurant">Restaurant</SelectItem>
          <SelectItem key="other">Other</SelectItem>
        </Select>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location Details</h3>
          <Select
            label="City"
            placeholder="Select city"
            selectedKeys={data.location ? new Set([data.location]) : new Set([])}
            onSelectionChange={(keys) => handleChange('location', Array.from(keys)[0])}
          >
            {Object.keys(cityCoordinates).map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </Select>
          <Input
            label="Complete Address"
            placeholder="Enter detailed address"
            value={data.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>
      </div>

      {/* Operating Hours */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Operating Hours</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="time"
            label="Opening Time"
            value={data.openingTime || ''}
            onChange={(e) => handleChange('openingTime', e.target.value)}
            isRequired
          />
          <Input
            type="time"
            label="Closing Time"
            value={data.closingTime || ''}
            onChange={(e) => handleChange('closingTime', e.target.value)}
            isRequired
          />
        </div>
      </div>
    </div>
  );

  // Advanced queue specific fields
  const renderAdvancedFields = () => (
    <div className="space-y-6">
      {/* Counters Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Service Counters</h3>
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={() => setShowCounterForm(true)}
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Counter
          </Button>
        </div>

        {showCounterForm && (
          <Card>
            <CardBody className="space-y-4">
              <Input
                label="Counter Name"
                placeholder="Enter counter name"
                value={counterData.name}
                onChange={(e) => setCounterData({...counterData, name: e.target.value})}
              />
              <Input
                type="number"
                label="Maximum Capacity"
                placeholder="Maximum customers for this counter"
                startContent={<Users className="w-4 h-4 text-gray-400" />}
                value={counterData.maxCapacity || ''}
                onChange={(e) => setCounterData({...counterData, maxCapacity: e.target.value})}
              />
              <Input
                type="time"
                label="Service Start Time"
                value={counterData.serviceStartTime}
                onChange={(e) => setCounterData({...counterData, serviceStartTime: e.target.value})}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  color="danger"
                  variant="flat"
                  onClick={() => setShowCounterForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleAddCounter}
                >
                  Add Counter
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Display added counters */}
        <div className="space-y-3">
          {(data.counters || []).map((counter, index) => (
            <Card key={index}>
              <CardBody>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{counter.name}</h4>
                    <p className="text-sm text-gray-600">
                      {counter.maxCapacity > 0 && `Max Capacity: ${counter.maxCapacity} • `}
                      {counter.serviceStartTime && `Starts at ${counter.serviceStartTime}`}
                    </p>
                  </div>
                  <Button
                    color="danger"
                    variant="light"
                    size="sm"
                    onClick={() => {
                      const updatedCounters = data.counters.filter((_, i) => i !== index);
                      handleChange('counters', updatedCounters);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Available Services</h3>
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={() => setShowServiceForm(true)}
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Service
          </Button>
        </div>

        {showServiceForm && (
          <Card>
            <CardBody className="space-y-4">
              <Input
                label="Service Name"
                placeholder="Enter service name"
                value={serviceData.name}
                onChange={(e) => setServiceData({...serviceData, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Estimated Time to Serve (minutes)"
                  placeholder="Average time per customer"
                  startContent={<Clock className="w-4 h-4 text-gray-400" />}
                  value={serviceData.estTimeToServe}
                  onChange={(e) => setServiceData({...serviceData, estTimeToServe: e.target.value})}
                />
                <Input
                  type="number"
                  label="Price"
                  placeholder="Service price"
                  startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
                  value={serviceData.price}
                  onChange={(e) => setServiceData({...serviceData, price: e.target.value})}
                />
              </div>
              <Input
                label="Description"
                placeholder="Service description"
                value={serviceData.description}
                onChange={(e) => setServiceData({...serviceData, description: e.target.value})}
              />
              
              {/* Counter Linking Select */}
              <Select
                label="Link to Counters"
                placeholder="Select counters for this service"
                selectionMode="multiple"
                selectedKeys={new Set(serviceData.linkedCounters || [])}
                onSelectionChange={(keys) => setServiceData({
                  ...serviceData,
                  linkedCounters: Array.from(keys)
                })}
                className="w-full"
              >
                {(data.counters || []).map((counter) => (
                  <SelectItem key={counter.id} value={counter.id}>
                    {counter.name}
                  </SelectItem>
                ))}
              </Select>

              <div className="flex gap-2 justify-end">
                <Button
                  color="danger"
                  variant="flat"
                  onClick={() => setShowServiceForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleAddService}
                >
                  {editingServiceIndex !== null ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Display added services */}
        <div className="space-y-3">
          {(data.services || []).map((service, index) => (
            <Card key={index}>
              <CardBody className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-medium">{service.name}</h4>
                  <div className="flex gap-2">
                    <Chip size="sm" color="primary">{service.estTimeToServe} min</Chip>
                    {service.price && <Chip size="sm" color="secondary">${service.price}</Chip>}
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600">{service.description}</p>
                  )}
                  {/* Display linked counters */}
                  {service.linkedCounters && service.linkedCounters.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      <span className="text-sm text-gray-500">Counters:</span>
                      {service.linkedCounters.map((counterId) => (
                        <Chip 
                          key={counterId} 
                          size="sm" 
                          variant="flat"
                        >
                          {data.counters.find(c => c.id === counterId)?.name}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => handleEditService(index)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onClick={() => handleDeleteService(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Staff Management Section */}
      <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Staff Management</h3>
            <Switch 
              checked={staffEnabled}
              onChange={(e) => {
                setStaffEnabled(e.target.checked);
                if (!e.target.checked) {
                  handleChange('staff', []);
                }
              }}
            >
              Enable Staff Management
            </Switch>
          </div>

          {staffEnabled && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Add staff members who will manage your queue operations.</p>
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  onClick={() => setShowStaffForm(true)}
                  startContent={<Plus className="w-4 h-4" />}
                >
                  Add Staff
                </Button>
              </div>

              {showStaffForm && (
                <Card className="bg-gray-50 dark:bg-gray-800">
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Staff Name"
                        placeholder="Enter staff name"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      />
                      <Input
                        label="Email"
                        placeholder="Enter staff email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Role"
                        placeholder="Select role"
                        selectedKeys={newStaff.role ? new Set([newStaff.role]) : new Set([])}
                        onSelectionChange={(keys) => setNewStaff({ ...newStaff, role: Array.from(keys)[0] })}
                      >
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="Assigned Counter"
                        placeholder="Select counter (optional)"
                        selectedKeys={newStaff.assignedCounter ? new Set([newStaff.assignedCounter]) : new Set([])}
                        onSelectionChange={(keys) => setNewStaff({ ...newStaff, assignedCounter: Array.from(keys)[0] })}
                      >
                        {(data.counters || []).map((counter, index) => (
                          <SelectItem key={index.toString()} value={index.toString()}>
                            {counter.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        color="danger"
                        variant="flat"
                        onClick={() => {
                          setShowStaffForm(false);
                          setNewStaff({ name: '', email: '', role: '', assignedCounter: '' });
                          setEditingStaffIndex(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        startContent={<UserPlus className="w-4 h-4" />}
                        onClick={handleAddStaff}
                      >
                        {editingStaffIndex !== null ? 'Update Staff' : 'Add Staff Member'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Staff List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Staff List</h3>
                  <Chip startContent={<Users className="w-4 h-4" />}>
                    {(data.staff || []).length} Members
                  </Chip>
                </div>

                {(data.staff || []).map((staff, index) => (
                  <Card key={index} className="bg-white dark:bg-gray-800">
                    <CardBody className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{staff.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {staff.email}
                        </p>
                        <div className="flex gap-2">
                          <Chip size="sm" color="primary">
                            {roles.find(r => r.value === staff.role)?.label}
                          </Chip>
                          {staff.assignedCounter && (
                            <Chip size="sm">
                              Counter: {data.counters[parseInt(staff.assignedCounter)]?.name}
                            </Chip>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => {
                            setNewStaff(staff);
                            setEditingStaffIndex(index);
                            setShowStaffForm(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onClick={() => {
                            const updatedStaff = (data.staff || []).filter((_, i) => i !== index);
                            handleChange('staff', updatedStaff);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Create New Queue</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your queue settings and start managing your customers efficiently.
          </p>
        </div>

        {/* Common fields */}
        {renderCommonFields()}

        {/* Advanced queue settings */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Advanced Queue Settings</h3>
          {renderAdvancedFields()}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            color="danger"
            variant="flat"
            size="lg"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            size="lg"
            type="submit"
          >
            Create Queue
          </Button>
        </div>
      </form>
    </div>
  );
}
