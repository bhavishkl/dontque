'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Select, SelectItem } from "@nextui-org/react"
import { toast } from 'sonner'
import TimePicker from '../../components/UserLayout/TimePicker'
import { cityCoordinates } from '../../utils/cities'

const categories = [
  'Restaurants',
  'Retail',
  'Healthcare',
  'Government',
  'Entertainment',
  'Education',
  'Banking',
  'Fitness',
]

export default function CreateQueuePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    max_capacity: '',
    opening_time: '',
    closing_time: '',
    est_time_to_serve: '',
    service_start_time: '',
    status: 'active',
    current_queue: 0,
    avg_wait_time: 0,
    total_served: 0,
    estimated_wait_time: 0
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
  
    if (name === 'opening_time' || name === 'closing_time' || name === 'service_start_time') {
      const [time, period] = value.split(' ')
      const [hours, minutes] = time.split(':')
      formattedValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`
    }

    // Convert numeric fields to integers
    if (['max_capacity', 'est_time_to_serve'].includes(name)) {
      formattedValue = parseInt(value) || 0
    }
  
    setFormData(prevData => ({
      ...prevData,
      [name]: formattedValue
    }))
  }

  const handleTimeChange = (field, newTime) => {
    setFormData(prev => ({
      ...prev,
      [field]: newTime
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Calculate initial estimated wait time based on capacity and service time
    const estimatedWaitTime = Math.ceil((formData.max_capacity * formData.est_time_to_serve) / 2)

    const queueData = {
      ...formData,
      estimated_wait_time: estimatedWaitTime,
      status: 'active',
      current_queue: 0,
      avg_wait_time: formData.est_time_to_serve, // Initial average wait time equals service time
      total_served: 0
    }

    try {
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queueData),
      })
  
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create queue')
        }
        toast.success('Queue created successfully!')
        router.push('/dashboard')
      } else {
        throw new Error('Server returned non-JSON response')
      }
    } catch (error) {
      console.error('Error creating queue:', error)
      toast.error(`Failed to create queue: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Queue</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-8">
        <Input
          label="Queue Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter queue name"
          className="w-full"
          disabled={isLoading}
        />
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your queue"
          className="w-full"
          disabled={isLoading}
        />
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          placeholder="Select a category"
          className="w-full"
          disabled={isLoading}
        >
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </Select>
        <Select
          label="City"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          placeholder="Select a city"
          className="w-full"
          disabled={isLoading}
        >
          {Object.keys(cityCoordinates).map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Max Capacity"
            name="max_capacity"
            value={formData.max_capacity}
            onChange={handleChange}
            required
            placeholder="Enter max capacity"
            disabled={isLoading}
          />
                    <Input
            type="number"
            label="Estimated Time to Serve (minutes)"
            name="est_time_to_serve"
            value={formData.est_time_to_serve}
            onChange={handleChange}
            required
            placeholder="Enter estimated time to serve"
            disabled={isLoading}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
  <TimePicker
    label="Opening Time"
    value={formData.opening_time}
    onChange={(newTime) => handleTimeChange('opening_time', newTime)}
    className="w-full"
    preventSubmit={true}
  />
  <TimePicker
    label="Closing Time"
    value={formData.closing_time}
    onChange={(newTime) => handleTimeChange('closing_time', newTime)}
    className="w-full"
    preventSubmit={true}
  />
  <TimePicker
    label="Service Start Time"
    value={formData.service_start_time}
    onChange={(newTime) => handleTimeChange('service_start_time', newTime)}
    className="w-full"
    preventSubmit={true}
  />
</div>
        <Button type="submit" color="primary" className="w-full" isLoading={isLoading}>
          {isLoading ? 'Creating Queue...' : 'Create Queue'}
        </Button>
      </form>
    </div>
  )
}