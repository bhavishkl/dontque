'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Progress, Skeleton } from "@nextui-org/react"
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import AddKnownUserModal from '@/app/components/UniComp/AddKnownUserModal';
import { useApi } from '@/app/hooks/useApi'
import QueueInfoSec from '@/app/components/QueueIdCompo/QueueInfoSec'



const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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


export default function QueueDetailsPage({ params }) {
  const { data: queueData, isLoading, isError, error, mutate } = useApi(`/api/queues/${params.queueid}`)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { data: session } = useSession()
  const [showAllInfo, setShowAllInfo] = useState(false)
  const [countdown, setCountdown] = useState('');
  const [expectedTurnTime, setExpectedTurnTime] = useState(null);

  useEffect(() => {
    if (isError) {
      console.error('Error fetching queue data:', error);
      toast.error('Failed to load queue data. Please try again.');
      router.push('/user/queues');
    }
  }, [isError, error, router]);

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
        console.log('Change received:', payload);
        if (payload.eventType === 'INSERT') {
          toast.info('New customer joined the queue');
        } else if (payload.eventType === 'DELETE') {
          toast.info('A customer left the queue');
        }
        mutate();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [params.queueid, mutate]);

  const handleJoinQueue = async () => {
    setIsJoining(true);
    try {
      // Optimistic update
      const optimisticQueueData = {
        ...queueData,
        userQueueEntry: {
          position: queueData.queueEntries.length + 1,
          estimated_wait_time: (queueData.queueEntries.length + 1) * queueData.est_time_to_serve
        },
        queueEntries: [...queueData.queueEntries, { user_id: session.user.id }]
      };
      mutate(optimisticQueueData, false);
  
      const joinResponse = await fetch(`/api/queues/${params.queueid}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await joinResponse.json();
  
      if (!joinResponse.ok) {
        throw new Error(data.error || 'Failed to join queue');
      }
  
      // Add a slight delay before showing success message and updating UI
      await delay(500); // 500ms delay
  
      toast.success('Successfully joined the queue');
      await mutate();
      scrollToTop();
    } catch (err) {
      console.error('Error joining queue:', err);
      toast.error(err.message || 'Failed to join queue. Please try again.');
      // Revert optimistic update
      await mutate();
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeaveQueue = async () => {
    setIsLeaving(true);
    try {
      // Optimistic update
      const optimisticQueueData = {
        ...queueData,
        userQueueEntry: null,
        queueEntries: queueData.queueEntries.filter(entry => entry.user_id !== session.user.id)
      };
      mutate(optimisticQueueData, false);
  
      const response = await fetch(`/api/queues/${params.queueid}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave queue');
      }
  
      // Add a slight delay before showing success message and updating UI
      await delay(2000); // 500ms delay
  
      toast.success('Successfully left the queue');
      await mutate();
    } catch (err) {
      console.error('Error leaving queue:', err);
      toast.error(err.message || 'Failed to leave queue. Please try again.');
      // Revert optimistic update
      await mutate();
    } finally {
      setIsLeaving(false);
    }
  };

// ... rest of the component ...
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/user/queues" className="flex items-center text-blue-600 dark:text-blue-400">
          <ArrowLeft className="mr-2" />
          <span className="font-semibold">Back to Queues</span>
        </Link>
      </div>

      <main className="container mx-auto px-4 py-2">
        <div className="grid gap-8 md:grid-cols-2">
          {isLoading ? (
            <>
              <Skeleton className="w-full h-40 rounded-lg mb-6" />
              <Skeleton className="w-full h-40 rounded-lg" />
            </>
          ) : queueData?.userQueueEntry ? (
            <>
              {/* Queue Entry Section */}
              <div>
                <Card className="bg-black text-primary-foreground mb-6 dark:bg-gray-800">
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Your Position</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="flex items-center justify-center">
                      <div className="text-6xl font-bold">{queueData.userQueueEntry.position}</div>
                      <div className="text-2xl ml-2">of {queueData.queueEntries.length}</div>
                    </div>
                    <Progress 
                      value={(queueData.userQueueEntry.position / queueData.queueEntries.length) * 100} 
                      className="h-2 mt-4"
                    />
                  </CardBody>
                </Card>
                <Card className="mb-6 dark:bg-gray-800 dark:text-gray-200">
                  <CardHeader>
                    <h2 className="text-2xl font-bold">Estimated Wait Time</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="text-5xl font-bold text-center">
                        {queueData.userQueueEntry.estimated_wait_time} minutes
                      </div>
                      <p className="text-center text-muted-foreground dark:text-gray-400">
                        {expectedTurnTime ? `Your turn is expected at ${expectedTurnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Service start time not available"}
                      </p>
                      {countdown && (
                        <div className="text-2xl font-bold text-center text-primary dark:text-blue-400">
                          {countdown}
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
                <Button 
                  color="danger" 
                  variant="flat" 
                  onClick={handleLeaveQueue} 
                  className="w-full mb-4"
                  isLoading={isLeaving}
                >
                  {isLeaving ? 'Leaving Queue...' : 'Leave Queue'}
                </Button>
                <AddKnownUserModal queueId={params.queueid} onSuccess={handleAddKnownSuccess} />
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <h3 className="font-semibold mb-2">While you're in the queue:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Stay nearby and be ready to arrive when it's your turn</li>
                    <li>Keep an eye on your notifications for updates on your position</li>
                    <li>Remember that these times are estimates and may vary depending on actual service times and any changes in the queue</li>
                    <li>If you leave the queue, any payment made will not be refunded</li>
                    <li>Leaving the queue will forfeit any progress you've made in your position</li>
                    {showAllInfo ? (
                      <>
                        <li>Your estimated wait time is calculated based on the average service time and the number of people ahead of you. It may change as the queue progresses</li>
                        <li>Your position in the queue represents your place in line. Position 1 means you're next to be served</li>
                        <li>The service start time is when we expect you to reach the front of the queue and begin receiving service. This is different from the estimated wait time, which is how long until your service starts</li>
                        <li>If you need to leave, use the 'Leave Queue' button above</li>
                      </>
                    ) : null}
                  </ul>
                  <Button
                    variant="light"
                    onClick={() => setShowAllInfo(!showAllInfo)}
                    className="mt-2 w-full flex items-center justify-center"
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
                </div>
              </div>
              
              {/* Queue Info Section */}
              <QueueInfoSec queueData={queueData} isLoading={isLoading} handleShare={handleShare} />
            </>
          ) : (
            <>
              {/* Queue Info Section */}
              <QueueInfoSec queueData={queueData} isLoading={isLoading} handleShare={handleShare} />
              {/* Join Queue Section */}
              <div>
                <Card className="mb-6 dark:bg-gray-800 dark:text-gray-200">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Current Queue Status</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Queue Capacity</span>
                          <span>{queueData.queueEntries.length} / {queueData.max_capacity}</span>
                        </div>
                        <Progress value={(queueData.queueEntries.length / queueData.max_capacity) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <span>people ahead</span>
                        </div>
                        <span className="font-semibold">{queueData.queueEntries.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <span>Estimated wait time</span>
                        </div>
                        <span className="font-semibold">{queueData.queueEntries.length * queueData.est_time_to_serve} minutes</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                
                <Card className="dark:bg-gray-800 dark:text-gray-200">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Join the Queue</h2>
                  </CardHeader>
                  <CardBody>
                    <p className="mb-4">Ready to join? Click the button below to secure your spot in the queue.</p>
                    <Button 
                      onClick={handleJoinQueue} 
                      color="primary" 
                      className="w-full mb-4"
                      isLoading={isJoining}
                    >
                      {isJoining ? 'Joining Queue...' : 'Join Queue'}
                    </Button>
                    <AddKnownUserModal queueId={params.queueid} onSuccess={handleAddKnownSuccess} />
                    
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <h3 className="font-semibold mb-2">Before you join:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Make sure you're ready to arrive when it's your turn</li>
                        <li>You'll receive notifications as you move up in the queue</li>
                        <li>You can leave the queue at any time if needed</li>
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}