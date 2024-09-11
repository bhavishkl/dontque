'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '../../components/UserLayout/header'
import { Button, Input, Skeleton, Card, CardBody } from "@nextui-org/react"
import { categories } from '../../utils/category'
import { Search, Clock, Users, ChevronRight, Coffee, BookOpen, Dumbbell } from 'lucide-react'

export default function Home() {
  const [popularQueues, setPopularQueues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Dummy data for user stats
  const [userStats, setUserStats] = useState({
    totalTimeSaved: 180,
    queuesJoined: 15,
    averageTimeSaved: 12
  });

  useEffect(() => {
    fetchPopularQueues();
  }, [selectedCategory]);

  const fetchPopularQueues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/queues?category=${selectedCategory}&limit=6`);
      const data = await response.json();
      setPopularQueues(data);
    } catch (error) {
      console.error('Error fetching popular queues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/user/queues?search=${searchQuery}&category=${selectedCategory}`);
  };
  
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    router.push(`/user/queues?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-4 md:mb-0">
                <h1 className="text-2xl md:text-4xl font-bold mb-1 sm:mb-2">Skip the Wait, Join Smart</h1>
                <p className="text-base sm:text-lg mb-2 sm:mb-4">Find and join queues near you instantly.</p>
              </div>
              <div className="md:w-1/2">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="search"
                      className="w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search queues or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Categories</h3>
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex gap-2 sm:gap-3 pb-2 sm:pb-4" style={{ width: 'max-content' }}>
              {categories.map((category) => (
  <button
    key={category.name}
    className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
      selectedCategory === category.name
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-xl font-semibold mb-4">Your Queue Smart Stats</h3>
            <Card>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{userStats.totalTimeSaved} mins</p>
                    <p className="text-sm text-default-500">Total Time Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{userStats.queuesJoined}</p>
                    <p className="text-sm text-default-500">Queues Joined</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{userStats.averageTimeSaved} mins</p>
                    <p className="text-sm text-default-500">Avg. Time Saved per Queue</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-4">How you could use your saved time:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardBody className="p-4 flex items-center">
                      <Coffee className="h-8 w-8 text-primary mr-2" />
                      <span className="text-sm">Enjoy {Math.floor(userStats.totalTimeSaved / 15)} coffee breaks</span>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="p-4 flex items-center">
                      <BookOpen className="h-8 w-8 text-primary mr-2" />
                      <span className="text-sm">Read {Math.floor(userStats.totalTimeSaved / 30)} book chapters</span>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="p-4 flex items-center">
                      <Dumbbell className="h-8 w-8 text-primary mr-2" />
                      <span className="text-sm">Complete {Math.floor(userStats.totalTimeSaved / 45)} workouts</span>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="p-4 flex items-center">
                      <Users className="h-8 w-8 text-primary mr-2" />
                      <span className="text-sm">Have {Math.floor(userStats.totalTimeSaved / 60)} hour-long chats</span>
                    </CardBody>
                  </Card>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Popular Queues */}
        <section className="py-4 sm:py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-2 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">Popular Queues</h3>
              <Link href="/user/queues" className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 ease-in-out">
                View all
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex gap-3 sm:gap-4 pb-2 sm:pb-4" style={{ width: 'max-content' }}>
                {isLoading ? (
                  // Skeleton loading state
                  Array(6).fill().map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: '250px', maxWidth: '100%' }}>
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
                  popularQueues.map((queue) => (
                    <div key={queue.queue_id} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: '250px', maxWidth: '100%' }}>
                      <Image
                        src={queue.image_url || 'https://via.placeholder.com/400x200'}
                        alt={queue.name}
                        width={400}
                        height={200}
                        className="w-full h-32 sm:h-40 object-cover"
                      />
                      <div className="p-2 sm:p-4">
                        <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{queue.name}</h4>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span>{queue.total_est_wait_time} mins wait</span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span>{queue.current_queue} people in queue</span>
                        </div>
                        <Link href={`/user/queue/${queue.queue_id}`}>
                          <Button className="w-full bg-gray-800 text-white py-1 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-gray-700">
                            View Queue
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}