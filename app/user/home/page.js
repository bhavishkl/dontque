'use client'

import { useState, useEffect, useMemo } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, ModalFooter, useDisclosure, Card, CardBody, Skeleton, Input } from "@nextui-org/react"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { categories } from '../../utils/category'
import { Search, Clock, Scan, Users, ChevronRight, Coffee, BookOpen, Dumbbell, Share2, Plus, Copy, Share, Chat } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import debounce from 'lodash/debounce'
import { memo } from 'react';

const QueueItem = memo(({ queue }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden relative" style={{ width: '250px', maxWidth: '100%' }}>
      <div className="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-full px-2 py-1 text-xs font-semibold flex items-center z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {queue.avg_rating ? queue.avg_rating.toFixed(1) : '4'}
      </div>
      <Image
        src={queue.image_url || 'https://via.placeholder.com/400x200'}
        alt={queue.name}
        width={400}
        height={200}
        className="w-full h-32 sm:h-40 object-cover"
      />
      <div className="p-2 sm:p-4">
        <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{queue.name}</h4>
        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span>{queue.total_est_wait_time} mins wait</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span>{queue.queue_entry_length} people in queue</span>
        </div>
        <Link href={`/user/queue/${queue.queue_id}`}>
          <Button className="w-full bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-100 py-1 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-gray-700 dark:hover:bg-gray-600">
            View Queue
          </Button>
        </Link>
      </div>
    </div>
  );
});

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
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

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
  const handleSearch = async (e) => {
    e.preventDefault()
    setIsSearching(true)
    if (/^\d{6}$/.test(searchQuery)) {
      try {
        const response = await fetch(`/api/queues/short/${searchQuery}`)
        if (response.ok) {
          const data = await response.json()
          router.push(`/user/queue/${data.queue_id}`)
        } else {
          toast.error('Queue not found')
        }
      } catch (error) {
        console.error('Error fetching queue:', error)
        toast.error('An error occurred while searching for the queue')
      }
    } else {
      router.push(`/user/queues?search=${searchQuery}&category=${selectedCategory}`)
    }
    setIsSearching(false)
  }

  const handleQrCodeScanned = (result) => {
    if (result) {
      // Close the QR scanner modal
      onClose();
      
      // Navigate to the scanned URL
      router.push(result);
      
      // Show a success toast
      toast.success('QR code scanned successfully');
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

  const handleAddMember = (e) => {
    e.preventDefault()
    // Here you would typically make an API call to add the member
    console.log(`Adding user ${userId} to queue ${queueId}`)
    setIsAddMemberModalOpen(false)
    setUserId('')
    setQueueId('')
  }

  
  const generateStatsImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
  
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f0f0f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Set common text styles
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
  
    // Add title
    ctx.font = 'bold 48px Arial';
    ctx.fillText(`${session.user.name}'s QueueSmart Stats`, canvas.width / 2, 80);
  
    // Add stats
    const drawStat = (value, label, x) => {
      ctx.font = 'bold 72px Arial';
      ctx.fillStyle = '#0066cc';
      ctx.fillText(value, x, 200);
      ctx.font = '24px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(label, x, 240);
    };
  
    drawStat(`${userStats.totalTimeSaved} mins`, 'Total Time Saved', canvas.width / 4);
    drawStat(userStats.queuesJoined, 'Queues Joined', canvas.width / 2);
    drawStat(`${userStats.averageTimeSaved} mins`, 'Avg. Time Saved per Queue', 3 * canvas.width / 4);
  
    // Add "How you could use your saved time" section
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('How you could use your saved time:', canvas.width / 2, 320);
  
    const activities = [
      { icon: '☕', text: `Enjoy ${Math.floor(userStats.totalTimeSaved / 15)} coffee breaks` },
      { icon: '📚', text: `Read ${Math.floor(userStats.totalTimeSaved / 30)} book chapters` },
      { icon: '🏋️', text: `Complete ${Math.floor(userStats.totalTimeSaved / 45)} workouts` },
      { icon: '🗣️', text: `Have ${Math.floor(userStats.totalTimeSaved / 60)} hour-long chats` }
    ];
  
    activities.forEach((activity, index) => {
      const x = (index % 2 === 0 ? canvas.width / 4 : 3 * canvas.width / 4);
      const y = 420 + Math.floor(index / 2) * 160;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 200, y - 60, 400, 120);
      ctx.strokeStyle = '#dddddd';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 200, y - 60, 400, 120);
  
      ctx.font = '48px Arial';
      ctx.fillStyle = '#000000';
      ctx.fillText(activity.icon, x, y - 10);
      ctx.font = '24px Arial';
      ctx.fillText(activity.text, x, y + 40);
    });
  
    // Add link
    ctx.fillStyle = '#0066cc';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('Try QueueSmart:', canvas.width / 2, canvas.height - 100);
    ctx.font = 'bold 48px Arial';
    ctx.fillText('dontq.vercel.app', canvas.width / 2, canvas.height - 50);
  
    // Add QueueSmart logo or watermark
    ctx.font = 'italic 24px Arial';
    ctx.fillStyle = '#999999';
    ctx.fillText('Powered by QueueSmart', canvas.width / 2, canvas.height - 20);
  
    return canvas.toDataURL('image/png');
  };

  const handleShareStats = async () => {
    const imageUrl = generateStatsImage();
    const blob = await (await fetch(imageUrl)).blob();
    const file = new File([blob], 'queue-smart-stats.png', { type: 'image/png' });

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My QueueSmart Stats',
          text: 'Check out how much time I\'ve saved using QueueSmart! Try it yourself at https://dontq.vercel.app',
          url: 'https://dontq.vercel.app',
          files: [file],
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Failed to share stats. Please try again.');
      }
    } else {
      toast.error('Web Share API is not supported in your browser. Please use a different sharing method.');
    }
  };
  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100">
      <main>
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-3 md:mb-0">
                <h1 className="text-2xl md:text-4xl font-bold mb-1 hidden sm:block">Skip the Wait, Join Smart</h1>
                <p className="text-base sm:text-lg">Find and join queues near you instantly.</p>
                </div>
              <div className="md:w-1/2">
                <form onSubmit={handleSearch} className="flex items-center">
                  <Button
                    isIconOnly
                    color="primary"
                    variant="flat"
                    aria-label="Scan QR Code"
                    className="mr-2 bg-[#1F2937] hover:bg-[#374151] focus:ring-4 focus:outline-none focus:ring-gray-700 dark:bg-[#1F2937] dark:hover:bg-[#374151] dark:focus:ring-gray-600 border border-white rounded-md"
                    onClick={toggleScanner}
                  >
                    <Scan className="text-white" />
                  </Button>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="search"
                      className="w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Search queues or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      required
                    />
                  </div>
                  <button
  type="submit"
  className="ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-3 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
  disabled={isSearching}
>
  {isSearching ? 'Searching...' : 'Search'}
</button>
                </form>
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
                      ? 'bg-blue-600 text-white'
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
        <section className="py-6 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <Card className="dark:bg-gray-700 dark:text-gray-100">
              <CardBody className="p-4 lg:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex space-x-4 mb-4 md:mb-0 lg:space-x-6">
                    <div className="text-center">
                      <p className="text-2xl lg:text-3xl font-bold text-primary dark:text-blue-400">{userStats.totalTimeSaved} mins</p>
                      <p className="text-xs lg:text-sm text-muted-foreground dark:text-gray-400">Total Time Saved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl lg:text-3xl font-bold text-primary dark:text-blue-400">{userStats.queuesJoined}</p>
                      <p className="text-xs lg:text-sm text-muted-foreground dark:text-gray-400">Queues Joined</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl lg:text-3xl font-bold text-primary dark:text-blue-400">{userStats.averageTimeSaved} mins</p>
                      <p className="text-xs lg:text-sm text-muted-foreground dark:text-gray-400">Avg. Time Saved</p>
                    </div>
                  </div>
                  <div className="w-full md:w-auto">
                    <p className="text-sm lg:text-base font-semibold mb-2">How you could use saved time:</p>
                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 lg:h-5 lg:w-5 text-primary dark:text-blue-400 mr-2" />
                        <span className="text-xs lg:text-sm">{Math.floor(userStats.totalTimeSaved / 15)} coffee breaks</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 text-primary dark:text-blue-400 mr-2" />
                        <span className="text-xs lg:text-sm">{Math.floor(userStats.totalTimeSaved / 30)} book chapters</span>
                      </div>
                      <div className="flex items-center">
                        <Dumbbell className="h-4 w-4 lg:h-5 lg:w-5 text-primary dark:text-blue-400 mr-2" />
                        <span className="text-xs lg:text-sm">{Math.floor(userStats.totalTimeSaved / 45)} workouts</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 lg:h-5 lg:w-5 text-primary dark:text-blue-400 mr-2" />
                        <span className="text-xs lg:text-sm">{Math.floor(userStats.totalTimeSaved / 60)} hour-long chats</span>
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
              <Link href="/user/queues" className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700 transition-colors duration-200 ease-in-out">
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
      </main>
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)}>
  <ModalContent>
    <form onSubmit={handleAddMember}>
      <ModalHeader>Add Member to Queue</ModalHeader>
      <ModalBody>
        <Input
          label="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <Input
          label="Queue ID"
          value={queueId}
          onChange={(e) => setQueueId(e.target.value)}
          required
        />
      </ModalBody>
      <ModalFooter>
        <Button color="danger" variant="light" onClick={() => setIsAddMemberModalOpen(false)}>
          Cancel
        </Button>
        <Button color="primary" type="submit">
          Add Member
        </Button>
      </ModalFooter>
    </form>
  </ModalContent>
</Modal>

<Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Scan QR Code</ModalHeader>
          <ModalBody>
          {isOpen && (
            <Scanner
              onScan={handleQrCodeScanned}
              onError={(error) => console.log(error)}
              style={{ width: '100%' }}
            />
          )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}