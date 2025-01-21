'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Clock, Settings, Plus, Search, MoreVertical, PieChart, DollarSign } from 'lucide-react'
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table"
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/70 backdrop-blur-lg border-b border-divider z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Queue Owner Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button 
              variant="light" 
              startContent={<Settings className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Settings
            </Button>
            <Link href="/dashboard/create-queue">
              <Button 
                color="primary" 
                startContent={<Plus className="w-4 h-4" />}
                className="font-medium"
              >
                New Queue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-background/60 shadow-md hover:shadow-xl transition-all duration-200 border border-divider">
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-default-500">Active Queues</p>
                  <div className="text-2xl font-semibold mt-1">
                    {overallStats.activeQueues}/{overallStats.totalQueues}
                  </div>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="h-1 w-full bg-default-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{ width: `${(overallStats.activeQueues/overallStats.totalQueues) * 100}%` }}
                />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-background/60 shadow-md hover:shadow-xl transition-all duration-200 border border-divider">
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-default-500">Customers Today</p>
                  <div className="text-2xl font-semibold mt-1">{overallStats.totalServedToday}</div>
                </div>
                <div className="p-2 rounded-full bg-success/10">
                  <Users className="h-5 w-5 text-success" />
                </div>
              </div>
              <p className="text-sm text-default-400">
                Currently waiting: {overallStats.totalCustomers}
              </p>
            </CardBody>
          </Card>

          <Card className="bg-background/60 shadow-md hover:shadow-xl transition-all duration-200 border border-divider">
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-default-500">Avg. Wait Time</p>
                  <div className="text-2xl font-semibold mt-1">{overallStats.avgWaitTime} min</div>
                </div>
                <div className="p-2 rounded-full bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
              <p className="text-sm text-default-400">
                Peak hours: {overallStats.peakHours}
              </p>
            </CardBody>
          </Card>

          <Card className="bg-background/60 shadow-md hover:shadow-xl transition-all duration-200 border border-divider">
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-default-500">Revenue Impact</p>
                  <div className="text-2xl font-semibold mt-1">
                    {overallStats.businessValue.roi}%
                  </div>
                </div>
                <div className="p-2 rounded-full bg-secondary/10">
                  <DollarSign className="h-5 w-5 text-secondary" />
                </div>
              </div>
              <p className="text-sm text-default-400">
                +₹{overallStats.businessValue.totalExtraRevenue.toLocaleString()}
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">Your Queues</h2>
          <div className="w-full sm:w-auto max-w-sm">
            <Input
              type="search"
              placeholder="Search queues..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <Card className="bg-background/60 shadow-sm">
          <CardBody>
            <Table aria-label="Queues table" className="min-h-[400px]">
              <TableHeader>
                <TableColumn>QUEUE NAME</TableColumn>
                <TableColumn>CURRENT</TableColumn>
                <TableColumn>7-DAY AVG WAIT TIME</TableColumn>
                <TableColumn>SERVED TODAY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>RATING</TableColumn>
                <TableColumn >ACTIONS</TableColumn>
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
                      <TableCell>{queue.seven_day_avg_wait_time?.toFixed(1) || '0'} min</TableCell>
                      <TableCell>{queue.total_served}</TableCell>
                      <TableCell>
                        <div>
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              queue.status === 'active' 
                                ? 'bg-success-500' 
                                : 'bg-warning-500'
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-lg">★</span>
                          <span className="text-sm text-default-600">
                            {queue.avg_rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/manage/${queue.queue_id}`} className="inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-500">Manage Queue</Link>
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