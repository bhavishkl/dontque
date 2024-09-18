'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Clock, Users, MapPin, Star, Bookmark, Share2 } from 'lucide-react'
import { Input, Select, SelectItem, Card, CardBody, Button, Chip, Progress, Skeleton } from "@nextui-org/react"
import debounce from 'lodash/debounce';
import { useApi } from '../../hooks/useApi'

const categories = [
  'All',
  'Restaurants',
  'Retail',
  'Healthcare',
  'Government',
  'Entertainment',
  'Education',
  'Banking',
  'Fitness',
]

export default function QueueListPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('wait')
  const [search, setSearch] = useState('')
  const router = useRouter()

  const { data: queues, isLoading, isError, mutate } = useApi(`/api/queues?category=${selectedCategory}&search=${search}`)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
  
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearch(searchParam);
  }, []);
  
  useEffect(() => {
    const debouncedMutate = debounce(() => {
      mutate();
    }, 300);
  
    debouncedMutate();
  
    return () => debouncedMutate.cancel();
  }, [selectedCategory, search, mutate]);

  const handleViewQueue = (queueId) => {
    router.push(`/user/queue/${queueId}`);
  };

  const handleShare = async (queue) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: queue.name,
          text: `Check out this queue: ${queue.name}`,
          url: `${window.location.origin}/user/queue/${queue.queue_id}`,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(`${window.location.origin}/user/queue/${queue.queue_id}`)
      toast.success('Queue link copied to clipboard')
    }
  }
  
  const filteredQueues = queues
    ? queues.sort((a, b) => {
        if (sortBy === 'wait') {
          return a.avg_wait_time - b.avg_wait_time
        } else if (sortBy === 'distance') {
          // Assuming distance is added to the queue object in the future
          return a.distance - b.distance
        }
        return 0
      })
    : []

  return (
    <div className="min-h-screen dark:bg-neutral-900 dark:text-white">

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
        <Input
  type="search"
  placeholder="Search for queues or locations..."
  startContent={<Search className="text-neutral-400" />}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  classNames={{
    base: "dark:bg-neutral-800",
    input: "dark:text-white",
    inputWrapper: "border dark:border-neutral-700",
  }}
/>
<div className="flex flex-wrap gap-4">
  <div className="flex-1">
    <Select
      placeholder="Select category"
      selectedKeys={[selectedCategory]}
      onChange={(e) => setSelectedCategory(e.target.value)}
      classNames={{
        trigger: "dark:bg-neutral-800 dark:border-neutral-700",
        value: "dark:text-white",
      }}
    >
      {categories.map((category) => (
        <SelectItem key={category} value={category}>
          {category}
        </SelectItem>
      ))}
    </Select>
  </div>
            <div className="flex-1">
              <Select
                placeholder="Sort by"
                selectedKeys={[sortBy]}
                onChange={(e) => setSortBy(e.target.value)}
                classNames={{
                  trigger: "bg-white dark:bg-neutral-800 border dark:border-neutral-700",
                  value: "text-black dark:text-white",
                }}
              >
                <SelectItem key="wait" value="wait">Sort by Wait Time</SelectItem>
                <SelectItem key="distance" value="distance">Sort by Distance</SelectItem>
              </Select>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="grid gap-6">
          {isLoading ? (
            // Skeleton loading state
            Array(5).fill().map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 dark:bg-neutral-800">
                <CardBody>
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 lg:w-1/4">
                      <Skeleton className="rounded-lg w-full h-48 md:h-full dark:bg-neutral-700" />
                    </div>
                    <div className="w-full md:w-2/3 lg:w-3/4 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Skeleton className="h-6 w-1/3 dark:bg-neutral-700" />
                          <Skeleton className="h-4 w-16 dark:bg-neutral-700" />
                        </div>
                        <div className="flex flex-wrap gap-4 mb-4">
                          <Skeleton className="h-4 w-24 dark:bg-neutral-700" />
                          <Skeleton className="h-4 w-24 dark:bg-neutral-700" />
                          <Skeleton className="h-4 w-24 dark:bg-neutral-700" />
                        </div>
                        <div className="mb-4">
                          <Skeleton className="h-2 w-full mb-1 dark:bg-neutral-700" />
                          <Skeleton className="h-2 w-full dark:bg-neutral-700" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-10 w-24 dark:bg-neutral-700" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-10 w-10 rounded-full dark:bg-neutral-700" />
                          <Skeleton className="h-10 w-10 rounded-full dark:bg-neutral-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            filteredQueues.map((queue) => (
              <Card key={queue.queue_id} className="hover:shadow-lg transition-shadow duration-300 dark:bg-neutral-800">
                <CardBody>
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 lg:w-1/4 relative">
                      <Image
                        src={queue.image_url || 'https://via.placeholder.com/200x100'}
                        alt={queue.name}
                        width={400}
                        height={300}
                        className="w-full h-48 md:h-full object-cover rounded-lg"
                      />
                      <Chip className="absolute top-2 left-2" color="default" variant="flat">
                        {queue.category}
                      </Chip>
                    </div>
                    <div className="w-full md:w-2/3 lg:w-3/4 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{queue.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{queue.rating || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{queue.avg_wait_time} mins wait</span>
                          </div>
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{queue.current_queue} in queue</span>
                          </div>
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{queue.distance || 'N/A'} away</span>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Queue capacity</span>
                            <span>{Math.round((queue.current_queue / queue.max_capacity) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(queue.current_queue / queue.max_capacity) * 100} 
                            color="default"
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button color="primary" onClick={() => handleViewQueue(queue.queue_id)}>View Queue</Button>
                        <div className="flex space-x-2">
                          <Button isIconOnly variant="bordered" aria-label="Bookmark">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button isIconOnly variant="bordered" aria-label="Share" onClick={() => handleShare(queue)}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <Button className="mx-2">Previous</Button>
          <Button className="mx-2">Next</Button>
        </div>
      </main>
    </div>
  )
}