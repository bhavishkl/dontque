'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Search, Clock, MapPin, Share2, ChevronRight, Star } from 'lucide-react'
import { Input, Select, SelectItem, Card, CardBody, Button, Chip, Progress, Skeleton } from "@nextui-org/react"
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
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const { location: userLocation, refreshLocation } = useLocation()
  const router = useRouter()
  const [forceAllCities] = useState(false)

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Debounce search value changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const { data: queues, isLoading, mutate } = useApi(
    `/api/queues?category=${selectedCategory}&search=${debouncedSearchValue}&sortBy=${sortBy}${
      !forceAllCities && userLocation?.city ? `&city=${userLocation.city}` : ''
    }&limit=20`
  )

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    const sortParam = searchParams.get('sortBy')

    if (categoryParam) setSelectedCategory(categoryParam)
    if (searchParam) {
      setSearchValue(searchParam)
      setDebouncedSearchValue(searchParam)
    }
    if (sortParam) setSortBy(sortParam)
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    mutate();
  }, [selectedCategory, debouncedSearchValue, sortBy, forceAllCities, userLocation, mutate]);

  const handleSearchChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[^\w\s]/gi, '');
    setSearchValue(sanitizedValue);
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
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
            value={searchValue}
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
                onChange={handleCategoryChange}
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
                onChange={handleSortChange}
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
              <Card
                key={queue.queue_id}
                className="bg-background/70 shadow-sm hover:shadow-md transition-all duration-200 border border-divider/60"
              >
                <CardBody className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-default-900 dark:text-default-100 truncate">
                        {queue.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-default-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{queue.location || 'Location not specified'}</span>
                      </div>
                    </div>
                    <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                      {queue.category || 'General'}
                    </Chip>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-default-600">Capacity usage</span>
                      <span className="text-default-500">{Math.max(0, Math.round(queue.capacity_percentage || 0))}%</span>
                    </div>
                    <Progress
                      value={Math.max(0, Math.min(100, queue.capacity_percentage || 0))}
                      color="warning"
                      className="h-2"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-default-50 p-3 text-center">
                      <div className="text-lg font-bold text-primary">{queue.current_queue_count || 0}</div>
                      <div className="text-xs text-default-500">People in queue</div>
                    </div>
                    <div className="rounded-lg bg-default-50 p-3 text-center">
                      <div className="text-lg font-bold text-secondary">
                        {Math.max(0, Math.round(queue.total_estimated_wait_time || 0))}
                      </div>
                      <div className="text-xs text-default-500">Est. wait (min)</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-default-600">
                        <Clock className="h-3.5 w-3.5 text-default-400" />
                        <span>Operating hours</span>
                      </div>
                      <span className="text-default-500 truncate max-w-[60%] text-right">
                        {queue.operating_hours || 'Not available'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-default-600">
                        <Star className="h-3.5 w-3.5 text-default-400" />
                        <span>Rating</span>
                      </div>
                      <span className="text-default-500">
                        {queue.avg_rating ? Number(queue.avg_rating).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      color="primary"
                      variant="flat"
                      className="flex-1"
                      endContent={<ChevronRight className="h-3.5 w-3.5" />}
                      onClick={() => handleViewQueue(queue.queue_id)}
                    >
                      View Details
                    </Button>
                    <Button
                      isIconOnly
                      variant="bordered"
                      onClick={() => handleShare(queue)}
                      aria-label="Share queue"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <SaveButton queueId={queue.queue_id} />
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
                        setSearchValue('');
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
