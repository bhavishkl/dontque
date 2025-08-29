'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Users, Clock, Settings, Plus, PieChart, DollarSign, Trash2, Search, MoreVertical, Play, Pause, Star, TrendingUp, Eye } from 'lucide-react'
import { Button } from "@nextui-org/button"
import { Card, CardBody, CardHeader } from "@nextui-org/card"
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
import { Badge } from "@nextui-org/badge"
import { Chip } from "@nextui-org/chip"

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                variant="light" 
                startContent={<Settings className="w-4 h-4" />}
                className="hidden sm:flex"
              >
                Settings
              </Button>
              <Link href="/dashboard/create-queue" className="flex-1 sm:flex-none">
                <Button 
                  color="primary" 
                  startContent={<Plus className="w-4 h-4" />}
                  className="font-medium w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">Create Queue</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </Link>
            </div>
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
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <Card className="bg-background/60 shadow-md hover:shadow-xl transition-all duration-200 border border-divider">
              <CardBody className="gap-2 sm:gap-3 p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-default-500 truncate">Active Queues</p>
                    <div className="text-lg sm:text-2xl font-semibold mt-1">
                      {overallStats.activeQueues}/{overallStats.totalQueues}
                    </div>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 flex-shrink-0">
                    <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
              <CardBody className="gap-2 sm:gap-3 p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-default-500 truncate">Customers Today</p>
                    <div className="text-lg sm:text-2xl font-semibold mt-1">{overallStats.totalServedToday}</div>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-full bg-success/10 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-default-400 truncate">
                  Waiting: {overallStats.totalCustomers}
                </p>
              </CardBody>
            </Card>

            <Card className="bg-background/60 shadow-md hover:shadow-xl transition-all duration-200 border border-divider">
              <CardBody className="gap-2 sm:gap-3 p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-default-500 truncate">Avg. Wait Time</p>
                    <div className="text-lg sm:text-2xl font-semibold mt-1">{overallStats.avgWaitTime} min</div>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-full bg-warning/10 flex-shrink-0">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-default-400 truncate">
                  Peak: {overallStats.peakHours}
                </p>
              </CardBody>
            </Card>

            <Card className="bg-background/60 shadow-md hover:shadow-xl transition-all duration-200 border border-divider">
              <CardBody className="gap-2 sm:gap-3 p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-default-500 truncate">Revenue Impact</p>
                    <div className="text-lg sm:text-2xl font-semibold mt-1">
                      {overallStats.businessValue.roi}%
                    </div>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-full bg-secondary/10 flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-default-400 truncate">
                  +₹{overallStats.businessValue.totalExtraRevenue.toLocaleString()}
                </p>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Queue Cards - Replacing the table */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Your Queues</h2>
          <div className="w-full sm:w-auto sm:max-w-sm">
            <Input
              type="search"
              placeholder="Search queues..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              size="sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill().map((_, index) => (
              <Card key={index} className="bg-background/60 shadow-sm">
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredQueues.length === 0 ? (
          <Card className="bg-background/60 shadow-sm">
            <CardBody className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-default-100 rounded-full flex items-center justify-center">
                  <PieChart className="w-8 h-8 text-default-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-default-700">No queues found</h3>
                  <p className="text-sm text-default-500 mt-1">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first queue to get started'}
                  </p>
                </div>
                {!searchTerm && (
                  <Link href="/dashboard/create-queue">
                    <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
                      Create Queue
                    </Button>
                  </Link>
                )}
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQueues.map((queue) => (
              <Card 
                key={queue.queue_id} 
                className="bg-background/60 shadow-sm hover:shadow-md transition-all duration-200 border border-divider/50 hover:border-divider"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-default-900 truncate">
                          {queue.name}
                        </h3>
                        {queue.service_type === 'advanced' && (
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            color="secondary"
                            className="text-xs"
                          >
                            PRO
                          </Chip>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          queue.status === 'active' 
                            ? 'bg-success-500' 
                            : 'bg-warning-500'
                        }`} />
                        <span className="text-sm text-default-500 capitalize">
                          {queue.status}
                        </span>
                      </div>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm" className="text-default-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Queue Actions">
                        <DropdownItem 
                          startContent={<Eye className="w-4 h-4" />}
                          onClick={() => router.push(`/dashboard/manage/${queue.queue_id}`)}
                        >
                          Manage Queue
                        </DropdownItem>
                        <DropdownItem 
                          startContent={<TrendingUp className="w-4 h-4" />}
                          onClick={() => router.push(`/dashboard/analytics/${queue.queue_id}`)}
                        >
                          View Analytics
                        </DropdownItem>
                        <DropdownItem 
                          startContent={<Settings className="w-4 h-4" />}
                          onClick={() => router.push(`/dashboard/edit-queue/${queue.queue_id}`)}
                        >
                          Edit Queue
                        </DropdownItem>
                        <DropdownItem 
                          className="text-danger" 
                          color="danger"
                          startContent={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDeleteQueue(queue.queue_id, queue.name)}
                        >
                          Delete Queue
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </CardHeader>
                
                <CardBody className="pt-0">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-default-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {queue.current_queue}
                      </div>
                      <div className="text-xs text-default-500">Current</div>
                    </div>
                    <div className="text-center p-3 bg-default-50 rounded-lg">
                      <div className="text-2xl font-bold text-success">
                        {queue.total_served}
                      </div>
                      <div className="text-xs text-default-500">Served Today</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-default-400" />
                        <span className="text-sm text-default-600">Avg Wait Time</span>
                      </div>
                      <span className="text-sm font-medium">
                        {queue.seven_day_avg_wait_time?.toFixed(1) || '0'} min
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-default-400" />
                        <span className="text-sm text-default-600">Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm font-medium">
                          {queue.avg_rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">

                    <Button 
                      color="primary" 
                      variant="flat" 
                      size="sm" 
                      className="flex-1"
                      startContent={<Eye className="w-4 h-4" />}
                      onClick={() => router.push(`/dashboard/manage/${queue.queue_id}`)}
                    >
                      Manage
                    </Button>

                    <Button 
                      size="sm" 
                      variant="bordered"
                      onClick={() => handlePauseQueue(queue.queue_id, queue.status)}
                      startContent={queue.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    >
                      {queue.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
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