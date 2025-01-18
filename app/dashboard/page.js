'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Clock, Settings, Plus, Search, MoreVertical, PieChart, Activity, DollarSign } from 'lucide-react'
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table"
import { Chip } from "@nextui-org/chip"
import { Skeleton } from "@nextui-org/skeleton"
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
    avgWaitTime: Math.round(queuesData.reduce((sum, queue) => sum + queue.avg_wait_time, 0) / queuesData.length),
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
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold dark:text-white">Queue Owner Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="bordered" startContent={<Settings />}>
              Settings
            </Button>
            <Link href="/dashboard/create-queue">
              <Button color="primary" startContent={<Plus />}>
                Create New Queue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </>
          ) : (
            <>
              <Card className="dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium dark:text-gray-200">Queue Status</h3>
                  <PieChart className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold dark:text-white">{overallStats.activeQueues}/{overallStats.totalQueues}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active Queues</p>
                </CardBody>
              </Card>

              <Card className="dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium dark:text-gray-200">Customer Flow</h3>
                  <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold dark:text-white">{overallStats.totalServedToday}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customers Served Today</p>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Current: {overallStats.totalCustomers} waiting
                  </div>
                </CardBody>
              </Card>

              <Card className="dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium dark:text-gray-200">Wait Time</h3>
                  <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold dark:text-white">{overallStats.avgWaitTime} min</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average Wait Time</p>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Peak: {overallStats.peakHours}
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold dark:text-white">Your Queues</h2>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search queues..."
              className="pl-8 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="dark:bg-gray-800">
          <CardBody>
            <Table>
              <TableHeader>
                <TableColumn className="dark:text-gray-200">Queue Name</TableColumn>
                <TableColumn className="dark:text-gray-200">Current Queue</TableColumn>
                <TableColumn className="dark:text-gray-200">Avg. Wait Time</TableColumn>
                <TableColumn className="dark:text-gray-200">Total Served Today</TableColumn>
                <TableColumn className="dark:text-gray-200">Status</TableColumn>
                <TableColumn className="dark:text-gray-200">Rating</TableColumn>
                <TableColumn className="dark:text-gray-200">Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill().map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredQueues.map((queue) => (
                    <TableRow key={queue.queue_id} className="dark:bg-gray-800 dark:text-white">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {queue.name}
                          {queue.service_type === 'advanced' && (
                            <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-purple-400 rounded-full border border-purple-400/20">
                              PRO
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{queue.current_queue}</TableCell>
                      <TableCell>{queue.avg_wait_time} min</TableCell>
                      <TableCell>{queue.total_served}</TableCell>
                      <TableCell>
                        <Chip 
                          className="w-3 h-3 min-w-0 p-0" 
                          color={queue.status === 'active' ? 'success' : 'warning'}
                          variant="solid"
                        >
                          &nbsp;
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-yellow-500 flex items-center gap-1">
                          ★ {queue.avg_rating?.toFixed(1) || '0.0'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => router.push(`/dashboard/manage/${queue.queue_id}`)}>Manage Queue</Button>
                          <Button size="sm" variant="bordered" onClick={() => handlePauseQueue(queue.queue_id, queue.status)}>
                            {queue.status === 'active' ? 'Pause' : 'Activate'}
                          </Button>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly variant="light" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="More Actions">
                              <DropdownItem onClick={() => router.push(`/dashboard/edit-queue/${queue.queue_id}`)}>Edit Queue</DropdownItem>
                              <DropdownItem className="text-danger" color="danger" onClick={() => handleDeleteQueue(queue.queue_id)}>Delete Queue</DropdownItem>
                              <DropdownItem>
                                <Link href={`/dashboard/analytics/${queue.queue_id}`}>View Analytics</Link>
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
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