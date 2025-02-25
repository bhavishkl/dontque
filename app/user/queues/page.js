'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { Search, Clock, Users, MapPin, Star, Bookmark, Share2, ChevronRight } from 'lucide-react'
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
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const { location: userLocation, refreshLocation } = useLocation()
  const router = useRouter()
  const [forceAllCities, setForceAllCities] = useState(false)

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

  const { data: queues, isLoading, isError, mutate } = useApi(
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
              <div 
                key={queue.queue_id}
                className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 dark:hover:shadow-orange-900/10 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image Container */}
                  <div className="relative h-48 lg:h-[250px] lg:w-[300px] shrink-0">
                    <Image
                      src={queue.image_url || '/default.jpg'}
                      alt={queue.name}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                      style={{ filter: 'brightness(0.95)' }}
                    />
                    
                    {/* Top Info Bar */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                      <Chip
                        variant="flat"
                        size="sm"
                        className="backdrop-blur-md bg-black/30 text-white font-medium border border-white/20"
                        startContent={<span className="text-base">🏢</span>}
                      >
                        {queue.category || 'General'}
                      </Chip>

                      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full dark:bg-gray-900/95 shadow-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-white">
                          {queue.avg_rating ? queue.avg_rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions Overlay (Map and Share buttons only) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-4 right-4 flex gap-2 items-center">
                        <Button
                          isIconOnly
                          className="bg-white/25 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2.5 shadow-lg transition-all duration-200"
                          onClick={() => window.open(`https://maps.app.goo.gl/uYAVo2VP4Gz3B9FK6?q`, '_blank')}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button
                          isIconOnly
                          className="bg-white/25 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2.5 shadow-lg transition-all duration-200"
                          onClick={() => handleShare(queue)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
                    <div className="space-y-4">
                      {/* Queue Info */}
                      <div>
                        <h3 className="text-xl font-semibold mb-1 line-clamp-1 text-gray-900 dark:text-gray-100">
                          {queue.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate opacity-75">{queue.operating_hours || 'Hours not available'}</span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl">
                          <Users className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{queue.current_queue_count || 0}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">in queue</span>
                          </div>
                        </div>

                        {queue.total_estimated_wait_time > 0 && (
                          <div className="flex items-center gap-2 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl">
                            <Clock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{Math.round(queue.total_estimated_wait_time)}m</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">wait</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* High Demand Badge */}
                      {queue.capacity_percentage > 80 && (
                        <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          High Demand
                        </div>
                      )}

                      {/* Action Buttons (View Details and SaveButton) */}
                      <div className="flex gap-2 mt-2">
                        <Button
                          className="flex-grow bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                          onClick={() => handleViewQueue(queue.queue_id)}
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <SaveButton 
                          queueId={queue.queue_id}
                          className="bg-white/25 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2.5 shadow-lg transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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