'use client'

import { useState, useEffect, cloneElement, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Users, Clock, TrendingUp, Settings, MessageSquare, UserMinus, RefreshCw, Check, X, BarChart2, AlertCircle, Activity, QrCode, Play, Pause, Bell } from 'lucide-react'
import { Button, Input, Card, CardBody, CardHeader, Chip, Switch, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton, Tabs, Tab } from "@nextui-org/react"
import { createClient } from '@supabase/supabase-js'
import QueueQRCode from '@/app/components/QueueQRCode'
import { useApi } from '@/app/hooks/useApi'
import dynamic from 'next/dynamic'
import AddKnownUserModal from '@/app/components/UniComp/AddKnownUserModal'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ManageDefault({ params, queueData: initialQueueData, isLoading: initialLoading }) {
  const { data: queueData, isLoading, mutate: refetchQueueData } = useApi(`/api/queues/${params.queueId}/manage-v2?includeMetrics=true`, {
    revalidateOnMount: true,
  })

  const [customersInQueue, setCustomersInQueue] = useState([])
  const [serviceTime, setServiceTime] = useState('')
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)
  const [activeTab, setActiveTab] = useState("cards")
  const [loadingActions, setLoadingActions] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false)
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false)
  const [shouldLoadDelayModal, setShouldLoadDelayModal] = useState(false)
  const [shouldLoadPauseModal, setShouldLoadPauseModal] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [shouldLoadAddUserModal, setShouldLoadAddUserModal] = useState(false)

  const DelayModal = dynamic(
    () => import('./DelayModal'),
    { 
      loading: () => null,
      ssr: false 
    }
  )

  const PauseConfirmationModal = dynamic(
    () => import('./PauseConfirmationModal'),
    { 
      loading: () => null,
      ssr: false 
    }
  )

  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const addRecentActivity = (userName, action) => {
    const key = `recentActivity_${params.queueId}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    const newEntry = { userName, action, timestamp: new Date().toISOString() };
    const updated = [newEntry, ...stored].slice(0, 2);
    localStorage.setItem(key, JSON.stringify(updated));
    setRecentActivity(updated);
  };

  useEffect(() => {
    const key = `recentActivity_${params.queueId}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    setRecentActivity(stored);
  }, [params.queueId]);

  useEffect(() => {
    if (queueData) {
      setServiceTime(queueData.queueData.est_time_to_serve.toString())
      setCustomersInQueue(queueData.customersInQueue || [])
    }
  }, [queueData])

  useEffect(() => {
    const subscription = supabase
      .channel(`queue_${params.queueId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'queue_entries',
        filter: `queue_id=eq."${params.queueId}"`
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
      
      await refetchQueueData()
      setIsPauseModalOpen(false)
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          queueData: queueData.queueData,
          customersInQueue: queueData.customersInQueue
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark customer as served')
      }
      
      const servedCustomer = customersInQueue.find(customer => customer.entry_id === entryId);
      if (servedCustomer) {
         addRecentActivity(servedCustomer.user_profile?.name || servedCustomer.name || 'Customer', 'served');
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
      
      const noShowCustomer = customersInQueue.find(customer => customer.entry_id === entryId);
      if (noShowCustomer) {
         addRecentActivity(noShowCustomer.user_profile?.name || noShowCustomer.name || 'Customer', 'no-show');
      }
      
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchQueueData()
      toast.success('Queue refreshed')
    } catch (error) {
      toast.error('Failed to refresh')
    } finally {
      setIsRefreshing(false)
    }
  }

  const nextCard = () => {
    setCurrentCardIndex(prev => 
      prev + 1 >= customersInQueue.length ? 0 : prev + 1
    )
  }

  const previousCard = () => {
    setCurrentCardIndex(prev => 
      prev - 1 < 0 ? customersInQueue.length - 1 : prev - 1
    )
  }

  const handleDelayClick = () => {
    setShouldLoadDelayModal(true);
    setIsDelayModalOpen(true);
  };

  const handleDelay = async (delayData) => {
    try {
      const response = await fetch(`/api/queues/${params.queueId}/delay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          delayUntil: delayData.delayUntil,
          queueData: queueData.queueData,
          customersInQueue: queueData.customersInQueue
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add delay');
      }

      await refetchQueueData();
      setIsDelayModalOpen(false);
      toast.success('Queue delay added successfully');
    } catch (error) {
      console.error('Error adding delay:', error);
      toast.error(error.message || 'Failed to add delay');
    }
  };

  const handlePauseClick = () => {
    setShouldLoadPauseModal(true)
    setIsPauseModalOpen(true)
  }

  const handleAddUserClick = () => {
    setShouldLoadAddUserModal(true);
    setIsAddUserModalOpen(true);
  }

  const handleUserAdded = async () => {
    await refetchQueueData();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="container mx-auto px-4">
          <div className="py-3 flex justify-between items-center">
            <Link 
              href="/dashboard" 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div className="flex gap-2">
              <Button 
                isIconOnly
                variant="flat"
                className="bg-gray-100 dark:bg-gray-700"
                size="sm"
                onClick={handleRefresh}
                isLoading={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                isIconOnly
                variant="flat"
                className="bg-gray-100 dark:bg-gray-700"
                size="sm"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                isIconOnly
                variant="flat"
                className="bg-gray-100 dark:bg-gray-700"
                size="sm"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="pb-3">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
              {initialLoading ? (
                <Skeleton className="w-40 h-8 mx-auto" />
              ) : (
                queueData?.queueData?.name || 'Error'
              )}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <>
            <Skeleton className="w-full h-96 mb-8" />
            <div className="grid gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>
          </>
        ) : queueData ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg mb-8">
              <div className="tabs-scrollbar">
                <Tabs 
                  aria-label="Queue Management Options" 
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  className="w-full"
                  classNames={{
                    tabList: "tabs-container gap-4 w-full relative",
                    cursor: "w-full",
                    tab: "px-4 h-10 w-auto flex-nowrap",
                    tabContent: "group-data-[selected=true]:text-primary"
                  }}
                >
                  <Tab 
                    key="queue-cards" 
                    title={
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Queue Cards</span>
                      </div>
                    }
                  />
                  <Tab 
                    key="queue-list" 
                    title={
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Queue List</span>
                      </div>
                    }
                  />
                  <Tab 
                    key="analytics" 
                    title={
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        <span>Analytics</span>
                      </div>
                    }
                  />
                  <Tab 
                    key="qr-code" 
                    title={
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        <span>QR Code</span>
                      </div>
                    }
                  />
                </Tabs>
              </div>
              
              {activeTab === "queue-cards" && (
                <div className="mt-6">
                  {customersInQueue.length > 0 ? (
                    <div className="relative max-w-md mx-auto">
                      <Card className="w-full dark:bg-gray-800/50 shadow-md hover:shadow-lg transition-all">
                        <CardBody className="p-4">
                          <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-br from-primary to-primary-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-sm">
                                  {customersInQueue[currentCardIndex].user_profile?.name?.[0] || 
                                   customersInQueue[currentCardIndex].name?.[0] || 'W'}
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold dark:text-white">
                                    {customersInQueue[currentCardIndex].user_profile?.name || 
                                     customersInQueue[currentCardIndex].name || 'Walk-in Customer'}
                                  </h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Queue ID: {customersInQueue[currentCardIndex].entry_id.substring(0, 8)}...
                                  </p>
                                </div>
                              </div>
                              <Chip size="sm" color="primary" variant="flat">
                                #{currentCardIndex + 1}
                              </Chip>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm bg-default-50 dark:bg-gray-700/50 p-3 rounded-lg">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Waiting time</p>
                                <p className="font-semibold dark:text-white">{customersInQueue[currentCardIndex].waitingTime || '15m 20s'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Est. service</p>
                                <p className="font-semibold dark:text-white">{customersInQueue[currentCardIndex].estimatedServiceTime || '20m'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Joined at</p>
                                <p className="font-semibold dark:text-white">{customersInQueue[currentCardIndex].formattedJoinTime}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Status</p>
                                <Chip size="sm" color="primary" variant="flat">
                                  {customersInQueue[currentCardIndex].status || 'Waiting'}
                                </Chip>
                              </div>
                            </div>
                
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-1">
                                <Button 
                                  size="sm" 
                                  color="success" 
                                  variant="flat" 
                                  onClick={() => handleServed(customersInQueue[currentCardIndex].entry_id)}
                                  isLoading={loadingActions[customersInQueue[currentCardIndex].entry_id]?.serve}
                                  className="font-medium min-w-0 px-2"
                                >
                                  <Check className="h-4 w-4 sm:mr-1" />
                                  <span>Served</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  color="danger" 
                                  variant="flat" 
                                  onClick={() => handleNoShow(customersInQueue[currentCardIndex].entry_id)}
                                  isLoading={loadingActions[customersInQueue[currentCardIndex].entry_id]?.noShow}
                                  className="font-medium min-w-0 px-2"
                                >
                                  <X className="h-4 w-4 sm:mr-1" />
                                  <span>No Show</span>
                                </Button>
                              </div>
                              <Button 
                                size="sm" 
                                color="primary" 
                                variant="light"
                                className="font-medium min-w-0 px-3"
                              >
                                <MessageSquare className="h-4 w-4 sm:mr-1" />
                                <span className="sm:inline hidden">Notify</span>
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      <div className="flex justify-center items-center mt-4 gap-2">
                        <Button
                          isIconOnly
                          variant="flat"
                          onClick={previousCard}
                          className="bg-default-100 dark:bg-gray-700"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-default-600">
                          {currentCardIndex + 1} / {customersInQueue.length}
                        </span>
                        <Button
                          isIconOnly
                          variant="flat"
                          onClick={nextCard}
                          className="bg-default-100 dark:bg-gray-700"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="col-span-full p-8 text-center">
                      <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-default-100">
                        <Users className="h-8 w-8 text-default-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Queue is empty</h3>
                      <p className="text-sm text-gray-500 mb-4">There are no customers waiting in the queue</p>
                      <Button color="primary" startContent={<Users className="h-4 w-4" />}>
                        Add Customer
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "queue-list" && (
                <Card className="mt-6 shadow-md dark:bg-gray-800/50">
                  <CardBody>
                    <Table 
                      aria-label="Customers in queue"
                      classNames={{
                        th: "bg-default-100/50 dark:bg-gray-700/50 text-default-600",
                        wrapper: "shadow-none rounded-lg"
                      }}
                    >
                      <TableHeader>
                        <TableColumn width={80}>#</TableColumn>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Join Time</TableColumn>
                        <TableColumn width={260}>Actions</TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="No customers in the queue">
                        {customersInQueue.map((customer, index) => (
                          <TableRow key={customer.entry_id} className="hover:bg-default-50 dark:hover:bg-gray-700/30">
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="bg-primary/10 text-primary rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium">
                                  {customer.user_profile?.name?.[0] || customer.name?.[0] || 'W'}
                                </div>
                                <span>{customer.user_profile?.name || customer.name || 'Walk-in Customer'}</span>
                              </div>
                            </TableCell>
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
                                  <Check className="h-4 w-4 sm:mr-1" />
                                  <span className="sm:inline hidden">Served</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  color="danger" 
                                  variant="flat" 
                                  onClick={() => handleNoShow(customer.entry_id)}
                                  isLoading={loadingActions[customer.entry_id]?.noShow}
                                >
                                  <X className="h-4 w-4 sm:mr-1" />
                                  <span className="sm:inline hidden">No Show</span>
                                </Button>
                                <Button size="sm" color="primary" variant="light">
                                  <MessageSquare className="h-4 w-4 sm:mr-1" />
                                  <span className="sm:inline hidden">Notify</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>
              )}
              {activeTab === "analytics" && (
                <div className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[
                    {
                      title: "Current Queue",
                      value: customersInQueue.length,
                      icon: <Users className="h-4 w-4" />,
                      color: "primary"
                    },
                    {
                      title: "Avg. Wait Time",
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
                      title: "Service Time",
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
                    <Card key={index} className="bg-white/60 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-all border border-divider">
                      <CardBody className="py-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-default-600">{stat.title}</h3>
                          <div className={`p-2 rounded-full bg-${stat.color}/10`}>
                            {cloneElement(stat.icon, { className: `text-${stat.color}` })}
                          </div>
                        </div>
                        <div className="mt-2 text-xl font-bold">{stat.value}</div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
              {activeTab === "qr-code" && (
                <Card className="mt-6 max-w-md mx-auto shadow-md">
                  <CardHeader className="pb-0">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold">Quick Join QR Code</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Display this QR code at your location for customers to join the queue
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody className="flex justify-center items-center py-8">
                    <QueueQRCode 
                      queueId={params.queueId} 
                      queueName={queueData?.queueData?.name} 
                    />
                  </CardBody>
                </Card>
              )}
            </div>

            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-8">
              <Card className="bg-white/60 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-all">
                <CardBody className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-600">Current Queue</p>
                      <p className="text-xl font-semibold mt-1">
                        {queueData?.customersInQueue?.length || 0}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-white/60 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-all">
                <CardBody className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-600">Avg. Wait Time</p>
                      <p className="text-xl font-semibold mt-1">
                        {queueData?.queueData?.avg_wait_time || 0} min
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-warning/10">
                      <Clock className="h-4 w-4 text-warning" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-white/60 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-all">
                <CardBody className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-600">Served Last Hour</p>
                      <p className="text-xl font-semibold mt-1">
                        {queueData?.queueData?.served_last_hour || 0}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-success/10">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-white/60 dark:bg-gray-800/60 shadow-sm hover:shadow-md transition-all">
                <CardBody className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-600">No-Show Rate</p>
                      <p className="text-xl font-semibold mt-1">
                        {queueData?.queueData?.no_show_rate || 0}%
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-danger/10">
                      <UserMinus className="h-4 w-4 text-danger" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card className="dark:bg-gray-800/50 mb-8">
              <CardBody>
                <div className="md:hidden">
                  <div className="gap-4">
                    <div className="flex items-center justify-between mb-4">
                      <Chip color={queueData.queueData.status === 'active' ? "success" : "default"}>
                        {queueData.queueData.status === 'active' ? "Active" : "Paused"}
                      </Chip>
                      <div className="flex gap-2">
                        <Button
                          color={queueData.queueData.status === 'active' ? "warning" : "success"}
                          variant="flat"
                          startContent={queueData.queueData.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          onClick={handlePauseClick}
                        >
                          {queueData.queueData.status === 'active' ? "Pause Queue" : "Activate Queue"}
                        </Button>
                        <Button
                          color="warning"
                          variant="flat"
                          startContent={<Clock className="h-4 w-4" />}
                          onClick={handleDelayClick}
                        >
                          Add Delay
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-sm">Service Time</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={serviceTime}
                          onChange={(e) => setServiceTime(e.target.value)}
                          className="w-32"
                          endContent={<span className="text-default-400 text-sm">min</span>}
                        />
                        <Button 
                          onClick={handleUpdateServiceTime}
                          color="primary"
                        >
                          Update
                        </Button>
                        <AddKnownUserModal
                          queueId={params.queueId}
                          onSuccess={handleUserAdded}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Chip color={queueData.queueData.status === 'active' ? "success" : "default"}>
                        {queueData.queueData.status === 'active' ? "Active" : "Paused"}
                      </Chip>
                      <Button
                        color={queueData.queueData.status === 'active' ? "warning" : "success"}
                        variant="flat"
                        startContent={queueData.queueData.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        onClick={handlePauseClick}
                      >
                        {queueData.queueData.status === 'active' ? "Pause Queue" : "Activate Queue"}
                      </Button>
                      <Button
                        color="warning"
                        variant="flat"
                        startContent={<Clock className="h-4 w-4" />}
                        onClick={handleDelayClick}
                      >
                        Add Delay
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={serviceTime}
                        onChange={(e) => setServiceTime(e.target.value)}
                        className="w-32"
                        endContent={<span className="text-default-400 text-sm">min</span>}
                      />
                      <Button 
                        onClick={handleUpdateServiceTime}
                        color="primary"
                      >
                        Update
                      </Button>
                      <AddKnownUserModal
                        queueId={params.queueId}
                        onSuccess={handleUserAdded}
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        ) : (
          <div className="p-8 text-center dark:text-white">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 text-danger" />
            <h3 className="text-xl font-medium mb-2">Error loading queue data</h3>
            <p className="text-gray-500 mb-4">Unable to fetch the queue information</p>
            <Button color="primary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        )}
      </main>

      {shouldLoadDelayModal && (
        <Suspense fallback={null}>
          <DelayModal 
            isOpen={isDelayModalOpen}
            onClose={() => setIsDelayModalOpen(false)}
            onSubmit={handleDelay}
          />
        </Suspense>
      )}

      {shouldLoadAddUserModal && (
        <Suspense fallback={null}>
          <AddKnownUserModal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            queueId={params.queueId}
            onSuccess={handleUserAdded}
          />
        </Suspense>
      )}
      {shouldLoadPauseModal && (
        <Suspense fallback={null}>
          <PauseConfirmationModal 
            isOpen={isPauseModalOpen}
            onClose={() => setIsPauseModalOpen(false)}
            onConfirm={handleToggleQueue}
            isActive={queueData?.queueData?.status === 'active'}
            isLoading={isToggling}
          />
        </Suspense>
      )}
    </div>
  )
}