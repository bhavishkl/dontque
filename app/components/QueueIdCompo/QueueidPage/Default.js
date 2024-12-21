'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, ChevronDown, ChevronUp, Bell, AlertCircle, Timer, Share2, Star, MapPin, Calendar, LogOut } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Progress, Skeleton, CircularProgress, Switch, Tooltip, Badge } from "@nextui-org/react"
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import AddKnownUserModal from '@/app/components/UniComp/AddKnownUserModal';
import QueueInfoSec from '@/app/components/QueueIdCompo/QueueidPage/QueueInfoSec'
import { useApi } from '@/app/hooks/useApi'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function QueueDetailsPage({ params }) {
  const { data: queueData, isLoading, isError, error, mutate } = useApi(`/api/queues/${params.queueid}`, {
    revalidateOnMount: false, // Use prefetched data if available
    dedupingInterval: 5000,
    onSuccess: (data) => {
      // Prefetch related data
      if (data?.id) {
        // Prefetch queue statistics
        fetch(`/api/queues/${params.queueid}/stats`)
        // Prefetch user position if in queue
        if (data.userQueueEntry) {
          fetch(`/api/queues/${params.queueid}/position`)
        }
      }
    }
  })
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { data: session } = useSession();
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [expectedTurnTime, setExpectedTurnTime] = useState(null);

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  const calculateExpectedTurnTime = (queueData) => {
    const now = new Date();
    
    if (!queueData.service_start_time) {
      return { formattedTime: "Service start time not available", expectedTurnTime: null };
    }

    const [serviceHours, serviceMinutes] = queueData.service_start_time.split(':').map(Number);
    
    let serviceStartTime = new Date(now);
    serviceStartTime.setHours(serviceHours, serviceMinutes, 0, 0);

    let expectedTurnTime;
    if (serviceStartTime < now) {
      expectedTurnTime = new Date(now.getTime() + queueData.userQueueEntry.estimated_wait_time * 60000);
    } else {
      expectedTurnTime = new Date(serviceStartTime.getTime() + queueData.userQueueEntry.estimated_wait_time * 60000);
    }

    const formattedTime = expectedTurnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { 
      formattedTime: `Your turn is expected at ${formattedTime}`,
      expectedTurnTime: expectedTurnTime
    };
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const toggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled)
    toast.success(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled')
  }

  const handleAddKnownSuccess = async () => {
    await mutate()
    toast.success('Known user added to the queue successfully');
  };

  useEffect(() => {
    if (queueData?.userQueueEntry) {
      const { expectedTurnTime, formattedTime } = calculateExpectedTurnTime(queueData);
      setExpectedTurnTime(expectedTurnTime);
  
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = expectedTurnTime.getTime() - now;
  
        if (distance < 0) {
          clearInterval(timer);
          setCountdown("It's your turn!");
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [queueData]);
  
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
  
      toast.success('Successfully joined the queue');
      await mutate();
      scrollToTop();
    } catch (err) {
      console.error('Error joining queue:', err);
      toast.error(err.message || 'Failed to join queue. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeaveQueue = async () => {
    setIsLeaving(true);
    try {
      const response = await fetch(`/api/queues/${params.queueid}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setIsLeaving(false);
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleFavorite = async () => {
    if (!queueData || !queueData.id) {
      toast.error('Queue data is not available for favoriting');
      return;
    }

    try {
      const response = await fetch(`/api/queue/${queueData.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to favorite queue');
      }

      toast.success('Queue favorited successfully');
      await mutate();
    } catch (err) {
      console.error('Error favoriting queue:', err);
      toast.error(err.message || 'Failed to favorite queue');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-100 dark:bg-gray-900">
        <header className="sticky top-0 bg-orange-200 dark:bg-gray-800 shadow-sm z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="w-32 h-6">
              <Skeleton className="rounded-lg" />
            </div>
            <div className="w-24 h-10">
              <Skeleton className="rounded-lg" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <Skeleton className="w-48 h-8 rounded-lg" />
                </CardHeader>
                <CardBody>
                  <Skeleton className="w-full h-60 rounded-lg" />
                  <Skeleton className="w-full h-6 mt-4 rounded-lg" />
                  <Skeleton className="w-3/4 h-6 mt-2 rounded-lg" />
                  <div className="flex items-center mt-4">
                    <Skeleton className="w-8 h-8 rounded-full mr-2" />
                    <Skeleton className="w-24 h-6 rounded-lg" />
                  </div>
                  <Skeleton className="w-full h-10 mt-4 rounded-lg" />
                </CardBody>
              </Card>
            </div>

            <div>
              <Card className="mb-6">
                <CardHeader>
                  <Skeleton className="w-48 h-8 rounded-lg" />
                </CardHeader>
                <CardBody>
                  <Skeleton className="w-full h-40 rounded-lg" />
                  <div className="flex justify-between mt-4">
                    <Skeleton className="w-1/3 h-6 rounded-lg" />
                    <Skeleton className="w-1/3 h-6 rounded-lg" />
                  </div>
                  <Skeleton className="w-full h-4 mt-2 rounded-lg" />
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-24 h-6 rounded-lg" />
                    <Skeleton className="w-16 h-6 rounded-lg" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-32 h-6 rounded-lg" />
                    <Skeleton className="w-20 h-6 rounded-lg" />
                  </div>
                  <Skeleton className="w-full h-10 mt-6 rounded-lg" />
                </CardBody>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-100 dark:bg-gray-900">
      <header className="bg-orange-200 dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/user/queues" className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:underline">
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
              <QueueInfoSec queueData={queueData} isLoading={isLoading} handleShare={handleShare} />
              
              {!queueData?.userQueueEntry && (
                <Card className="dark:bg-gray-800">
                  <CardHeader className="pb-2">
                    <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">Current Queue Status</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Queue Capacity</span>
                          <span>{queueData.queueEntries?.length || 0} / {queueData.max_capacity}</span>
                        </div>
                        <Progress value={((queueData.queueEntries?.length || 0) / queueData.max_capacity) * 100} 
                          className="h-2"
                          classNames={{
                            indicator: "bg-orange-500 dark:bg-orange-400",
                            track: "bg-orange-200 dark:bg-orange-900",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                          <span>People ahead</span>
                        </div>
                        <span className="font-semibold">{queueData.queueEntries.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                          <span>Estimated wait time</span>
                        </div>
                        <span className="font-semibold">{queueData.queueEntries.length * queueData.est_time_to_serve} minutes</span>
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
                    <CardBody className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold">Your Queue Status</h2>
                          <p className="text-sm opacity-80">
                            Joined at {new Date(queueData.userQueueEntry.join_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge content={queueData.userQueueEntry.position} color="warning">
                          <div className="p-2 bg-white/20 rounded-full">
                            <AlertCircle className="h-6 w-6" />
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        {/* Position Indicator */}
                        <div className="relative flex justify-center">
                          <div className="w-40 h-40 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              {/* White background div with glow */}
                              <div className="absolute inset-0 bg-white rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.7)]"></div>
                              {/* Blur effect div */}
                              <div className="relative w-full h-32 backdrop-blur-lg bg-white/40 p-4 border border-white/20 rounded-2xl shadow-[inset_0_0_15px_rgba(255,255,255,0.9)]">
                                <div className="flex flex-col items-center justify-center h-full">
                                  <span className="text-sm text-orange-600 mb-1">Your Position</span>
                                  <div className="flex items-baseline">
                                    <span className="text-5xl font-bold text-orange-600 drop-shadow-sm">#</span>
                                    <span className="text-6xl font-bold text-orange-600 drop-shadow-sm">
                                      {queueData.userQueueEntry.position}
                                    </span>
                                  </div>
                                  <span className="text-sm text-orange-600 mt-1">in queue</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Queue Stats */}
                        <div className="flex flex-col justify-center space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Timer className="h-5 w-5" />
                              <span>Wait Time</span>
                            </div>
                            <span className="font-bold">{queueData.userQueueEntry.estimated_wait_time} min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5" />
                              <span>Expected At</span>
                            </div>
                            <span className="font-bold">
                              {expectedTurnTime?.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
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
                        <div className="flex justify-center gap-4">
                          {countdown.split(' ').map((unit, index) => (
                            <div key={index} className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 flex-1 text-center">
                              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {unit.split(/([0-9]+)/)[1]}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {unit.split(/([a-z]+)/)[1]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            color={notificationsEnabled ? "success" : "primary"}
                            variant="flat"
                            startContent={<Bell className="h-4 w-4" />}
                            onClick={toggleNotifications}
                          >
                            {notificationsEnabled ? "Notifications Enabled" : "Enable Notifications"}
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
                          onClick={handleLeaveQueue}
                          isLoading={isLeaving}
                        >
                          {isLeaving ? "Leaving Queue..." : "Leave Queue"}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Queue Progress Card */}
                  <Card className="dark:bg-gray-800">
                    <CardBody className="p-6">
                      <h3 className="font-semibold mb-4">Queue Progress</h3>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-gray-200 dark:to-gray-700"></div>
                        <div className="space-y-6">
                          {[
                            { 
                              status: 'Joined Queue', 
                              done: true, 
                              time: new Date(queueData.userQueueEntry.join_time).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }),
                              icon: Calendar
                            },
                            { 
                              status: 'Waiting', 
                              done: true, 
                              time: 'Current',
                              icon: Clock
                            },
                            { 
                              status: 'Almost There', 
                              done: queueData.userQueueEntry.position <= 3,
                              time: queueData.userQueueEntry.position <= 3 ? 'Soon' : 'Waiting',
                              icon: AlertCircle
                            },
                            { 
                              status: 'Your Turn', 
                              done: false, 
                              time: expectedTurnTime?.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }),
                              icon: Star
                            }
                          ].map((step, index) => (
                            <div key={index} className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                                step.done ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                              }`}>
                                {<step.icon className="h-4 w-4" />}
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="font-medium">{step.status}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{step.time}</div>
                              </div>
                              {step.done && (
                                <Badge color="success" variant="flat">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
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
    </div>
  )
}
