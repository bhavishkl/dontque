'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Users, Clock, TrendingUp, Settings, Play, Pause, MessageSquare, UserPlus, UserMinus, RefreshCw, Check, X } from 'lucide-react'
import { Button, Input, Card, CardBody, CardHeader, Chip, Switch, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton } from "@nextui-org/react"

export default function QueueManagementPage({ params }) {
  const [queueData, setQueueData] = useState(null)
  const [customersInQueue, setCustomersInQueue] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [serviceTime, setServiceTime] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchQueueData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/queues/${params.queueId}/manage`)
        if (!response.ok) {
          throw new Error('Failed to fetch queue data')
        }
        const data = await response.json()
        setQueueData(data.queueData)
        setServiceTime(data.queueData.est_time_to_serve.toString())
        setCustomersInQueue(data.customersInQueue)
      } catch (error) {
        console.error('Error fetching queue data:', error)
        toast.error('Failed to load queue data')
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchQueueData()
  }, [params.queueId])

  const handleToggleQueue = async () => {
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
    // TODO: Implement serve functionality
    console.log('Serve functionality not implemented yet');
    toast.info('Serve functionality coming soon');
  }

  const handleNoShow = async (userId) => {
    // TODO: Implement no-show functionality
    console.log('No-show functionality not implemented yet');
    toast.info('No-show functionality coming soon');
  }

  const handleAddCustomer = async () => {
    try {
      const response = await fetch(`/api/queues/${params.queueId}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Walk-in Customer' }),
      })
      if (!response.ok) {
        throw new Error('Failed to add customer to queue')
      }
      const newCustomer = await response.json()
      setCustomersInQueue(prevCustomers => [...prevCustomers, newCustomer])
      toast.success('Customer added to queue')
    } catch (error) {
      console.error('Error adding customer to queue:', error)
      toast.error('Failed to add customer to queue')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center text-blue-600">
            <ArrowLeft className="mr-2" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold">
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
            <Card className="mb-8">
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
                      />
                      <span>
                        {queueData.status === 'active' ? "Pause Queue" : "Activate Queue"}
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
                      <span>min</span>
                    </div>
                    <Button onClick={handleUpdateServiceTime}>Update Service Time</Button>
                  </div>
                </div>
              </CardBody>
            </Card>

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
                  <h3 className="text-sm font-medium">Avg. Wait Time</h3>
                  <Clock className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{queueData.avgWaitTime} min</div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Total Served Today</h3>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{queueData.totalServed}</div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Est. Service Time</h3>
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{queueData.estimatedServiceTime} min</div>
                </CardBody>
              </Card>
            </div>

            <div className="flex space-x-4 mb-8">
              <Button color="primary" startContent={<UserPlus />} onClick={handleAddCustomer}>
                Add Customer
              </Button>
              <Button variant="bordered" startContent={<MessageSquare />}>
                Notify All
              </Button>
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Customers in Queue</h2>
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
          </>
        ) : (
          <div>Error loading queue data</div>
        )}
      </main>
    </div>
  )
}