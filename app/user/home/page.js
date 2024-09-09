'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '../../components/UserLayout/header'
import { Button, Input } from "@nextui-org/react"

const categories = [
  { name: 'All', icon: '🌐' },
  { name: 'Restaurants', icon: '🍽️' },
  { name: 'Retail', icon: '🛍️' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Government', icon: '🏛️' },
  { name: 'Entertainment', icon: '🎭' },
  { name: 'Education', icon: '🎓' },
  { name: 'Banking', icon: '🏦' },
  { name: 'Fitness', icon: '💪' },
]

export default function Home() {
  const [popularQueues, setPopularQueues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/queues?search=${searchQuery}&category=${selectedCategory}&limit=6`);
      const data = await response.json();
      setPopularQueues(data);
    } catch (error) {
      console.error('Error searching queues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Skip the Wait, Join Smart</h1>
                <p className="text-lg mb-4">Find and join queues near you instantly.</p>
              </div>
              <div className="md:w-1/2">
                <form onSubmit={handleSearch} className="flex">
                  <Input
                    type="search"
                    placeholder="Search queues or locations..."
                    className="w-full"
                    size="lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  />
                  <Button type="submit" color="primary" size="lg" className="ml-2" isLoading={isLoading}>
                    Search
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h3 className="text-xl font-semibold mb-4">Categories</h3>
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex gap-3 pb-4" style={{ width: 'max-content' }}>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-in-out whitespace-nowrap ${
                      selectedCategory === category.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <span className="mr-2 text-xl">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Queues */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Popular Queues</h3>
              <Link href="/user/queues" className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 ease-in-out">
                View all
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                {popularQueues.map((queue) => (
                  <div key={queue.queue_id} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: '300px' }}>
                    <Image
                      src={queue.image_url || 'https://via.placeholder.com/400x200'}
                      alt={queue.name}
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{queue.name}</h4>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{queue.avg_wait_time} mins wait</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{queue.current_queue} people in queue</span>
                      </div>
                      <Link href={`/user/queue/${queue.queue_id}`}>
                        <Button className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700">
                          View Queue
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}