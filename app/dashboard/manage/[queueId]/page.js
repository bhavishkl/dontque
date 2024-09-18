'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Users, Clock, TrendingUp, Settings, Play, Pause, MessageSquare, UserPlus, UserMinus, RefreshCw, Check, X, BarChart2, AlertCircle, Activity } from 'lucide-react'
import { Button, Input, Card, CardBody, CardHeader, Chip, Switch, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton, Tabs, Tab } from "@nextui-org/react"
import AddKnownUserModal from '@/app/components/UniComp/AddKnownUserModal';
import { createClient } from '@supabase/supabase-js'
import { useApi } from '@/app/hooks/useApi'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function QueueManagementPage({ params }) {
  const [customersInQueue, setCustomersInQueue] = useState([])
  const [serviceTime, setServiceTime] = useState('')
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)
  const [activeTab, setActiveTab] = useState('stats')

  const { data: queueData, isLoading, isError, mutate: refetchQueueData } = useApi(`/api/queues/${params.queueId}/manage`)

  useEffect(() => {
    if (queueData) {
      setServiceTime(queueData.queueData.est_time_to_serve.toString())
      setCustomersInQueue(prevCustomers => {
        const newCustomers = queueData.customersInQueue.filter(newCustomer => 
          !prevCustomers.some(prevCustomer => prevCustomer.entry_id === newCustomer.entry_id)
        );
        if (newCustomers.length > 0) {
          toast.success('New customer joined the queue');
        }
        return [...prevCustomers, ...newCustomers];
      })
    }
  }, [queueData])

  useEffect(() => {
    const subscription = supabase
      .channel(`queue_${params.queueId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'queue_entries',
        filter: `queue_id=eq.${params.queueId}`
      }, (payload) => {
        console.log('New queue entry:', payload);
        refetchQueueData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params.queueId, refetchQueueData])

  const handleToggleQueue = async () => {
    setIsToggling(true)
    try {
      const newStatus = queueData.status === 'active' ? 'paused' : 'active'
      const response = await fetch(`/api/queues/${params.queueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        throw new Error('Failed to update queue status')
      }
      setQueueData(prevData => ({ ...prevData, status: newStatus }))
      toast.success(`Queue ${newStatus === 'active' ? 'activated' : 'paused'}`)
    } catch (error) {
      console.error('Error updating queue status:', error)
      toast.error('Failed to update queue status')
    } finally {
      setIsToggling(false)
    }
  }

  const handleUpdateServiceTime = async () => {
    try {
      const response = await fetch(`/api/queues/${params.queueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ est_time_to_serve: parseInt(serviceTime) }),
      })
      if (!response.ok) {
        throw new Error('Failed to update service time')
      }
      const updatedQueue = await response.json()
      setQueueData(prevData => ({ ...prevData, est_time_to_serve: updatedQueue.est_time_to_serve }))
      toast.success('Service time updated successfully')
    } catch (error) {
      console.error('Error updating service time:', error)
      toast.error('Failed to update service time')
    }
  }

  const handleServed = async (entryId) => {
    try {
      const response = await fetch(`/api/queues/${params.queueId}/customers/${entryId}/serve`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark customer as served');
      }
      const data = await response.json();
      toast.success('Customer served successfully');
      // Update the local state with the new queue data
      setQueueData(prevData => ({
        ...prevData,
        current_queue: data.current_queue,
        total_served: data.total_served
      }));
      // Remove the served customer from the list
      setCustomersInQueue(prevCustomers => prevCustomers.filter(customer => customer.entry_id !== entryId));
    } catch (error) {
      console.error('Error serving customer:', error);
      toast.error(error.message || 'Failed to serve customer');
    }
  };
  
  const handleNoShow = async (entryId) => {
    try {
      const response = await fetch(`/api/queues/${params.queueId}/customers/${entryId}/no-show`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark customer as no-show');
      }
      const data = await response.json();
      toast.success('Customer marked as no-show');
      // Update the local state with the new queue data
      setQueueData(prevData => ({
        ...prevData,
        current_queue: data.current_queue
      }));
      // Remove the no-show customer from the list
      setCustomersInQueue(prevCustomers => prevCustomers.filter(customer => customer.entry_id !== entryId));
    } catch (error) {
      console.error('Error marking customer as no-show:', error);
      toast.error('Failed to mark customer as no-show');
    }
  };

  const handleAddKnownSuccess = async () => {
    // Refresh the queue data after adding a known user
    await fetchQueueData();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center text-blue-600 dark:text-blue-400">
            <ArrowLeft className="mr-2" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">
            {isLoading ? <Skeleton className="w-40 h-8" /> : queueData?.name || 'Error'}
          </h1>
          <Button variant="bordered" startContent={<Settings />}>
            Queue Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
  {isLoading ? (
    <>
      <Skeleton className="w-full h-20 mb-8" />
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="w-full h-96" />
    </>
  ) : queueData ? (
    <>
      <Card className="mb-8 dark:bg-gray-800">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Chip color={queueData.status === 'active' ? "success" : "default"}>
                {queueData.status === 'active' ? "Active" : "Paused"}
              </Chip>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={queueData.status === 'active'}
                  onChange={handleToggleQueue}
                  isDisabled={isToggling}
                />
                <span className="dark:text-gray-300">
                  {isToggling ? "Updating..." : (queueData.status === 'active' ? "Pause Queue" : "Activate Queue")}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                  className="w-20"
                />
                <span className="dark:text-gray-300">min</span>
              </div>
              <Button onClick={handleUpdateServiceTime}>Update Service Time</Button>
              <AddKnownUserModal queueId={params.queueId} onSuccess={handleAddKnownSuccess} />
            </div>
          </div>
        </CardBody>
      </Card>

      <Tabs selectedKey="queue" onSelectionChange={setActiveTab}>
        <Tab key="queue" title="Queue">
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <h2 className="text-xl font-semibold dark:text-white">Customers in Queue</h2>
            </CardHeader>
            <CardBody>
              <Table>
                <TableHeader>
                  <TableColumn>Position</TableColumn>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Join Time</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {customersInQueue.map((customer, index) => (
                    <TableRow key={customer.entry_id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{customer.user_profile?.name || customer.name || 'Walk-in Customer'}</TableCell>
                      <TableCell>{customer.formattedJoinTime}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" color="success" variant="flat" onClick={() => handleServed(customer.entry_id)}>
                            <Check className="mr-1 h-4 w-4" />
                            Served
                          </Button>
                          <Button size="sm" color="danger" variant="flat" onClick={() => handleNoShow(customer.entry_id)}>
                            <X className="mr-1 h-4 w-4" />
                            No Show
                          </Button>
                          <Button size="sm" color="primary" variant="ghost">Notify</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="stats" title="Statistics">
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Current Queue</h3>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{customersInQueue.length}</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Current Avg. Wait Time</h3>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{queueData.currentAvgWaitTime} min</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Served in Last Hour</h3>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{queueData.servedLastHour}</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Current Service Time</h3>
                <RefreshCw className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{queueData.currentServiceTime} min</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Queue Efficiency</h3>
                <BarChart2 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{queueData.queueEfficiency}%</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Longest Wait</h3>
                <AlertCircle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{queueData.longestWait} min</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">No-Show Rate</h3>
                <UserMinus className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{queueData.noShowRate}%</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">Peak Time</h3>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardBody>
                <div className="text-2xl font-bold">{queueData.isPeakTime ? 'Yes' : 'No'}</div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </>
  ) : (
    <div className="dark:text-white">Error loading queue data</div>
  )}
</main>
    </div>
  )
}