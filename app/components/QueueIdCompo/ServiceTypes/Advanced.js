'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { Card, CardBody, Button, Spinner, Tabs, Tab, Chip, Badge, ScrollShadow, Avatar, Progress, Skeleton } from "@nextui-org/react"
import { Clock, Star, ArrowRight, CheckCircle2, AlertCircle, User, Calendar, Bell, Timer, Share2, LogOut, Check, Circle } from 'lucide-react'
import QueueInfoSec from '../QueueidPage/QueueInfoSec'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import * as htmlToImage from 'html-to-image'
import { useApi } from '@/app/hooks/useApi'
// Remove the direct import
// import LeaveQueueConfirmationModal from '@/app/components/QueueIdCompo/LeaveQueueConfirmationModal'

// Dynamic import with loading fallback
const AddKnownUserModal = dynamic(
  () => import('@/app/components/UniComp/AddKnownUserModal'),
  {
    loading: () => (
      <Button
        className="flex-1"
        color="success"
        variant="flat"
        disabled
      >
        Loading...
      </Button>
    ),
    ssr: false // Disable server-side rendering for this component
  }
)

const NotificationPreferencesModal = dynamic(
  () => import('@/app/components/NotificationPreferencesModal'),
  {
    loading: () => null,
    ssr: false
  }
)

// Add dynamic import for LeaveQueueConfirmationModal
const LeaveQueueConfirmationModal = dynamic(
  () => import('@/app/components/QueueIdCompo/LeaveQueueConfirmationModal'),
  {
    loading: () => null,
    ssr: false
  }
)

const calculatePersonalizedServeTime = (nextServeAt, position, totalWaitTime, serviceStartTime) => {
  if (!nextServeAt) return null;
  
  const now = new Date();
  let baseTime = new Date(nextServeAt);
  
  // Parse service start time
  if (serviceStartTime) {
    const [hours, minutes] = serviceStartTime.split(':').map(Number);
    const serviceStart = new Date(now);
    serviceStart.setHours(hours, minutes, 0, 0);
    
    // If current time is before service start time, use service start time as base
    if (now < serviceStart) {
      baseTime = serviceStart;
    }
  }
  
  // Add only the wait time for users ahead in the queue
  if (totalWaitTime) {
    return new Date(baseTime.getTime() + (totalWaitTime * 60000));
  }
  
  return baseTime;
};

const formatCounterStartTime = (timeStr) => {
  if (!timeStr) return 'Not specified';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}${minutes !== '00' ? ':' + minutes : ''} ${period}`;
};

export default function Advanced({ params, queueData }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCounter, setSelectedCounter] = useState("1")
  const [selectedServices, setSelectedServices] = useState(new Set())
  const [userQueueEntry, setUserQueueEntry] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [counters, setCounters] = useState([])
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false)
  const queueStatusRef = useRef(null)
  const [isSharing, setIsSharing] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isLeavingQueue, setIsLeavingQueue] = useState(false)

  // Add timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Replace fetch with useApi
  const { 
    data: queueEntry, 
    isLoading: isQueueEntryLoading,
    mutate: mutateQueueEntry 
  } = useApi(
    params.queueid ? `/api/queues/${params.queueid}/advanced-queues/entries` : null,
   
  )

  const { 
    data: countersData, 
    isLoading: isCountersLoading,
    mutate: mutateCounters 
  } = useApi(
    params.queueid ? `/api/queues/${params.queueid}/counters` : null,

  )

  // Update userQueueEntry when queueEntry data changes
  useEffect(() => {
    if (queueEntry?.entry && queueEntry.entry.entry_id) {
      setUserQueueEntry(queueEntry.entry)
      setSelectedServices(new Set(queueEntry.entry.queue_entry_services?.map(s => s.service_id) || []))
    } else {
      setUserQueueEntry(null)
      setSelectedServices(new Set())
    }
  }, [queueEntry])

  // Update counters when countersData changes
  useEffect(() => {
    if (Array.isArray(countersData) && countersData.length > 0) {
      setCounters(countersData)
      setSelectedCounter(countersData[0].id.toString())
    } else {
      setCounters([])
    }
  }, [countersData])

  // Only show loading state when both data fetches are loading and no data is available
  const isInitialLoading = (isQueueEntryLoading || isCountersLoading) && !countersData && !queueEntry;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: queueData?.name,
        text: `Check out ${queueData?.name} on DontQ!`,
        url: window.location.href,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleServiceSelect = (serviceId) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      return newSet
    })
  }

  const handleJoinQueue = async () => {
    if (selectedServices.size === 0) {
      toast.error('Please select at least one service')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/queues/${params.queueid}/advanced-queues/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          counter_id: selectedCounter,
          services: Array.from(selectedServices)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to join queue')
      }

      // Mutate both queue entry and counters data
      await Promise.all([
        mutateQueueEntry(),
        mutateCounters()
      ])
      
      toast.success('Successfully joined the queue!')
    } catch (error) {
      toast.error(error.message || 'Failed to join queue')
      console.error('Error joining queue:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLeaveQueue = async () => {
    setIsLeavingQueue(true)
    try {
      if (!userQueueEntry?.entry_id) {
        throw new Error('Invalid queue entry')
      }

      const response = await fetch(`/api/queues/${params.queueid}/advanced-queues/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entry_id: userQueueEntry.entry_id
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to leave queue')
      }

      // Mutate both queue entry and counters data
      await Promise.all([
        mutateQueueEntry(),
        mutateCounters()
      ])

      // Reset local state
      setUserQueueEntry(null)
      setSelectedServices(new Set())
      toast.success('Successfully left the queue')
    } catch (error) {
      toast.error(error.message || 'Failed to leave queue')
      console.error('Error leaving queue:', error)
    } finally {
      setIsLeavingQueue(false)
      setIsLeaveModalOpen(false)
    }
  }

  const handleTabChange = (key) => {
    setSelectedCounter(key)
    // Clear selected services when switching tabs
    setSelectedServices(new Set())
  }

  const handlePreferencesSaved = (preferences) => {
    const hasEnabledChannels = Object.values(preferences).some(value => value);
    setNotificationsEnabled(hasEnabledChannels);
  };

  const handleShareStatus = async () => {
    if (!queueStatusRef.current) {
      toast.error('Nothing to share')
      return
    }

    setIsSharing(true)
    try {
      // Create a clone of the element to modify for sharing
      const element = queueStatusRef.current
      
      // Capture the element as an image
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        backgroundColor: '#ffffff',
        style: {
          transform: 'none'
        }
      })

      // Try native share API first
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], 'queue-status.png', { type: 'image/png' })
        
        await navigator.share({
          title: `${queueData?.name || 'Queue'} Status`,
          text: `My position in queue: #${userQueueEntry?.position}`,
          files: [file]
        })
      } else {
        // Fallback to download
        const link = document.createElement('a')
        link.download = 'queue-status.png'
        link.href = dataUrl
        link.click()
      }
      
      toast.success('Queue status shared successfully!')
    } catch (error) {
      console.error('Error sharing queue status:', error)
      toast.error('Failed to share queue status')
    } finally {
      setIsSharing(false)
    }
  }

  const renderQueueStatus = (counter) => {
    if (!userQueueEntry) return null;

    // Add safety check for counter
    if (!counter || !counter.services) {
      console.warn('Counter or services data is missing');
      return (
        <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white">
          <CardBody className="p-4">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Counter information unavailable</p>
            </div>
          </CardBody>
        </Card>
      );
    }

    // Use the total estimated time from all selected services
    const totalEstimatedTime = userQueueEntry.queue_entry_services?.reduce((total, entry) => {
      return total + (entry.services?.estimated_time || 0)
    }, 0) || 15;

    // Calculate personalized serve time with total estimated time
    const expectedServeTime = calculatePersonalizedServeTime(
      userQueueEntry.expectedServeTime,
      userQueueEntry.position,
      userQueueEntry.totalEstimatedTime,
      userQueueEntry.counters?.service_start_time
    );

    // Calculate time difference in minutes
    const timeDifferenceInMinutes = expectedServeTime ? 
      (expectedServeTime.getTime() - currentTime.getTime()) / (1000 * 60) : 0;

    // Time display logic
    const renderTimeDisplay = () => {
      if (!expectedServeTime) {
        return <span className="text-lg sm:text-xl text-white/80">Not available</span>;
      }

      return (
        <div className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-bold text-white">
            {expectedServeTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <span className="text-xs sm:text-sm text-white/80 mt-1">
            {expectedServeTime.toLocaleDateString([], {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      );
    };

    // Countdown display logic
    const renderCountdown = () => {
      if (!expectedServeTime) {
        return <p className="text-center text-gray-600">Time not available</p>;
      }

      if (timeDifferenceInMinutes < 15) {
        return (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              It's almost your turn!
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please stay nearby and be ready
            </div>
          </div>
        );
      }

      const hours = Math.max(0, Math.floor(timeDifferenceInMinutes / 60));
      const minutes = Math.max(0, Math.floor(timeDifferenceInMinutes % 60));
      const seconds = Math.max(0, Math.floor((timeDifferenceInMinutes * 60) % 60));

      return (
        <div className="flex justify-center gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {hours}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              hours
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {minutes}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              minutes
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 flex-1 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {seconds}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              seconds
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* Queue Status Card with ref */}
        <Card 
          ref={queueStatusRef}
          className="bg-gradient-to-br from-orange-500 to-orange-700 text-white overflow-hidden"
        >
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Your Queue Status</h2>
                <p className="text-xs sm:text-sm opacity-80">
                  Joined at {new Date(userQueueEntry.join_time).toLocaleTimeString()}
                </p>
              </div>
              <Badge content={userQueueEntry?.position || '...'} color="warning">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-full">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </Badge>
            </div>

            {/* Compact Selected Counter and Services Section */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Counter Section */}
              <div className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="p-1.5 bg-white/20 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/80">Selected Counter</p>
                  <p className="text-sm font-medium text-white">
                    {counter?.name || 'Counter Unavailable'}
                  </p>
                </div>
              </div>

              {/* Services Section */}
              <div className="flex-1 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-full">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs text-white/80">Selected Services</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from(selectedServices).map(serviceId => {
                    const service = counter?.services?.find(s => s.id === serviceId) || {
                      name: 'Service Unavailable',
                      id: serviceId
                    };
                    return (
                      <Chip
                        key={serviceId}
                        variant="flat"
                        className="bg-white/20 text-white text-xs"
                        size="sm"
                      >
                        {service.name}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <div className="relative flex justify-center">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white rounded-xl sm:rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.7)]"></div>
                        <div className="relative w-full h-28 sm:h-32 backdrop-blur-lg bg-white/40 p-3 sm:p-4 border border-white/20 rounded-xl sm:rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.9)]">
                          <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-xs sm:text-sm text-orange-600 mb-1">Your Position</span>
                            <div className="flex items-baseline">
                              <span className="text-4xl sm:text-5xl font-bold text-orange-600 drop-shadow-sm">#</span>
                              <span className="text-5xl sm:text-6xl font-bold text-orange-600 drop-shadow-sm">
                                {userQueueEntry?.position || '...'}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm text-orange-600 mt-1">in queue</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expected Time Display */}
                <div className="flex-1">
                  <div className="bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 shadow-lg h-32 sm:h-40 flex flex-col justify-center">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <div className="p-1.5 sm:p-2 bg-white/20 rounded-full">
                        <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-white">Expected Service Time</h3>
                    </div>
                    <div className="text-center">
                      {renderTimeDisplay()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Countdown and Actions Card */}
        <Card className="dark:bg-gray-800">
          <CardBody className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Time Until Your Turn</h3>
              {renderCountdown()}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="flat"
                  startContent={<Bell className="h-4 w-4" />}
                  onClick={() => setIsPreferencesModalOpen(true)}
                >
                  Notification Preferences
                </Button>

                <Suspense fallback={
                  <Button className="flex-1" color="success" variant="flat" disabled>
                    Loading...
                  </Button>
                }>
                  <AddKnownUserModal 
                    queueId={params.queueid} 
                    onSuccess={mutateQueueEntry}
                    isAdvanced={true}
                    selectedServices={selectedServices}
                    counterId={selectedCounter}
                  />
                </Suspense>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  color="warning"
                  variant="flat"
                  startContent={<Timer className="h-4 w-4" />}
                >
                  Request More Time
                </Button>

                <Button
                  className="flex-1"
                  color="secondary"
                  variant="flat"
                  startContent={<Share2 className="h-4 w-4" />}
                  onClick={handleShareStatus}
                  isLoading={isSharing}
                >
                  {isSharing ? 'Sharing...' : 'Share Status'}
                </Button>

                <Button
                  className="flex-1"
                  color="danger"
                  variant="flat"
                  startContent={<LogOut className="h-4 w-4" />}
                  onClick={openLeaveConfirmation}
                >
                  Leave Queue
                </Button>
              </div>

              <Suspense fallback={null}>
                <NotificationPreferencesModal 
                  isOpen={isPreferencesModalOpen}
                  onClose={() => setIsPreferencesModalOpen(false)}
                  onSave={handlePreferencesSaved}
                />
              </Suspense>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const selectedCounterData = counters.find(c => c.id.toString() === selectedCounter)

  // Add the confirmation modal trigger
  const openLeaveConfirmation = () => {
    setIsLeaveModalOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <QueueInfoSec
        queueData={queueData}
        isLoading={isInitialLoading}
        handleShare={handleShare}
      />
      
      <div className="w-full space-y-8">
        {isInitialLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : userQueueEntry && userQueueEntry.entry_id ? (
          // Show queue status when user is in queue and has valid entry_id
          renderQueueStatus(counters.find(c => c.id.toString() === userQueueEntry.counter_id))
        ) : counters.length > 0 ? (
          // Show counter selection and join UI when not in queue and counters are available
          <Tabs 
            selectedKey={selectedCounter} 
            onSelectionChange={handleTabChange}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-orange-500",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-orange-500"
            }}
          >
            {counters.map((counter) => (
              <Tab
                key={counter.id.toString()}
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-medium">{counter.name}</span>
                  </div>
                }
	          >
	                <div className="mt-4 space-y-6">
	                  {/* Queue Status Section */}
	                  <div className="space-y-6">
	                    {/* Queue Capacity */}
	                    <div>
                        {counter.service_start_time && (
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Service starts at {formatCounterStartTime(counter.service_start_time)}
                            </span>
                          </div>
                        )}
	                      <div className="flex justify-between text-sm mb-2">
	                        <span className="text-gray-600 dark:text-gray-400">Queue Capacity</span>
	                        <span className="font-semibold">
                            {counter.current_queue_size || 0} / {counter.max_capacity || 'Unlimited'}
                          </span>
	                      </div>
	                      <Progress 
	                        value={
                            counter.max_capacity && counter.max_capacity > 0
                              ? ((counter.current_queue_size || 0) / counter.max_capacity) * 100
                              : 0
                          }
	                        className="h-2"
	                        classNames={{
	                          indicator: "bg-orange-500 dark:bg-orange-400",
                          track: "bg-orange-200/50 dark:bg-orange-900/20",
                        }}
                      />
                    </div>

                    {/* Queue Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* People Ahead Card */}
                      <Card className="bg-orange-50 dark:bg-orange-900/20">
                        <CardBody className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-lg">
                              <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">People Ahead</p>
                              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {counter.current_queue_size || 0}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      {/* Wait Time Card */}
                      <Card className="bg-orange-50 dark:bg-orange-900/20">
                        <CardBody className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-lg">
                              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Est. Wait Time</p>
                              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {(counter.current_queue_size || 0) * (counter.services.find(s => s.id.toString() === Array.from(selectedServices)[0])?.estimatedTime || 15)} mins
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </div>

                  {/* Staff Details */}
                  {counter.type === 'staff' && counter.staffDetails && (
                    <Card className="bg-default-50">
                      <CardBody className="p-4">
                        <div className="flex gap-4">
                          <Avatar
                            src={counter.staffDetails.image || '/default-avatar.png'}
                            className="w-16 h-16"
                            alt={counter.staffDetails.name || counter.name}
                            fallback={(counter.staffDetails.name || counter.name)?.charAt(0) || '?'}
                          />
                          <div className="flex-1">
                            {/* Staff Name */}
                            <h3 className="text-lg font-semibold mb-1">
                              {counter.staffDetails.name || counter.name}
                            </h3>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {counter.staffDetails.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-warning text-warning" />
                                  <span>{counter.staffDetails.rating.toFixed(1)}</span>
                                  <span className="text-default-500">
                                    ({counter.staffDetails.reviewCount || 0} reviews)
                                  </span>
                                </div>
                              )}
                              {counter.staffDetails.experience && (
                                <Chip 
                                  size="sm" 
                                  variant="flat"
                                  className="bg-orange-100 dark:bg-orange-900/20"
                                >
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{counter.staffDetails.experience}y exp</span>
                                  </div>
                                </Chip>
                              )}
                            </div>
                            
                            {counter.staffDetails.specialization && (
                              <p className="text-sm font-medium mt-2 text-default-600">
                                {counter.staffDetails.specialization}
                              </p>
                            )}
                            {counter.staffDetails.bio && (
                              <p className="text-sm text-default-500 mt-1">
                                {counter.staffDetails.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Service Selection Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Available Services</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {counter.services.map((service) => (
                        <Card
                          key={service.id}
                          isPressable
                          onPress={() => handleServiceSelect(service.id)}
                          className={`border-2 ${selectedServices.has(service.id) ? 'border-orange-500' : 'border-transparent'}`}
                        >
                          <CardBody className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-gray-500">{service.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Timer className="h-4 w-4" />
                                  <span className="text-sm">{service.estimatedTime} mins</span>
                                  {service.price && (
                                    <span className="text-sm text-gray-600">• {service.price}</span>
                                  )}
                                </div>
                              </div>
                              {selectedServices.has(service.id) && (
                                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Join Queue Button */}
                  <Button
                    size="lg"
                    color="primary"
                    className="w-full"
                    onClick={handleJoinQueue}
                    isLoading={isSubmitting}
                    startContent={!isSubmitting && <ArrowRight className="h-5 w-5" />}
                    isDisabled={!selectedServices.size || counter.status !== 'active'}
                  >
                    {counter.status === 'active' 
                      ? 'Join Queue' 
                      : 'Counter Currently Unavailable'
                    }
                  </Button>
                </div>
              </Tab>
            ))}
          </Tabs>
        ) : (
          // Show error state when no counters are available
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Counters Available</h3>
            <p className="text-gray-500">Please try again later or contact support.</p>
          </div>
        )}
      </div>

      <NotificationPreferencesModal 
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        onSave={handlePreferencesSaved}
      />

      <LeaveQueueConfirmationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeaveQueue}
        isLoading={isLeavingQueue}
        position={userQueueEntry?.position}
        waitTime={userQueueEntry?.wait_time_formatted}
      />
    </div>
  )
}

