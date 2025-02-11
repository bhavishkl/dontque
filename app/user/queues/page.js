'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { Search, Clock, Users, MapPin, Star, Bookmark, Share2 } from 'lucide-react'
import { Input, Select, SelectItem, Card, CardBody, Button, Chip, Progress, Skeleton } from "@nextui-org/react"
import debounce from 'lodash/debounce'
import { useApi } from '../../hooks/useApi'
import SaveButton from '@/app/components/UniComp/SaveButton'
import { useLocation } from '../../hooks/useLocation'

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
  const { location: userLocation, refreshLocation } = useLocation()
  const router = useRouter()
  const [forceAllCities, setForceAllCities] = useState(false)

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  const debouncedSearch = useMemo(
    () => debounce((value) => setSearch(value), 300),
    []
  )

  const { data: queues, isLoading, isError, mutate } = useApi(
    `/api/queues?category=${selectedCategory}&search=${search}&sortBy=${sortBy}${
      !forceAllCities && userLocation?.city ? `&city=${userLocation.city}` : ''
    }&limit=20`
  )

  const debouncedMutate = useMemo(
    () => debounce(() => mutate(), 300),
    [mutate]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    const sortParam = searchParams.get('sortBy')

    if (categoryParam) setSelectedCategory(categoryParam)
    if (searchParam) setSearch(searchParam)
    if (sortParam) setSortBy(sortParam)

    debouncedMutate()
  }, [selectedCategory, search, sortBy, debouncedMutate])

  const handleSearchChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^\w\s]/gi, '');
    debouncedSearch(sanitizedValue);
  }

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
  
  // Fix: Handle both array and object response formats
  const queueData = Array.isArray(queues) ? queues : queues?.data || [];
  
  const filteredQueues = queueData.sort((a, b) => {
    if (sortBy === 'wait') {
      return (a.total_estimated_wait_time || 0) - (b.total_estimated_wait_time || 0);
    } else if (sortBy === 'distance') {
      return (a.distance || 0) - (b.distance || 0);
    }
    return 0;
  });

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
  onChange={handleSearchChange}
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
          ) : filteredQueues.length > 0 ? (
            filteredQueues.map((queue) => (
              <Card key={queue.queue_id} className="hover:shadow-lg transition-shadow duration-300 dark:bg-neutral-800">
                <CardBody>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3 lg:w-1/4 relative h-[200px] md:h-[250px]">
                      <Image
                        src={queue.image_url || '/default.jpg'}
                        alt={queue.name}
                        fill={true}
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      <Chip className="absolute top-2 left-2 z-10" color="default" variant="flat">
                        {queue.category}
                      </Chip>
                    </div>
                    <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{queue.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{queue.avg_rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{queue.total_estimated_wait_time || 0} mins wait</span>
                          </div>
                          <div className="flex items-center text-neutral-600 dark:text-neutral-400">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{queue.current_queue_count || 0} in queue</span>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Queue capacity</span>
                            <span>{queue.capacity_percentage || 0}%</span>
                          </div>
                          <Progress 
                            value={queue.capacity_percentage || 0} 
                            color={queue.capacity_percentage > 80 ? "danger" : "default"}
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button color="primary" onClick={() => handleViewQueue(queue.queue_id)}>View Queue</Button>
                        <div className="flex space-x-2">
                          <SaveButton queueId={queue.queue_id} />
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
          ) : (
            <Card className="col-span-full">
              <CardBody className="text-center space-y-4">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="text-lg font-medium">
                  {userLocation?.city ? 
                    `No queues found in ${userLocation.city}` : 
                    "No queues found"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {userLocation?.city ?
                    "Try expanding your search area or check nearby cities" :
                    "Try adjusting your search filters"}
                </p>
                {userLocation?.city && (
                  <div className="flex gap-4 justify-center mt-4">
                    <Button 
                      color="primary" 
                      onClick={() => {
                        setSearch('');
                        setSelectedCategory('All');
                      }}
                    >
                      Clear Filters
                    </Button>
                    <Button 
                      variant="bordered"
                      onClick={() => {
                        sessionStorage.removeItem('userLocation');
                        refreshLocation();
                        mutate();
                      }}
                    >
                      Try Nearby Areas
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
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