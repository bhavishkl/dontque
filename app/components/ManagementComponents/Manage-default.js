'use client'

import { useState, useEffect, cloneElement } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Users, Clock, TrendingUp, Settings, MessageSquare, UserMinus, RefreshCw, Check, X, BarChart2, AlertCircle, Activity } from 'lucide-react'
import { Button, Input, Card, CardBody, CardHeader, Chip, Switch, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton, Tabs, Tab } from "@nextui-org/react"
import AddKnownUserModal from '@/app/components/UniComp/AddKnownUserModal'
import { createClient } from '@supabase/supabase-js'
import QueueQRCode from '@/app/components/QueueQRCode'
import { useApi } from '@/app/hooks/useApi'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function ManageDefault({ params, queueData: initialQueueData, isLoading: initialLoading }) {
  const { data: queueData, isLoading, mutate: refetchQueueData } = useApi(`/api/queues/${params.queueId}/manage`, {
    fallbackData: initialQueueData,
    revalidateOnMount: true,
    dedupingInterval: 5000
  })

  const [customersInQueue, setCustomersInQueue] = useState([])
  const [serviceTime, setServiceTime] = useState('')
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)
  const [activeTab, setActiveTab] = useState("cards")
  const [loadingActions, setLoadingActions] = useState({})

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
        window.dispatchEvent(new CustomEvent('refetchQueueData'));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params.queueId])

  const handleToggleQueue = async () => {
    setIsToggling(true)
    try {
      const newStatus = queueData.queueData.status === 'active' ? 'paused' : 'active'
      const response = await fetch(`/api/queues/${params.queueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        throw new Error('Failed to update queue status')
      }
      window.dispatchEvent(new CustomEvent('refetchQueueData'));
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
      window.dispatchEvent(new CustomEvent('refetchQueueData'));
      toast.success(`Service time updated to ${serviceTime} minutes`)
    } catch (error) {
      console.error('Error updating service time:', error)
      toast.error('Failed to update service time')
    }
  }

  const handleServed = async (entryId) => {
    setLoadingActions(prev => ({ ...prev, [entryId]: { serve: true } }))
    try {
      const response = await fetch(`/api/queues/${params.queueId}/customers/${entryId}/serve`, {
        method: 'POST',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark customer as served')
      }
      await refetchQueueData()
      toast.success('Customer served successfully')
      setCustomersInQueue(prevCustomers => prevCustomers.filter(customer => customer.entry_id !== entryId))
    } catch (error) {
      console.error('Error serving customer:', error)
      toast.error(error.message || 'Failed to serve customer')
    } finally {
      setLoadingActions(prev => ({ ...prev, [entryId]: { ...prev[entryId], serve: false } }))
    }
  }
  
  const handleNoShow = async (entryId) => {
    setLoadingActions(prev => ({ ...prev, [entryId]: { noShow: true } }))
    try {
      const response = await fetch(`/api/queues/${params.queueId}/customers/${entryId}/no-show`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark customer as no-show');
      }
      const data = await response.json();
      toast.success('Customer marked as no-show');
      refetchQueueData();
      setCustomersInQueue(prevCustomers => prevCustomers.filter(customer => customer.entry_id !== entryId));
    } catch (error) {
      console.error('Error marking customer as no-show:', error);
      toast.error('Failed to mark customer as no-show');
    } finally {
      setLoadingActions(prev => ({ ...prev, [entryId]: { ...prev[entryId], noShow: false } }))
    }
  };

  const handleAddKnownSuccess = async () => {
    await refetchQueueData()
  }

  const CustomerCard = ({ customer, index, onServed, onNoShow, loadingActions }) => {
    return (
      <Card className="w-full dark:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all">
        <CardBody>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-primary to-primary-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-sm">
                  {customer.user_profile?.name?.[0] || customer.name?.[0] || 'W'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-white">
                    {customer.user_profile?.name || customer.name || 'Walk-in Customer'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Queue ID: {customer.entry_id}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 text-sm bg-default-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Waiting time</p>
                <p className="font-semibold dark:text-white">{customer.waitingTime || '15m 20s'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Est. service time</p>
                <p className="font-semibold dark:text-white">{customer.estimatedServiceTime || '20m'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Joined at</p>
                <p className="font-semibold dark:text-white">{customer.formattedJoinTime}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <Chip size="sm" color="primary" variant="flat">
                  {customer.status || 'Waiting'}
                </Chip>
              </div>
            </div>
  
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Additional notes</p>
              <Input 
                placeholder="Add notes here..." 
                variant="bordered" 
                className="dark:bg-gray-700/50"
                size="sm"
              />
            </div>
  
            <div className="flex justify-between items-center pt-4">
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  color="success" 
                  variant="flat" 
                  onClick={() => onServed(customer.entry_id)}
                  isLoading={loadingActions[customer.entry_id]?.serve}
                  className="font-medium"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Served
                </Button>
                <Button 
                  size="sm" 
                  color="danger" 
                  variant="flat" 
                  onClick={() => onNoShow(customer.entry_id)}
                  isLoading={loadingActions[customer.entry_id]?.noShow}
                  className="font-medium"
                >
                  <X className="mr-1 h-4 w-4" />
                  No Show
                </Button>
              </div>
              <Button 
                size="sm" 
                color="primary" 
                variant="light"
                className="font-medium"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Notify
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };
  
  const CustomerCardStack = ({ customers, onServed, onNoShow, loadingActions }) => {
    return (
      <div className="relative w-full max-w-md mx-auto">
        {customers.map((customer, index) => (
          <div
            key={customer.entry_id}
            className="absolute w-full"
            style={{
              top: `${index * 4}px`,
              left: `${index * 4}px`,
              zIndex: customers.length - index,
            }}
          >
            <CustomerCard
              customer={customer}
              index={index}
              onServed={onServed}
              onNoShow={onNoShow}
              loadingActions={loadingActions}
            />
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-divider z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center text-primary hover:text-primary-500 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">
            {isLoading ? <Skeleton className="w-40 h-8" /> : queueData?.queueData?.name || 'Error'}
          </h1>
          <Button 
            variant="bordered" 
            startContent={<Settings className="h-4 w-4" />}
            className="hover:bg-default-100 transition-colors"
          >
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
      <Card className="mb-8 dark:bg-gray-800/50 shadow-md hover:shadow-lg transition-all">
        <CardBody>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Chip 
                color={queueData.queueData.status === 'active' ? "success" : "warning"}
                variant="dot"
                className="capitalize"
              >
                {queueData.queueData.status === 'active' ? "Active" : "Paused"}
              </Chip>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={queueData.queueData.status === 'active'}
                  onChange={handleToggleQueue}
                  isDisabled={isToggling}
                  size="lg"
                  color="success"
                />
                <span className="dark:text-gray-300 text-sm">
                  {isToggling ? "Updating..." : (queueData.queueData.status === 'active' ? "Pause Queue" : "Activate Queue")}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                  className="w-24"
                  size="sm"
                  labelPlacement="outside"
                  label="Service Time"
                  endContent={<span className="text-default-400 text-sm">min</span>}
                />
              </div>
              <Button 
                onClick={handleUpdateServiceTime} 
                color="primary"
                size="sm"
                className="font-medium"
              >
                Update Time
              </Button>
              <AddKnownUserModal queueId={params.queueId} onSuccess={handleAddKnownSuccess} />
            </div>
          </div>
        </CardBody>
      </Card>

      <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
        <Tab key="cards" title="Queue Cards">
          <CustomerCardStack
            customers={customersInQueue}
            onServed={handleServed}
            onNoShow={handleNoShow}
            loadingActions={loadingActions}
          />
        </Tab>
        <Tab key="queue" title="Queue List">
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
                          <Button 
                            size="sm" 
                            color="success" 
                            variant="flat" 
                            onClick={() => handleServed(customer.entry_id)}
                            isLoading={loadingActions[customer.entry_id]?.serve}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Served
                          </Button>
                          <Button 
                            size="sm" 
                            color="danger" 
                            variant="flat" 
                            onClick={() => handleNoShow(customer.entry_id)}
                            isLoading={loadingActions[customer.entry_id]?.noShow}
                          >
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
        <Tab key="stats" title="Queue Analytics">
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[
              {
                title: "Current Queue",
                value: customersInQueue.length,
                icon: <Users className="h-4 w-4" />,
                color: "primary"
              },
              {
                title: "Current Avg. Wait Time",
                value: `${queueData.currentAvgWaitTime} min`,
                icon: <Clock className="h-4 w-4" />,
                color: "warning"
              },
              {
                title: "Served in Last Hour",
                value: queueData.servedLastHour,
                icon: <TrendingUp className="h-4 w-4" />,
                color: "success"
              },
              {
                title: "Current Service Time",
                value: `${queueData.currentServiceTime} min`,
                icon: <RefreshCw className="h-4 w-4" />,
                color: "primary"
              },
              {
                title: "Queue Efficiency",
                value: `${queueData.queueEfficiency}%`,
                icon: <BarChart2 className="h-4 w-4" />,
                color: "success"
              },
              {
                title: "Longest Wait",
                value: `${queueData.longestWait} min`,
                icon: <AlertCircle className="h-4 w-4" />,
                color: "warning"
              },
              {
                title: "No-Show Rate",
                value: `${queueData.noShowRate}%`,
                icon: <UserMinus className="h-4 w-4" />,
                color: "danger"
              },
              {
                title: "Peak Time",
                value: queueData.isPeakTime ? 'Yes' : 'No',
                icon: <Activity className="h-4 w-4" />,
                color: "primary"
              }
            ].map((stat, index) => (
              <Card key={index} className="bg-background/60 shadow-md hover:shadow-xl transition-all duration-200 border border-divider">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-default-600">{stat.title}</h3>
                  <div className={`p-2 rounded-full bg-${stat.color}/10`}>
                    {cloneElement(stat.icon, { className: `text-${stat.color}` })}
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Tab>
        <Tab key="qr" title="Quick Join QR">
          <Card className="mt-4">
            <CardHeader>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold">Quick Join QR Code</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Display this QR code at your location for customers to quickly join the queue
                </p>
              </div>
            </CardHeader>
            <CardBody className="flex justify-center items-center">
              <QueueQRCode 
                queueId={params.queueId} 
                queueName={queueData?.queueData?.name} 
              />
            </CardBody>
          </Card>
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