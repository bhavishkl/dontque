'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Users, Clock, Settings, Plus, PieChart, DollarSign } from 'lucide-react'
import { Button } from "@nextui-org/button"
import { Card, CardBody } from "@nextui-org/card"
import { Skeleton } from "@nextui-org/skeleton"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useApi } from '../hooks/useApi'
import { useUserInfo } from '../hooks/useUserName'
import { toast } from "sonner"

// Dynamic import of QueueTable
const QueueTable = dynamic(
  () => import('../components/DashboardComponents/QueueTable'),
  {
    loading: () => <Skeleton className="w-full h-[400px] rounded-lg" />,
    ssr: false
  }
)

export default function QueueOwnerDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const { role } = useUserInfo(session?.user?.id)

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
        refetchQueuesData()
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
      refetchQueuesData()
    } catch (error) {
      console.error('Error updating queue status:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/70 backdrop-blur-lg border-b border-divider z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">Queue Owner Dashboard</h1>
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

        

        <QueueTable 
          isLoading={isLoading}
          queues={queuesData}
          handleDeleteQueue={handleDeleteQueue}
          handlePauseQueue={handlePauseQueue}
        />
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