'use client'

import { useState, useEffect, useMemo } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, Button, ModalFooter, useDisclosure, Card, CardBody, Skeleton, Input, Chip } from "@nextui-org/react"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { categories } from '../../utils/category'
import { Search, Clock, Scan, Users, ChevronRight, Coffee, BookOpen, Dumbbell, Share2, MapPin, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import debounce from 'lodash/debounce'
import { memo } from 'react';
import SaveButton from '@/app/components/UniComp/SaveButton';
import { useLocation } from '../../hooks/useLocation';
import SearchBar from '@/app/components/SearchBar';
import dynamic from 'next/dynamic';

const DynamicScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then(mod => ({ default: mod.Scanner })),
  {
    loading: () => <div className="w-full h-64 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading scanner...</div>
    </div>,
    ssr: false
  }
);

const QueueItem = memo(({ queue }) => {
  const router = useRouter();
  const { icon } = categories.find(cat => cat.name === queue.category) || { icon: '🏢' };

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 dark:hover:shadow-primary-900/10"
      style={{ width: '320px' }}
    >
      {/* Image Container */}
      <div className="relative h-40">
        <Image
          src={queue.image_url || '/default.jpg'}
          alt={queue.name}
          width={400}
          height={200}
          className="w-full h-full object-cover brightness-[0.97]"
        />
        {/* Category Chip */}
        <div className="absolute top-3 left-3">
          <Chip
            className="bg-white/90 backdrop-blur-sm border-none text-gray-700 dark:bg-gray-900/90 dark:text-white"
            startContent={<span className="text-base">{icon}</span>}
          >
            {queue.category || 'General'}
          </Chip>
        </div>

        {/* Rating Badge */}
        {queue.avg_rating && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg dark:bg-gray-900/90">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700 dark:text-white">
                {queue.avg_rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <SaveButton 
              queueId={queue.queue_id}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2"
            />
            <div className="flex gap-2">
              <Button
                isIconOnly
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2"
                onClick={() => window.open(
                  `https://maps.app.goo.gl/uYAVo2VP4Gz3B9FK6?q`,
                  '_blank'
                )}
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <Button
                isIconOnly
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2"
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
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-4 mb-4">
          {/* Left side - Name and Hours */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-gray-900 dark:text-gray-100">
              {queue.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">{formatOperatingHours(queue)}</span>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Queue Count */}
            <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
              <Users className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{queue.current_queue_count || 0}</span>
            </div>

            {/* Wait Time */}
            {queue.total_estimated_wait_time > 0 && (
              <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">~{Math.round(queue.total_estimated_wait_time)}m</span>
              </div>
            )}

            {/* High Demand Badge */}
            {queue.capacity_percentage > 80 && (
              <div className="flex items-center gap-1.5 bg-red-100/80 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                <span className="text-xs font-medium text-red-600 dark:text-red-400">High Demand</span>
              </div>
            )}
          </div>
        </div>

        {/* View Button */}
        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          onClick={() => router.push(`/user/queue/${queue.queue_id}`)}
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

// Helper functions for formatting data
const formatOperatingHours = (queue) => {
  if (!queue.opening_time || !queue.closing_time) return 'Hours not available';
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}${minutes !== '00' ? ':' + minutes : ''} ${period}`;
  };

  return `${formatTime(queue.opening_time)} - ${formatTime(queue.closing_time)}`;
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
  const [isScannerActive, setIsScannerActive] = useState(false);
  const { data: savedQueues, isLoading: isSavedLoading } = useApi('/api/user/saved-queues')
  const { location: userLocation, isLoading: isLocationLoading, refreshLocation } = useLocation();

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

  const handleQrCodeScanned = (result) => {
    if (result) {
      try {
        // Close the QR scanner modal
        onClose();
        
        // Extract the queue ID from the URL
        const url = new URL(result);
        const pathParts = url.pathname.split('/');
        const quickJoinIndex = pathParts.indexOf('quick-join');
        
        let queueId;
        if (quickJoinIndex !== -1 && pathParts[quickJoinIndex + 1]) {
          // If it's already a quick-join URL
          queueId = pathParts[quickJoinIndex + 1];
        } else {
          // If it's a regular queue URL, get the last part
          queueId = pathParts[pathParts.length - 1];
        }
        
        if (queueId) {
          // Navigate to the quick-join page
          router.push(`/quick-join/${queueId}`);
          toast.success('QR code scanned successfully');
        } else {
          throw new Error('Invalid QR code');
        }
      } catch (error) {
        console.error('Error processing QR code:', error);
        toast.error('Invalid QR code format. Please try again.');
      }
    } else {
      toast.error('Failed to scan QR code. Please try again.');
    }
  };


  const toggleScanner = () => {
    if (isScannerActive) {
      setIsScannerActive(false);
      onClose();
    } else {
      setIsScannerActive(true);
      onOpen();
    }
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
                  <span suppressHydrationWarning>
                    {userLocation?.city || 'Loading location...'}
                  </span>
                </div>
              </div>
              <div className="md:w-1/2 w-full">
                <SearchBar 
                  onSearch={handleSearch}
                  onScanClick={toggleScanner}
                  isSearching={isSearching}
                />
              </div>
            </div>
          </div>
        </section>

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
                      ? 'bg-orange-500 text-white'
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

        {/* Popular Queues */}
        <section className="py-4 sm:py-8 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">Popular Queues</h3>
              <Link href="/user/queues" className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-700 dark:text-orange-50 dark:hover:bg-orange-600 transition-colors duration-200 ease-in-out">
                View all
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex gap-3 sm:gap-4 pb-2 sm:pb-4" style={{ width: 'max-content' }}>
                {isLoading ? (
  // Skeleton loading state
  Array(6).fill().map((_, index) => (
    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden" style={{ width: '250px', maxWidth: '100%' }}>
      <Skeleton className="w-full h-32 sm:h-40" />
      <div className="p-2 sm:p-4">
        <Skeleton className="w-3/4 h-4 sm:h-6 mb-1 sm:mb-2" />
        <Skeleton className="w-1/2 h-3 sm:h-4 mb-1" />
        <Skeleton className="w-2/3 h-3 sm:h-4 mb-2 sm:mb-3" />
        <Skeleton className="w-full h-8 sm:h-10 rounded-md" />
      </div>
    </div>
  ))
) : searchResults.length > 0 ? (
  searchResults.map((queue) => (
    <QueueItem key={queue.queue_id} queue={queue} />
  ))
) : (
  popularQueues.map((queue) => (
    <QueueItem key={queue.queue_id} queue={queue} />
  ))
)}
              </div>
            </div>
          </div>
        </section>

        {/* Saved Queues */}
        {savedQueues?.length > 0 && (
          <section className="py-4 sm:py-8 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">Saved Queues</h3>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <div className="flex gap-3 sm:gap-4 pb-2 sm:pb-4" style={{ width: 'max-content' }}>
                  {isSavedLoading ? (
                    // Skeleton loading state
                    Array(3).fill().map((_, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden" style={{ width: '250px', maxWidth: '100%' }}>
                        <Skeleton className="w-full h-32 sm:h-40" />
                        <div className="p-2 sm:p-4">
                          <Skeleton className="w-3/4 h-4 sm:h-6 mb-1 sm:mb-2" />
                          <Skeleton className="w-1/2 h-3 sm:h-4 mb-1" />
                          <Skeleton className="w-2/3 h-3 sm:h-4 mb-2 sm:mb-3" />
                          <Skeleton className="w-full h-8 sm:h-10 rounded-md" />
                        </div>
                      </div>
                    ))
                  ) : (
                    savedQueues.map((queue) => (
                      <QueueItem key={queue.queue_id} queue={queue} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
     

      {isScannerActive && (
        <ModalContent>
          <ModalHeader>Scan QR Code</ModalHeader>
          <ModalBody>
            <div className="w-full">
              <DynamicScanner
                onResult={(result) => {
                  if (result) {
                    const url = result.getText();
                    if (url.includes('/quick-join/')) {
                      const id = url.split('/quick-join/')[1];
                      router.push(`/quick-join/${id}`);
                      onClose();
                    } else {
                      toast.error('Invalid QR Code');
                    }
                  }
                }}
                onError={(error) => {
                  console.log(error?.message)
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      )}
    </div>
  )
}