'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Clock, Settings, Plus, Search, MoreVertical, PieChart, DollarSign } from 'lucide-react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useApi } from '../hooks/useApi'
import { useUserInfo } from '../hooks/useUserName'

export default function QueueOwnerDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const { role } = useUserInfo(session?.user?.id)

  const { data: queuesData, isLoading, isError, mutate: refetchQueuesData } = useApi('/api/queues/owner')

  useEffect(() => {
    if (!session) {
      router.push('/login')
    } else if (role === 'user') {
      router.push('/user/home')
    }
  }, [session, role, router])

  if (!session || role === 'user') {
    return null
  }

  if (isError) {
    console.error('Error fetching queues:', isError)
  }

  const filteredQueues = queuesData ? queuesData.filter(queue => 
    queue.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const overallStats = queuesData ? {
    // Basic Queue Stats
    totalQueues: queuesData.length,
    activeQueues: queuesData.filter(q => q.status === 'active').length,
    totalCustomers: queuesData.reduce((sum, queue) => sum + queue.current_queue, 0),
    
    // Time & Efficiency Metrics
    // Option 2: Exclude zero values (might be more accurate)
    avgWaitTime: Math.round(
      queuesData.reduce((sum, queue) => sum + (queue.seven_day_avg_wait_time || 0), 0) / 
      (queuesData.filter(queue => queue.seven_day_avg_wait_time > 0).length || 1)
    ),
    peakHours: calculatePeakHours(queuesData),
    
    // Customer Flow Metrics
    totalServedToday: queuesData.reduce((sum, queue) => sum + queue.total_served, 0),
    dropoutRate: calculateDropoutRate(queuesData),
    
    // Customer Satisfaction
    customerSatisfaction: calculateCustomerSatisfaction(queuesData),
    
    // Updated ROI metrics
    businessValue: calculateBusinessValue(queuesData),
  } : {
    totalQueues: 0,
    activeQueues: 0,
    totalCustomers: 0,
    avgWaitTime: 0,
    peakHours: '---',
    totalServedToday: 0,
    dropoutRate: 0,
    customerSatisfaction: 0,
    
    // New business value defaults
    businessValue: {
      subscriptionCost: 0,
      additionalCustomers: 0,
      revenuePerCustomer: 0,
      totalExtraRevenue: 0,
      roi: 0
    }
  }

  const handleDeleteQueue = async (queueId) => {
    if (window.confirm('Are you sure you want to delete this queue?')) {
      try {
        const response = await fetch(`/api/queues/${queueId}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete queue')
        }
        fetchQueuesData()
      } catch (error) {
        console.error('Error deleting queue:', error)
      }
    }
  }

  const handlePauseQueue = async (queueId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      const response = await fetch(`/api/queues/${queueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        throw new Error('Failed to update queue status')
      }
      fetchQueuesData()
    } catch (error) {
      console.error('Error updating queue status:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Queue Owner Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <Link href="/dashboard/create-queue">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Queue</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {/* Active Queues Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Queues</p>
                <div className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                  {overallStats.activeQueues}/{overallStats.totalQueues}
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all" 
                style={{ width: `${(overallStats.activeQueues/overallStats.totalQueues) * 100}%` }}
              />
            </div>
          </div>

          {/* Customers Today Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customers Today</p>
                <div className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                  {overallStats.totalServedToday}
                </div>
              </div>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Currently waiting: {overallStats.totalCustomers}
            </p>
          </div>

          {/* Average Wait Time Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Wait Time</p>
                <div className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                  {overallStats.avgWaitTime} min
                </div>
              </div>
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Peak hours: {overallStats.peakHours}
            </p>
          </div>

          {/* Revenue Impact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue Impact</p>
                <div className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                  {overallStats.businessValue.roi}%
                </div>
              </div>
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              +₹{overallStats.businessValue.totalExtraRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search and Title Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Queues</h2>
          <div className="w-full sm:w-auto max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search queues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Queues Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Queue Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wait Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">7-Day Avg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Served Today</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  Array(5).fill().map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-6"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : (
                  filteredQueues.map((queue) => (
                    <tr key={queue.queue_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-white">{queue.name}</span>
                          {queue.service_type === 'advanced' && (
                            <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-800">
                              PRO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{queue.current_queue}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{queue.avg_wait_time} min</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{queue.seven_day_avg_wait_time?.toFixed(1) || '0'} min</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{queue.total_served}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            queue.status === 'active' 
                              ? 'bg-green-500' 
                              : 'bg-amber-500'
                          }`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {queue.status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 text-lg">★</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {queue.avg_rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-2">
                          <Link 
                            href={`/dashboard/manage/${queue.queue_id}`}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            Manage Queue
                          </Link>
                          <button 
                            onClick={() => handlePauseQueue(queue.queue_id, queue.status)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            {queue.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                          <div className="relative group">
                            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block">
                              <button
                                onClick={() => router.push(`/dashboard/edit-queue/${queue.queue_id}`)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                Edit Queue
                              </button>
                              <button
                                onClick={() => handleDeleteQueue(queue.queue_id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                Delete Queue
                              </button>
                              <Link
                                href={`/dashboard/analytics/${queue.queue_id}`}
                                className="block px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                View Analytics
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper functions
function calculatePeakHours(queues) {
  return "14:00-16:00" // Placeholder
}

function calculateDropoutRate(queues) {
  return 5 // Placeholder percentage
}

function calculateCustomerSatisfaction(queues) {
  return 92 // Placeholder percentage
}

function calculateBusinessValue(queues) {
  // These values should come from your actual data
  const subscriptionCost =4999; // Monthly subscription cost
  
  // Calculate additional customers gained after implementing QMS
  const beforeQMS = 100; // Average customers per month before QMS
  const afterQMS = 150;  // Current customers per month with QMS
  const additionalCustomers = afterQMS - beforeQMS;
  
  // Average revenue per customer (should come from business data)
  const revenuePerCustomer = 300; // Average spend per customer
  
  // Calculate total extra revenue
  const totalExtraRevenue = additionalCustomers * revenuePerCustomer;
  
  // Calculate ROI
  // ROI = ((Gain from Investment - Cost of Investment) / Cost of Investment) * 100
  const roi = Math.round(((totalExtraRevenue - subscriptionCost) / subscriptionCost) * 100);

  return {
    subscriptionCost,
    additionalCustomers,
    revenuePerCustomer,
    totalExtraRevenue,
    roi
  }
}