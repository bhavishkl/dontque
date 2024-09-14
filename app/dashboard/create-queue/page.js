'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Textarea, Select, SelectItem } from "@nextui-org/react"
import { toast } from 'sonner'
import TimePicker from '../../components/UserLayout/TimePicker'

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
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
  
    if (name === 'opening_time' || name === 'closing_time' || name === 'service_start_time') {
      const [time, period] = value.split(' ')
      const [hours, minutes] = time.split(':')
      formattedValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`
    }
  
    setFormData(prevData => ({
      ...prevData,
      [name]: formattedValue
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        const text = await response.text()
        console.error('Non-JSON response:', text)
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
        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Enter location"
          className="w-full"
          disabled={isLoading}
        />
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
    onChange={(newTime) => handleChange({ target: { name: 'opening_time', value: newTime } })}
    className="w-full"
  />
  <TimePicker
    label="Closing Time"
    value={formData.closing_time}
    onChange={(newTime) => handleChange({ target: { name: 'closing_time', value: newTime } })}
    className="w-full"
  />
  <TimePicker
    label="Service Start Time"
    value={formData.service_start_time}
    onChange={(newTime) => handleChange({ target: { name: 'service_start_time', value: newTime } })}
    className="w-full"
  />
</div>
        <Button type="submit" color="primary" className="w-full" isLoading={isLoading}>
          {isLoading ? 'Creating Queue...' : 'Create Queue'}
        </Button>
      </form>
    </div>
  )
}