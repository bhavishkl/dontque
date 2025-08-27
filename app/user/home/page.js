'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button, useDisclosure, Card, CardBody, Skeleton, Chip, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner, Badge, Progress } from "@nextui-org/react"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { categories } from '../../utils/category'
import { Clock, Users, ChevronRight, Coffee, BookOpen, Dumbbell, Share2, MapPin, Star, Pencil, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import debounce from 'lodash/debounce'
import { memo } from 'react';
import { useLocation } from '../../hooks/useLocation';
import SearchBar from '@/app/components/SearchBar';
import dynamic from 'next/dynamic';
import { cityCoordinates } from '../../utils/cities';

const SaveButton = dynamic(() => import('@/app/components/UniComp/SaveButton'))
const UpdateNameModal = dynamic(() => import('@/app/components/UpdateNameModal'))

const QueueItem = memo(({ queue }) => {
  const router = useRouter();
  const { icon } = categories.find(cat => cat.name === queue.category) || { icon: '🏢' };

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50 dark:hover:shadow-orange-900/10 border border-gray-100 dark:border-gray-700"
      style={{ width: '320px' }}
    >
      {/* Image Container */}
      <div className="relative h-48">
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
            startContent={<span className="text-base">{icon}</span>}
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
              onClick={() => {
                navigator.share({
                  title: queue.name,
                  text: `Check out ${queue.name} on DontQ!`,
                  url: `/user/queue/${queue.queue_id}`
                });
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="space-y-4">
          {/* Queue Info */}
          <div>
            <h3 className="text-xl font-semibold mb-1 line-clamp-1 text-gray-900 dark:text-gray-100">
              {queue.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate opacity-75">{formatOperatingHours(queue)}</span>
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
              onClick={() => router.push(`/user/queue/${queue.queue_id}`)}
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
  );
});

// Simplify the formatOperatingHours helper function
const formatOperatingHours = (queue) => {
  return queue?.operating_hours || 'Hours not available';
};


QueueItem.displayName = 'QueueItem';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: popularQueues, isLoading, isError, mutate } = useApi(`/api/queues?category=${selectedCategory}&limit=6`)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [userId, setUserId] = useState('')
  const [queueId, setQueueId] = useState('')
  const router = useRouter()
  const { data: session } = useSession()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: savedQueues, isLoading: isSavedLoading } = useApi('/api/user/saved-queues')
  const { location: userLocation, isLoading: isLocationLoading, refreshLocation, requestLocation } = useLocation();
  const { data: currentQueues, isLoading: isCurrentLoading, isError: isCurrentError } = useApi('/api/user/current-queues')
  const [showNameModal, setShowNameModal] = useState(false)
  const { data: userData, isLoading: isUserLoading } = useApi(
    session?.user?.id ? `/api/user?userId=${session.user.id}` : null
  )
  
  const needsNameUpdate = userData?.data ? 
    !userData.data.name || userData.data.name === 'User' : 
    false

  // Dummy data for user stats
  const [userStats, setUserStats] = useState({
    totalTimeSaved: 180,
    queuesJoined: 15,
    averageTimeSaved: 12
  })

  const debouncedMutate = useMemo(
    () => debounce(() => mutate(), 300),
    [mutate]
  );

  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Add mounted state check
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')

    if (categoryParam) setSelectedCategory(categoryParam)
    if (searchParam) setSearchQuery(searchParam)

    debouncedMutate()
  }, [selectedCategory, searchQuery, debouncedMutate])
  const handleSearch = async (searchValue) => {
    setIsSearching(true);
    if (/^\d{6}$/.test(searchValue)) {
      try {
        const response = await fetch(`/api/queues/short/${searchValue}`);
        if (response.ok) {
          const data = await response.json();
          router.push(`/user/queue/${data.queue_id}`);
        } else {
          toast.error('Queue not found');
        }
      } catch (error) {
        console.error('Error fetching queue:', error);
        toast.error('An error occurred while searching for the queue');
      }
    } else {
      router.push(`/user/queues?search=${searchValue}&category=${selectedCategory}`);
    }
    setIsSearching(false);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    mutate()
    router.push(`/user/queues?category=${category}`)
  }

  useEffect(() => {
    if (!userLocation && !isLocationLoading) {
      // Small delay to ensure the page has loaded properly
      const timer = setTimeout(() => {
        refreshLocation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userLocation, isLocationLoading, refreshLocation]);

  useEffect(() => {
    if (needsNameUpdate) {
      setShowNameModal(true)
    }
  }, [needsNameUpdate])

  const handleLocationSelect = (city) => {
    const newLocation = {
      city: city,
      latitude: cityCoordinates[city].lat,
      longitude: cityCoordinates[city].lng,
      timestamp: new Date().toISOString(),
      isManuallySet: true
    };
    sessionStorage.setItem('userLocation', JSON.stringify(newLocation));
    refreshLocation();
    setLocationModalOpen(false);
  };

  const handleCurrentLocation = async () => {
    try {
      await requestLocation();
      setLocationModalOpen(false);
    } catch (error) {
      toast.error('Failed to detect location');
    }
  };

  const getWaitTimeStatus = (estimatedWaitTime) => {
    if ((estimatedWaitTime || 0) <= 5) return { color: 'success', text: 'Almost there!' }
    if ((estimatedWaitTime || 0) <= 15) return { color: 'warning', text: 'Getting closer' }
    return { color: 'default', text: 'Please be patient' }
  }

  const getPositionStatus = (position) => {
    if ((position || 0) <= 3) return { color: 'success', text: 'Next up!' }
    if ((position || 0) <= 10) return { color: 'warning', text: 'Getting close' }
    return { color: 'default', text: 'In queue' }
  }

  const formatJoinTime = (joinTime) => {
    if (!joinTime) return '—'
    const now = new Date()
    const join = new Date(joinTime)
    const diffInMinutes = Math.floor((now - join) / (1000 * 60))
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hr${hours > 1 ? 's' : ''} ago`
    }
    const days = Math.floor(diffInMinutes / 1440)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100">
      <main>
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 dark:from-gray-800 dark:via-gray-900 dark:to-black text-white py-8 sm:py-12 rounded-b-[2.5rem] shadow-lg">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="md:w-1/2 space-y-3">
                <h1 className="text-3xl md:text-5xl font-bold mb-2 hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-100">
                  Skip the Wait, Join Smart
                </h1>
                <p className="text-lg sm:text-xl text-orange-50">Find and join queues near you instantly.</p>
                <div className="flex items-center gap-2 text-orange-50/80 text-sm">
                  <MapPin className="h-4 w-4" />
                  <Button
                    variant="light"
                    className="p-0 h-auto text-current font-normal hover:bg-orange-100/20 hover:rounded-full px-2 transition-all duration-200"
                    onPress={() => setLocationModalOpen(true)}
                    suppressHydrationWarning
                  >
                    {!isMounted ? (
                      "Detecting location..."
                    ) : isLocationLoading ? (
                      "Detecting location..."
                    ) : userLocation?.city ? (
                      <span className="flex items-center gap-1">
                        {userLocation.city}
                        <Pencil className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      "Set your location"
                    )}
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 w-full">
                <SearchBar 
                  onSearch={handleSearch}
                  isSearching={isSearching}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Location Modal */}
        <Modal 
          isOpen={locationModalOpen} 
          onClose={() => setLocationModalOpen(false)}
          placement="center"
          className="dark:bg-gray-800"
        >
          <ModalContent>
            <div className="p-4">
              <ModalHeader className="flex flex-col gap-1 px-0">
                <h3 className="text-lg font-medium">Select your location</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose your city to find queues near you
                </p>
              </ModalHeader>
              <ModalBody className="px-0">
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(cityCoordinates).map((city) => (
                    <Button
                      key={city}
                      variant="flat"
                      className={`justify-start h-12 text-left ${
                        userLocation?.city === city 
                          ? "bg-orange-100 dark:bg-orange-700 text-orange-600 dark:text-orange-200"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                      } transition-colors duration-200`}
                      onPress={() => handleLocationSelect(city)}
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter className="px-0 pt-4">
                <Button
                  fullWidth
                  variant="flat"
                  onPress={handleCurrentLocation}
                  disabled={isLocationLoading}
                  className="h-12"
                  startContent={isLocationLoading ? <Spinner size="sm" /> : <MapPin className="h-4 w-4" />}
                >
                  {isLocationLoading ? "Detecting..." : "Use my current location"}
                </Button>
              </ModalFooter>
            </div>
          </ModalContent>
        </Modal>

        {/* Categories */}
        <section className="py-4 sm:py-8 dark:bg-gray-800">
          <div className="container mx-auto px-4 overflow-x-auto custom-scrollbar">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Categories</h3>
            <div className="relative">
              <div className="flex gap-2 sm:gap-3 pb-2 sm:pb-4" style={{ width: 'max-content' }}>
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
                    selectedCategory === category.name
                      ? 'bg-gray-800 text-white dark:bg-white dark:text-black'
                      : 'bg-gray-100 text-black hover:bg-gray-200 dark:bg-[#111827] dark:text-white dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <span className="mr-1 sm:mr-2 text-lg sm:text-xl">{category.icon}</span>
                  {category.name}
                </button>
              ))}
              </div>
            </div>
          </div>
        </section>

        {/* User Stats Section */}
        <section className="py-6 bg-white dark:bg-gray-800 hidden">
          <div className="container mx-auto px-4">
            <Card className="dark:bg-gray-700 dark:text-gray-100">
              <CardBody className="p-4 lg:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex space-x-4 mb-4 md:mb-0 lg:space-x-6">
                    <div className="text-center">
                      <p className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">{userStats.totalTimeSaved} mins</p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Total Time Saved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">{userStats.queuesJoined}</p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Queues Joined</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">{userStats.averageTimeSaved} mins</p>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Avg. Time Saved</p>
                    </div>
                  </div>
                  <div className="w-full md:w-auto">
                    <p className="text-sm lg:text-base font-semibold mb-2">How you could use saved time:</p>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 dark:text-orange-400 mr-2" />
                        <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">{Math.floor(userStats.totalTimeSaved / 15)} coffee breaks</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 dark:text-orange-400 mr-2" />
                        <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">{Math.floor(userStats.totalTimeSaved / 30)} book chapters</span>
                      </div>
                      <div className="flex items-center">
                        <Dumbbell className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 dark:text-orange-400 mr-2" />
                        <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">{Math.floor(userStats.totalTimeSaved / 45)} workouts</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600 dark:text-orange-400 mr-2" />
                        <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">{Math.floor(userStats.totalTimeSaved / 60)} hour-long chats</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Your Queues */}
        <section className="py-4 sm:py-8 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Your Queues</h3>
            {isCurrentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(3).fill().map((_, index) => (
                  <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm">
                    <CardBody className="p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="grid grid-cols-2 gap-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : currentQueues && currentQueues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentQueues.map((queue) => {
                  const waitTimeStatus = getWaitTimeStatus(queue.estimatedWaitTime)
                  const positionStatus = getPositionStatus(queue.position)
                  return (
                    <Card key={queue.id} className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                      <CardBody className="p-6">
                        <div className="flex items-start justify-between w-full mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-semibold truncate">{queue.name}</h4>
                              {queue.service_type === 'advanced' && (
                                <Chip size="sm" variant="flat" color="secondary" className="text-xs">PRO</Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{queue.location || 'Location not specified'}</span>
                            </div>
                          </div>
                          <Badge color={positionStatus.color} variant="flat" className="text-xs font-medium">
                            #{queue.position}
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Queue Progress</span>
                            <span className="text-xs text-gray-500">{positionStatus.text}</span>
                          </div>
                          <Progress value={Math.max(0, 100 - (queue.position * 10))} color={positionStatus.color} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{queue.estimatedWaitTime || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Est. Wait (min)</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                            <div className="text-lg font-bold text-sky-600 dark:text-sky-400">#{queue.position}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Your Position</div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-300">Joined</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatJoinTime(queue.join_time)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-300">Wait Status</span>
                            </div>
                            <Chip size="sm" variant="flat" color={waitTimeStatus.color} className="text-xs">{waitTimeStatus.text}</Chip>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/user/queue/${queue.id}`} className="flex-1">
                            <Button className="w-full" color="primary" variant="flat" size="sm">
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="bordered" className="text-xs">Leave Queue</Button>
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="dark:bg-gray-800 border-none shadow-lg">
                <CardBody className="p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-base sm:text-lg">You're not currently in any queues.</p>
                    <Link href="/user/queues">
                      <Button className="mt-2" color="primary">Find Queues</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </section>
      </main>
      <UpdateNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        userId={session?.user?.id}
      />
    </div>
  )
}