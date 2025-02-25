'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Users, Clock, Settings, Plus, PieChart, DollarSign, Trash2, Search, MoreVertical } from 'lucide-react'
import { Button } from "@nextui-org/button"
import { Card, CardBody } from "@nextui-org/card"
import { Skeleton } from "@nextui-org/skeleton"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useApi } from '../hooks/useApi'
import { useUserInfo } from '../hooks/useUserName'
import { toast } from "sonner"
import { 
  useDisclosure 
} from "@nextui-org/react"
import { Input } from "@nextui-org/input"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table"

// Dynamically import the DeleteModal component
const DeleteModal = dynamic(
  () => import('../components/DashboardComponents/DeleteModal'),
  {
    ssr: false
  }
)

export default function QueueOwnerDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const { role } = useUserInfo(session?.user?.id)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [queueToDelete, setQueueToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const { data: queuesData, isLoading, isError, mutate: refetchQueuesData } = useApi('/api/queues/owner')

  useEffect(() => {
    if (!session) {
      router.push('/signin')
    } else if (role === 'user') {
      router.push('/user/home')
    }
  }, [session, role, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('created') === 'true') {
      toast.success('Welcome to your new queue!', {
        description: 'Start managing your queue from here.',
      });
      router.replace('/dashboard');
    }
  }, [router]);

  if (!session || role === 'user') {
    return null
  }

  if (isError) {
    console.error('Error fetching queues:', isError)
    toast.error('Error loading queues. Please try again.')
  }

  const filteredQueues = queuesData ? queuesData.filter(queue => 
    queue.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const handleDeleteQueue = (queueId, queueName) => {
    setQueueToDelete({ id: queueId, name: queueName })
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteQueue = async () => {
    if (!queueToDelete) return
    
    setIsDeleting(true)
    const loadingToast = toast.loading(`Deleting ${queueToDelete.name}...`)
    
    try {
      const response = await fetch(`/api/queues/${queueToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      toast.dismiss(loadingToast)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete queue')
      }
      
      // Success
      toast.success('Queue deleted successfully')
      refetchQueuesData()
    } catch (error) {
      console.error('Error deleting queue:', error)
      toast.error(error.message || 'Failed to delete queue. Please try again.')
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
      setQueueToDelete(null)
    }
  }

  const handlePauseQueue = async (queueId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    const actionWord = newStatus === 'active' ? 'activating' : 'pausing'
    
    const loadingToast = toast.loading(`${actionWord} queue...`)
    
    try {
      const response = await fetch(`/api/queues/${queueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      toast.dismiss(loadingToast)
      
      if (!response.ok) {
        throw new Error(`Failed to ${actionWord.toLowerCase()} queue`)
      }
      
      toast.success(`Queue ${newStatus === 'active' ? 'activated' : 'paused'} successfully`)
      refetchQueuesData()
    } catch (error) {
      console.error(`Error ${actionWord} queue:`, error)
      toast.error(error.message || `Failed to ${actionWord.toLowerCase()} queue`)
    }
  }

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/70 backdrop-blur-lg border-b border-divider z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
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
                Create Queue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="container mx-auto px-4 py-6">
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-background/60">
                  <CardBody>
                    <Skeleton className="h-24 rounded-lg" />
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
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
        )}

        {/* Queue Table - Merged directly into page */}
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
                <TableColumn>ACTIONS</TableColumn>
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
                          <Link href={`/dashboard/manage/${queue.queue_id}`} className="inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200">Manage</Link>
                          <Button 
                            size="sm" 
                            variant="bordered" 
                            className="w-24"
                            onClick={() => handlePauseQueue(queue.queue_id, queue.status)}
                          >
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
                              <DropdownItem 
                                className="text-danger" 
                                color="danger" 
                                onClick={() => handleDeleteQueue(queue.queue_id, queue.name)}
                              >
                                Delete Queue
                              </DropdownItem>
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

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={confirmDeleteQueue}
        queueName={queueToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  )
}

// Helper functions for calculating stats
function calculatePeakHours(queues) {
  // Placeholder implementation
  return '2-4 PM'
}

function calculateDropoutRate(queues) {
  // Placeholder implementation
  return 5.2
}

function calculateCustomerSatisfaction(queues) {
  // Calculate average rating across all queues
  const validRatings = queues.filter(q => q.avg_rating > 0)
  if (validRatings.length === 0) return 0
  
  const avgRating = validRatings.reduce((sum, q) => sum + q.avg_rating, 0) / validRatings.length
  return avgRating
}

function calculateBusinessValue(queues) {
  // Placeholder implementation for ROI calculation
  const subscriptionCost = 499 // Monthly subscription cost
  const additionalCustomers = queues.reduce((sum, q) => sum + q.total_served, 0) * 0.15 // Assuming 15% more customers due to efficient queue management
  const revenuePerCustomer = 350 // Average revenue per customer
  const totalExtraRevenue = additionalCustomers * revenuePerCustomer
  const roi = subscriptionCost > 0 ? Math.round((totalExtraRevenue / subscriptionCost - 1) * 100) : 0
  
  return {
    subscriptionCost,
    additionalCustomers: Math.round(additionalCustomers),
    revenuePerCustomer,
    totalExtraRevenue: Math.round(totalExtraRevenue),
    roi
  }
}