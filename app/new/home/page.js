'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner, Badge } from "@nextui-org/react"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { categories } from '../../utils/category'
import { Clock, Users, ChevronRight, Coffee, BookOpen, Dumbbell, Share2, MapPin, Star, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import SearchBar from '@/app/components/SearchBar'
import UserQueueCard from '@/app/components/UserQueueCard'

// Mock Data
const mockQueues = [
  {
    queue_id: 'q1',
    name: 'Dr. Smith Clinic',
    category: 'Health',
    image_url: '/default.jpg',
    avg_rating: 4.5,
    operating_hours: '09:00 AM - 05:00 PM',
    current_queue_count: 12,
    total_estimated_wait_time: 45,
    capacity_percentage: 60,
  },
  {
    queue_id: 'q2',
    name: 'Downtown Barber',
    category: 'Beauty',
    image_url: '/default.jpg',
    avg_rating: 4.8,
    operating_hours: '10:00 AM - 08:00 PM',
    current_queue_count: 5,
    total_estimated_wait_time: 20,
    capacity_percentage: 30,
  },
  {
    queue_id: 'q3',
    name: 'Tasty Burger Joint',
    category: 'Food',
    image_url: '/default.jpg',
    avg_rating: 4.2,
    operating_hours: '11:00 AM - 11:00 PM',
    current_queue_count: 25,
    total_estimated_wait_time: 60,
    capacity_percentage: 90,
  }
];

const mockUserStats = {
  totalTimeSaved: 180,
  queuesJoined: 15,
  averageTimeSaved: 12
};

const mockCurrentQueues = [
  {
    id: 'cq1',
    name: 'City Bank',
    location: 'Main Street',
    position: 3,
    estimatedWaitTime: 10,
    join_time: new Date(Date.now() - 30 * 60000).toISOString(),
    service_type: 'regular'
  }
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState({ city: 'New York' });
  const router = useRouter()

  const handleSearch = (searchValue) => {
    setIsSearching(true);
    setTimeout(() => {
        setIsSearching(false);
        router.push(`/new/queues?search=${searchValue}`);
    }, 500);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    router.push(`/new/queues?category=${category}`)
  }

  const handleLocationSelect = (city) => {
    setUserLocation({ city });
    setLocationModalOpen(false);
  };

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
                  >
                     <span className="flex items-center gap-1">
                        {userLocation.city}
                        <Pencil className="h-3.5 w-3.5" />
                      </span>
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
              <ModalHeader>Select your location</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-2">
                    <Button onPress={() => handleLocationSelect('New York')}>New York</Button>
                    <Button onPress={() => handleLocationSelect('Los Angeles')}>Los Angeles</Button>
                </div>
              </ModalBody>
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

        {/* Your Queues */}
        <section className="py-4 sm:py-8 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Your Queues</h3>
              <div className="overflow-x-auto custom-scrollbar">
                <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
                  {mockCurrentQueues.map((queue) => (
                    <div key={queue.id} style={{ width: '320px', minWidth: '320px' }}>
                      <UserQueueCard queue={queue} />
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </section>

         {/* Popular Queues (using mockQueues) */}
         <section className="py-4 sm:py-8">
            <div className="container mx-auto px-4">
               <h3 className="text-lg sm:text-xl font-semibold mb-4">Popular Queues</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockQueues.map(queue => (
                    <div key={queue.queue_id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="relative h-48">
                            <Image
                                src={queue.image_url}
                                alt={queue.name}
                                width={400}
                                height={200}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                                <Chip variant="flat" size="sm" className="backdrop-blur-md bg-black/30 text-white">
                                    {queue.category}
                                </Chip>
                                <div className="flex items-center gap-1 bg-white/95 px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    {queue.avg_rating}
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{queue.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Clock className="h-4 w-4" />
                                {queue.operating_hours}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm">
                                    <span className="font-bold text-orange-600">{queue.current_queue_count}</span> in queue
                                </div>
                                <Button
                                    className="bg-gray-900 text-white"
                                    onClick={() => router.push(`/new/queue/${queue.queue_id}`)}
                                >
                                    Join
                                </Button>
                            </div>
                        </div>
                    </div>
                  ))}
               </div>
            </div>
         </section>

      </main>
    </div>
  )
}
