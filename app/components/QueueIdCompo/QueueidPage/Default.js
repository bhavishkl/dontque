'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, ChevronDown, ChevronUp, Bell, AlertCircle, Timer, Share2, Star, Calendar, LogOut, User } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Progress, Skeleton, Tooltip, Badge } from "@nextui-org/react"
import { toast } from 'sonner'
import { useSession } from '@/lib/mock-auth'
import { createClient } from '@supabase/supabase-js'
import { useApi } from '@/app/hooks/useApi'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Lazy load all components
const AddKnownUserModal = lazy(() => import('@/app/components/UniComp/AddKnownUserModal'));
const QueueInfoSec = lazy(() => import('@/app/components/QueueIdCompo/QueueidPage/QueueInfoSec'));
const NotificationPreferencesModal = lazy(() => import('@/app/components/NotificationPreferencesModal'));
// Add dynamic import for LeaveQueueConfirmationModal
const LeaveQueueConfirmationModal = lazy(() => import('@/app/components/QueueIdCompo/LeaveQueueConfirmationModal'));
const QueueJoinedAnimation = lazy(() => import('@/app/components/QueueIdCompo/QueueidPage/JoinedAnimation'));

const calculatePersonalizedServeTime = (nextServeAt, position, estTimeToServe, serviceStartTime, delayedUntil) => {
  const now = new Date();
  
  // If position is 1 and service has started, they're next up
  if (position === 1) {
    // Check if there's a delay in effect
    if (delayedUntil) {
      const delayTime = new Date(delayedUntil);
      if (delayTime > now) {
        return delayTime;
      }
    }
    
    // If there's a service start time, check if we've passed it
    if (serviceStartTime) {
      const [hours, minutes] = serviceStartTime.split(':').map(Number);
      const serviceStart = new Date(now);
      serviceStart.setHours(hours, minutes, 0, 0);
      
      // If current time is before service start, return service start time
      if (now < serviceStart) {
        return serviceStart;
      }
    }
    
    // If we're past service start time and any delays, return current time
    return now;
  }
  
  // For all other positions, continue with existing logic
  if (!nextServeAt || !position || !estTimeToServe) return null;
  
  // Start with the base time (either nextServeAt or now)
  let baseTime = nextServeAt ? new Date(nextServeAt) : new Date();
  
  // Check if there's a delay in effect
  if (delayedUntil) {
    const delayTime = new Date(delayedUntil);
    if (delayTime > baseTime) {
      baseTime = delayTime;
    }
  }
  
  // Check service start time
  if (serviceStartTime) {
    const [hours, minutes] = serviceStartTime.split(':').map(Number);
    const serviceStart = new Date(now);
    serviceStart.setHours(hours, minutes, 0, 0);
    
    if (now < serviceStart && serviceStart > baseTime) {
      baseTime = serviceStart;
    }
  }
  
  // Calculate wait time based on position and service time
  const waitTimeInMinutes = (position - 1) * estTimeToServe;
  return new Date(baseTime.getTime() + waitTimeInMinutes * 60000);
};

export default function QueueDetailsPage({ params, queueData: initialQueueData }) {
  const { data: queueData, isLoading, isError, error, mutate } = useApi(`/api/queues/${params.queueid}`, {
    fallbackData: initialQueueData, // Use the data passed from parent as initial data
    revalidateOnMount: false, // Don't fetch again on mount since we have initial data
    dedupingInterval: 5000,
  })
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { data: session } = useSession();
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeavingQueue, setIsLeavingQueue] = useState(false);
  const [showJoinedAnimation, setShowJoinedAnimation] = useState(false);

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  const handleAddKnownSuccess = async () => {
    await mutate()
    toast.success('Known user added to the queue successfully');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

 
  
  useEffect(() => {
    const subscription = supabase
      .channel(`queue_${params.queueid}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'queue_entries',
        filter: `queue_id=eq.${params.queueid}`
      }, (payload) => {
        mutate();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params.queueid, mutate]);

  useEffect(() => {
    const handleQuickJoin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isQuickJoin = urlParams.get('quick_join') === 'true';
      
      if (isQuickJoin && !queueData?.userQueueEntry && !isJoining && session) {
        await handleJoinQueue();
        // Clean up the URL
        window.history.replaceState({}, '', `/user/queue/${params.queueid}`);
      }
    };

    handleQuickJoin();
  }, [queueData, session]);

  const handleJoinQueue = async () => {
    setIsJoining(true);
    try {
      const joinResponse = await fetch(`/api/queues/${params.queueid}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await joinResponse.json();
  
      if (!joinResponse.ok) {
        throw new Error(data.error || 'Failed to join queue');
      }
  
      // Show animation before updating queue data
      setShowJoinedAnimation(true);
  
      // Wait for animation to complete
      setTimeout(async () => {
        await mutate();
        toast.success('Successfully joined the queue');
        
        // Hide animation after showing queue entry
        setTimeout(() => {
          setShowJoinedAnimation(false);
        }, 1000);
      }, 1500);
  
    } catch (err) {
      console.error('Error joining queue:', err);
      toast.error(err.message || 'Failed to join queue. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeaveQueue = async () => {
    setIsLeavingQueue(true);
    try {
      // Send position data along with the leave request
      const response = await fetch(`/api/queues/${params.queueid}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: queueData?.userQueueEntry?.position
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave queue');
      }
  
      toast.success('Successfully left the queue');
      await mutate();
    } catch (err) {
      console.error('Error leaving queue:', err);
      toast.error(err.message || 'Failed to leave queue. Please try again.');
    } finally {
      setIsLeavingQueue(false);
      setIsLeaveModalOpen(false);
    }
  };

  const handleShare = async () => {
    if (!queueData || !queueData.name || !queueData.short_id) {
      toast.error('Queue data is not available for sharing');
      return;
    }
  
    console.log('Queue Name:', queueData.name);
    console.log('Queue Short ID:', queueData.short_id);
  
    const shareData = {
      title: queueData.name,
      text: `Check out this queue: ${queueData.name} (ID: ${queueData.short_id})`,
      url: window.location.href,
    };
  
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast.success('Queue link copied to clipboard');
    }
  }


  const handlePreferencesSaved = (preferences) => {
    const hasEnabledChannels = Object.values(preferences).some(value => value);
    setNotificationsEnabled(hasEnabledChannels);
  };

  const openLeaveConfirmation = () => {
    setIsLeaveModalOpen(true);
  }

  const getDelayMessage = () => {
    if (!queueData?.delayed_until) return null;
    
    const formatTime = (timeString) => {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    // Get original start time (service start time or next serve time)
    const originalStartTime = queueData.service_start_time ? 
      new Date(`${new Date().toDateString()} ${queueData.service_start_time}`) :
      new Date(queueData.next_serve_at);

    const newStartTime = new Date(queueData.delayed_until);

    return `Start time delayed from ${formatTime(originalStartTime)} to ${formatTime(newStartTime)}`;
  };

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <header className=" dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/user/queues" className="inline-flex items-center text-grey-600  hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-medium">Back to Queues</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="w-full h-96 rounded-lg" />
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <QueueInfoSec queueData={queueData} />

              {/* Delay Alert - Moved below QueueInfoSec */}
              {queueData?.delayed_until && (
                <Card className="bg-orange-100 dark:bg-orange-900/20 border-l-4 border-orange-500">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="font-medium text-orange-800 dark:text-orange-200">
                          Queue Delay Notice
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          {getDelayMessage()}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Queue Status Section - Remains below Delay Alert */}
              {!queueData?.userQueueEntry && (
                <Card className="dark:bg-gray-800">
                  <CardHeader className="pb-2">
                    <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Current Queue Status</h2>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="space-y-6">
                      {/* Queue Capacity */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Queue Capacity</span>
                          <span className="font-semibold">{queueData?.current_queue_count || 0} / {queueData?.max_capacity || 20}</span>
                        </div>
                        <Progress 
                          value={queueData?.capacity_percentage || 0}
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
                                  {queueData?.current_queue_count || 0}
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
                                  {queueData?.total_estimated_wait_time || 0} mins
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {queueData?.userQueueEntry ? (
                <>
                  <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white overflow-hidden mb-6">
                    <CardBody className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold">Your Queue Status</h2>
                          <p className="text-xs sm:text-sm opacity-80">
                            Joined at {new Date(queueData.userQueueEntry.join_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge content={queueData.userQueueEntry.position} color="warning">
                          <div className="p-1.5 sm:p-2 bg-white/20 rounded-full">
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        {/* Position Indicator */}
                        <div className="relative flex justify-center">
                          <div className="w-32 h-32 sm:w-40 sm:h-40 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              {/* White background div with glow */}
                              <div className="absolute inset-0 bg-white rounded-xl sm:rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.7)]"></div>
                              {/* Blur effect div */}
                              <div className="relative w-full h-28 sm:h-32 backdrop-blur-lg bg-white/40 p-3 sm:p-4 border border-white/20 rounded-xl sm:rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.9)]">
                                <div className="flex flex-col items-center justify-center h-full">
                                  <span className="text-xs sm:text-sm text-orange-600 mb-1">Your Position</span>
                                  <div className="flex items-baseline">
                                    <span className="text-4xl sm:text-5xl font-bold text-orange-600 drop-shadow-sm">#</span>
                                    <span className="text-5xl sm:text-6xl font-bold text-orange-600 drop-shadow-sm">
                                      {queueData.userQueueEntry.position}
                                    </span>
                                  </div>
                                  <span className="text-xs sm:text-sm text-orange-600 mt-1">in queue</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Queue Stats */}
                        <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
                          {/* Expected Time Card */}
                          <div className="bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 shadow-lg">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                              <div className="p-1.5 sm:p-2 bg-white/20 rounded-full">
                                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-white">Expected Service Time</h3>
                            </div>
                            <div className="text-center">
                              {(() => {
                                const personalizedTime = calculatePersonalizedServeTime(
                                  queueData.next_serve_at,
                                  queueData.userQueueEntry.position,
                                  queueData.est_time_to_serve,
                                  queueData.service_start_time,
                                  queueData.delayed_until
                                );
                                return personalizedTime ? (
                                  <div className="flex flex-col">
                                    <span className="text-2xl sm:text-3xl font-bold text-white">
                                      {personalizedTime.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    <span className="text-xs sm:text-sm text-white/80 mt-1">
                                      {personalizedTime.toLocaleDateString([], {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-lg sm:text-xl text-white/80">Not available</span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Countdown and Actions Card */}
                  <Card className="dark:bg-gray-800 mb-6">
                    <CardBody className="p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Time Until Your Turn</h3>
                        {(() => {
                          const personalizedTime = calculatePersonalizedServeTime(
                            queueData.next_serve_at,
                            queueData.userQueueEntry.position,
                            queueData.est_time_to_serve,
                            queueData.service_start_time,
                            queueData.delayed_until
                          );

                          if (!personalizedTime) {
                            return <p className="text-center text-gray-600">Time not available</p>;
                          }

                          const timeDifferenceInMinutes = (personalizedTime.getTime() - currentTime.getTime()) / (1000 * 60);

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

                          const hours = Math.floor(timeDifferenceInMinutes / 60);
                          const minutes = Math.floor(timeDifferenceInMinutes % 60);
                          const seconds = Math.floor((timeDifferenceInMinutes * 60) % 60);
                          
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
                        })()}
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

                          <AddKnownUserModal queueId={params.queueid} onSuccess={handleAddKnownSuccess} />
                        </div>

                        <div className="flex gap-2">
                          <Tooltip content="Request additional waiting time">
                            <Button
                              className="flex-1"
                              color="warning"
                              variant="flat"
                              startContent={<Timer className="h-4 w-4" />}
                            >
                              Request More Time
                            </Button>
                          </Tooltip>
                          
                          <Tooltip content="Share your queue position">
                            <Button
                              className="flex-1"
                              color="secondary"
                              variant="flat"
                              startContent={<Share2 className="h-4 w-4" />}
                              onClick={handleShare}
                            >
                              Share Status
                            </Button>
                          </Tooltip>
                        </div>

                        <Button
                          className="w-full"
                          color="danger"
                          variant="flat"
                          startContent={<LogOut className="h-4 w-4" />}
                          onClick={openLeaveConfirmation}
                        >
                          Leave Queue
                        </Button>
                      </div>

                      <NotificationPreferencesModal 
                        isOpen={isPreferencesModalOpen}
                        onClose={() => setIsPreferencesModalOpen(false)}
                        onSave={handlePreferencesSaved}
                      />
                    </CardBody>
                  </Card>

                  <Card className="dark:bg-gray-800">
                    <CardBody>
                      <h3 className="font-semibold mb-2">While you're in the queue:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>Stay nearby and be ready to arrive when it's your turn</li>
                        <li>Keep an eye on your notifications for updates on your position</li>
                        <li>Remember that these times are estimates and may vary</li>
                        <li>Leaving the queue will forfeit any progress and payments</li>
                        {showAllInfo && (
                          <>
                            <li>Wait time is based on average service time and people ahead</li>
                            <li>Position 1 means you're next to be served</li>
                            <li>Service start time is when we expect you to reach the front</li>
                          </>
                        )}
                      </ul>
                      <Button
                        variant="light"
                        onClick={() => setShowAllInfo(!showAllInfo)}
                        className="mt-4 w-full flex items-center justify-center"
                      >
                        {showAllInfo ? (
                          <>
                            Show Less <ChevronUp className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show More <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardBody>
                  </Card>
                </>
              ) : (
                <Card className="dark:bg-gray-800">
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Join the Queue</h2>
                  </CardHeader>
                  <CardBody>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">Ready to join? Click the button below to secure your spot in the queue.</p>
                    <Button 
                      onClick={handleJoinQueue} 
                      color="primary" 
                      className="w-full mb-6"
                      size="lg"
                      isLoading={isJoining}
                    >
                      {isJoining ? 'Joining Queue...' : 'Join Queue'}
                    </Button>
                    <AddKnownUserModal queueId={params.queueid} onSuccess={handleAddKnownSuccess} />
                    
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Before you join:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>Make sure you're ready to arrive when it's your turn</li>
                        <li>You'll receive notifications as you move up in the queue</li>
                        <li>You can leave the queue at any time if needed</li>
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      <Suspense fallback={null}>
        <LeaveQueueConfirmationModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          onConfirm={handleLeaveQueue}
          isLoading={isLeavingQueue}
          position={queueData?.userQueueEntry?.position}
          waitTime={queueData?.userQueueEntry?.wait_time_formatted}
        />
        <QueueJoinedAnimation 
          show={showJoinedAnimation}
          queuePosition={queueData?.current_queue_count || 1}
        />
      </Suspense>
    </div>
  )
}
