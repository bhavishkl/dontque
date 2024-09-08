'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '../components/UserLayout/header'

const categories = [
  { name: 'Restaurants', icon: '🍽️' },
  { name: 'Retail', icon: '🛍️' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Government', icon: '🏛️' },
  { name: 'Entertainment', icon: '🎭' },
  { name: 'Education', icon: '🎓' },
  { name: 'Banking', icon: '🏦' },
  { name: 'Fitness', icon: '💪' },
]

const popularQueues = [
  { name: 'Central Perk Coffee', wait: '15 mins', people: 12, image: 'https://via.placeholder.com/100' },
  { name: 'DMV Services', wait: '45 mins', people: 30, image: 'https://via.placeholder.com/100' },
  { name: 'Smithsonian Museum', wait: '20 mins', people: 25, image: 'https://via.placeholder.com/100' },
  { name: 'Apple Store Genius Bar', wait: '30 mins', people: 18, image: 'https://via.placeholder.com/100' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Section with Search */}
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Find and Join Queues Near You</h2>
            <div className="relative max-w-2xl mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search for queues or locations..."
                className="pl-10 pr-4 py-3 w-full text-lg rounded-full bg-white text-gray-800"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h3 className="text-xl font-semibold mb-4">Categories</h3>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 p-4">
                {categories.map((category) => (
                  <button key={category.name} className="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                    <span className="mr-2 text-2xl">{category.icon}</span>
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
            <h3 className="text-xl font-semibold mb-4">Popular Queues</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularQueues.map((queue) => (
                <div key={queue.name} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Image
                    src={queue.image}
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
                      <span>{queue.wait} wait</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{queue.people} people in queue</span>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Join Queue</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* View All Queues */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Link href="/queues" className="flex items-center justify-between p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <span className="text-lg font-semibold">View All Queues</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 QueueSmart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}