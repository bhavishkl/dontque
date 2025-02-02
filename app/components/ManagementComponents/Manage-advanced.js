'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Button, Tabs, Tab, Chip, Switch, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton } from "@nextui-org/react"
import { ArrowLeft, Settings, Plus, Clock, User, ChevronDown, ChevronUp, Play, Pause } from "lucide-react"
import Link from "next/link"
import { toast } from 'sonner'
import AddKnownUserModal from '@/app/components/UniComp/AddKnownUserModal'
import { useCounterEntries } from '@/app/hooks/useCounterEntries'
import { useManageCounters } from '@/app/hooks/useManageCounters'

export default function ManageAdvanced({ params, queueData, isLoading: pageLoading }) {
  const { counters, isLoading: countersLoading, refetchCounters } = useManageCounters(params.queueId)
  const [selectedCounter, setSelectedCounter] = useState(null)
  const [activeTab, setActiveTab] = useState("queue-cards")
  const [isToggling, setIsToggling] = useState(false)
  const [serviceStartTime, setServiceStartTime] = useState('09:00')
  const [isCounterActive, setIsCounterActive] = useState(true)
  const [isActionsExpanded, setIsActionsExpanded] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])

  // Helper function to format relative time
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

  // Function to add a recent activity log for the current counter
  const addRecentActivity = (userName, action) => {
    if (!selectedCounter) return;
    const key = `recentActivity_${selectedCounter}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    const newEntry = { userName, action, timestamp: new Date().toISOString() };
    // Only keep the two most recent records
    const updated = [newEntry, ...stored].slice(0, 2);
    localStorage.setItem(key, JSON.stringify(updated));
    setRecentActivity(updated);
  };

  // Load recent activity from local storage when the selected counter changes
  useEffect(() => {
    if (!selectedCounter) {
      setRecentActivity([]);
      return;
    }
    const key = `recentActivity_${selectedCounter}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    setRecentActivity(stored);
  }, [selectedCounter]);

  // Update counter data when selection changes or counters update
  useEffect(() => {
    if (counters.length > 0) {
      // Set initial counter if none selected
      if (!selectedCounter) {
        setSelectedCounter(counters[0].counter_id)
        setIsCounterActive(counters[0].status === 'active')
        setServiceStartTime(counters[0].service_start_time || '09:00')
        return
      }

      // Update status and time when switching counters
      const selectedCounterData = counters.find(c => c.counter_id === selectedCounter)
      if (selectedCounterData) {
        setIsCounterActive(selectedCounterData.status === 'active')
        setServiceStartTime(selectedCounterData.service_start_time || '09:00')
      }
    }
  }, [counters, selectedCounter])

  // Handle counter selection
  const handleCounterSelect = (counterId) => {
    setSelectedCounter(counterId)
    const counterData = counters.find(c => c.counter_id === counterId)
    if (counterData) {
      setIsCounterActive(counterData.status === 'active')
      setServiceStartTime(counterData.service_start_time || '09:00')
    }
  }

  const handleToggleCounter = async () => {
    setIsToggling(true)
    try {
      const response = await fetch(`/api/queues/${params.queueId}/manage/counters`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counterId: selectedCounter,
          status: isCounterActive ? 'inactive' : 'active'
        })
      })

      if (!response.ok) throw new Error('Failed to update counter status')

      await refetchCounters()
      toast.success(`Counter ${isCounterActive ? 'paused' : 'activated'}`)
    } catch (error) {
      console.error('Error toggling counter:', error)
      toast.error('Failed to update counter status')
    } finally {
      setIsToggling(false)
    }
  }

  const handleUpdateStartTime = async () => {
    try {
      const response = await fetch(`/api/queues/${params.queueId}/manage/counters`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counterId: selectedCounter,
          serviceStartTime
        })
      })

      if (!response.ok) throw new Error('Failed to update service start time')

      await refetchCounters()
      toast.success(`Service start time updated to ${serviceStartTime}`)
    } catch (error) {
      console.error('Error updating start time:', error)
      toast.error('Failed to update service start time')
    }
  }

  const QueueList = ({ counterId, queueId }) => {
    const { entries, isLoading, error, mutate } = useCounterEntries(queueId, counterId)
    const [isServing, setIsServing] = useState(false)

    const handleServeNext = async () => {
      if (!entries || entries.length === 0) {
        toast.warning('No users in queue to serve')
        return
      }

      setIsServing(true)
      try {
        const firstEntry = entries[0]
        const response = await fetch(`/api/queues/${queueId}/manage/entries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'serve',
            entryId: firstEntry.entry_id
          })
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to serve user')
        }

        await mutate()
        toast.success(`Served ${firstEntry.user_profile?.name || 'customer'}`)
        // Log the activity using local storage for this counter
        addRecentActivity(firstEntry.user_profile?.name || 'Customer', 'served')
      } catch (error) {
        console.error('Error serving user:', error)
        toast.error(error.message || 'Failed to serve customer')
      } finally {
        setIsServing(false)
      }
    }

    return (
      <Table aria-label="Queue entries">
        <TableHeader>
          <TableColumn>POSITION</TableColumn>
          <TableColumn>USER</TableColumn>
          <TableColumn>SERVICES</TableColumn>
          <TableColumn>WAIT TIME</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(3).fill().map((_, i) => (
              <TableRow key={i}>
                {Array(5).fill().map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !entries || entries.length === 0 ? (
            <TableRow>
              <TableCell>{/* Position */}</TableCell>
              <TableCell>{/* User */}</TableCell>
              <TableCell className="text-center">No entries in queue</TableCell>
              <TableCell>{/* Wait Time */}</TableCell>
              <TableCell>{/* Actions */}</TableCell>
            </TableRow>
          ) : (
            entries.map((entry, index) => (
              <TableRow key={entry.entry_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{entry.user_profile?.name || 'Anonymous'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {entry.queue_entry_services?.map(service => (
                    <Chip key={service.service_id} size="sm" className="mr-1">
                      {service.services.name}
                    </Chip>
                  ))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {entry.estimated_wait_time} min
                  </div>
                </TableCell>
                <TableCell>
                  {index === 0 && (
                    <Button
                      size="sm"
                      color="success"
                      isLoading={isServing}
                      onClick={handleServeNext}
                    >
                      Serve Next
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    )
  }

  // Desktop View Actions
  const renderCounterActions = () => (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Chip color={isCounterActive ? "success" : "default"}>
          {isCounterActive ? "Active" : "Paused"}
        </Chip>
        <Button
          color={isCounterActive ? "warning" : "success"}
          variant="flat"
          startContent={isCounterActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          onClick={handleToggleCounter}
          isLoading={isToggling}
        >
          {isToggling ? "Updating..." : (isCounterActive ? "Pause Counter" : "Activate Counter")}
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Input
            type="time"
            value={serviceStartTime}
            onChange={(e) => setServiceStartTime(e.target.value)}
            className="w-32"
          />
          <Button onClick={handleUpdateStartTime}>
            Update Start Time
          </Button>
        </div>
        <AddKnownUserModal 
          queueId={params.queueId} 
          onSuccess={() => toast.success('User added successfully')} 
        />
      </div>
    </div>
  )

  // Mobile View Actions
  const renderMobileCounterActions = () => (
    <div className="gap-4">
      <div className="flex items-center justify-between mb-4">
        <Chip color={isCounterActive ? "success" : "default"}>
          {isCounterActive ? "Active" : "Paused"}
        </Chip>
        <Button
          color={isCounterActive ? "warning" : "success"}
          variant="flat"
          startContent={isCounterActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          onClick={handleToggleCounter}
          isLoading={isToggling}
        >
          {isToggling ? "Updating..." : (isCounterActive ? "Pause Counter" : "Activate Counter")}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm">Service Start Time</span>
        <div className="flex gap-2">
          <Input
            type="time"
            value={serviceStartTime}
            onChange={(e) => setServiceStartTime(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleUpdateStartTime}>
            Update
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <AddKnownUserModal 
          queueId={params.queueId} 
          onSuccess={() => toast.success('User added successfully')} 
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center text-blue-600 dark:text-blue-400">
            <ArrowLeft className="mr-2" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">
            {pageLoading ? (
              <Skeleton className="w-40 h-8" />
            ) : (
              queueData?.queueData?.name || 'Error'
            )}
          </h1>
          <Button variant="bordered" startContent={<Settings />}>
            Queue Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Counter Selection Tabs */}
        <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
          <Button
            color="primary"
            startContent={<Plus />}
            className="min-w-fit"
          >
            Add Counter
          </Button>
          <div className="flex space-x-2">
            {countersLoading ? (
              <Skeleton className="h-10 w-[120px]" />
            ) : counters.length === 0 ? (
              <div className="text-gray-500">No counters available</div>
            ) : (
              counters.map((counter) => (
                <Button
                  key={counter.counter_id}
                  variant={selectedCounter === counter.counter_id ? "solid" : "flat"}
                  className="min-w-[120px]"
                  onClick={() => handleCounterSelect(counter.counter_id)}
                >
                  {counter.name}
                  <Chip 
                    size="sm" 
                    className="ml-2"
                    color={counter.status === 'active' ? "success" : "default"}
                  >
                    {counter.status === 'active' ? "Active" : "Paused"}
                  </Chip>
                </Button>
              ))
            )}
          </div>
        </div>

        <Card className="mb-6">
          <CardBody>
            {/* Counter Actions - Mobile View */}
            <div className="md:hidden">
              <Button
                className="w-full mb-4"
                variant="light"
                endContent={isActionsExpanded ? <ChevronUp /> : <ChevronDown />}
                onClick={() => setIsActionsExpanded(!isActionsExpanded)}
              >
                Counter Actions
              </Button>
              {isActionsExpanded && (
                <Card className="mb-4">
                  <CardBody>
                    {renderMobileCounterActions()}
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Counter Actions - Desktop View */}
            <div className="hidden md:block">
              <Card className="mb-4">
                <CardBody>
                  {renderCounterActions()}
                </CardBody>
              </Card>
            </div>

            {/* Recent Activity Section */}
            {selectedCounter && recentActivity.length > 0 && (
              <Card className="mb-4">
                <CardBody>
                  <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                  <div className="space-y-1">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        {activity.userName} {activity.action} {formatRelativeTime(activity.timestamp)}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Queue Management Tabs */}
            <Tabs 
              aria-label="Queue Management Options" 
              selectedKey={activeTab}
              onSelectionChange={setActiveTab}
            >
              <Tab key="queue-cards" title="Queue Cards">
                <Card>
                  <CardBody>
                    <p className="text-lg">Queue Cards View for Counter {selectedCounter}</p>
                  </CardBody>
                </Card>
              </Tab>
              <Tab key="queue-list" title="Queue List">
                <Card>
                  <CardBody>
                    <QueueList counterId={selectedCounter} queueId={params.queueId} />
                  </CardBody>
                </Card>
              </Tab>
              <Tab key="analytics" title="Analytics">
                <Card>
                  <CardBody>
                    <p className="text-lg">Analytics for Counter {selectedCounter}</p>
                  </CardBody>
                </Card>
              </Tab>
              <Tab key="settings" title="Settings">
                <Card>
                  <CardBody>
                    <p className="text-lg">Settings for Counter {selectedCounter}</p>
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </main>
    </div>
  )
}