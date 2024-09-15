'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Clock, Users, Star, Share2, Bell, ChevronDown, ChevronUp } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Chip, Progress, Skeleton } from "@nextui-org/react"
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'

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
    // If service start time has passed, add estimated wait time to current time
    expectedTurnTime = new Date(now.getTime() + queueData.userQueueEntry.estimated_wait_time * 60000);
  } else {
    // If service start time is in the future, add estimated wait time to service start time
    expectedTurnTime = new Date(serviceStartTime.getTime() + queueData.userQueueEntry.estimated_wait_time * 60000);
  }

  const formattedTime = expectedTurnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return { 
    formattedTime: `Your turn is expected at ${formattedTime}`,
    expectedTurnTime: expectedTurnTime
  };
};

export default function QueueDetailsPage({ params }) {
  const [queueData, setQueueData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { data: session } = useSession()
  const [showAllInfo, setShowAllInfo] = useState(false)
  const [countdown, setCountdown] = useState('');
  const [expectedTurnTime, setExpectedTurnTime] = useState(null);

  const toggleNotifications = async () => {
    // TODO: Implement notification toggle logic
    setNotificationsEnabled(!notificationsEnabled)
    toast.success(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled')
  }

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

  const fetchQueueData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/queues/${params.queueid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch queue data');
      }
      const data = await response.json();
      setQueueData(data);
      if (data.userQueueEntry) {
        const { expectedTurnTime, formattedTime } = calculateExpectedTurnTime(data);
        setExpectedTurnTime(expectedTurnTime);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch queue data');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQueueData();
  
    const subscription = supabase
      .channel(`queue_${params.queueid}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'queue_entries',
        filter: `queue_id=eq.${params.queueid}`
      }, (payload) => {
        console.log('Change received!', payload);
        fetchQueueData();
      })
      .subscribe();
  
    return () => {
      subscription.unsubscribe();
    };
  }, [params.queueid]);

  const handleJoinQueue = async () => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/queues/${params.queueid}/join`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to join queue')
      }
      toast.success('Successfully joined the queue')
      // Refresh queue data after joining
      await fetchQueueData()
    } catch (err) {
      setError(err.message)
      toast.error('Failed to join queue')
    } finally {
      setIsJoining(false)
    }
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const handleLeaveQueue = async () => {
    setIsLeaving(true)
    try {
      const response = await fetch(`/api/queues/${params.queueid}/leave`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to leave queue');
      }
      toast.success('Successfully left the queue')
      // Refresh queue data after leaving
      await fetchQueueData();
    } catch (err) {
      toast.error('Failed to leave queue')
    } finally {
      setIsLeaving(false)
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: queueData?.name,
          text: `Check out this queue: ${queueData?.name}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Queue link copied to clipboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
  <Link href="/user/queues" className="flex items-center text-blue-600">
    <ArrowLeft className="mr-2" />
    <span className="font-semibold">Back to Queues</span>
  </Link>
  <div className="flex space-x-2">
    <Button isIconOnly variant="light" aria-label="Notify Me" onClick={toggleNotifications}>
      <Bell className={`h-4 w-4 ${notificationsEnabled ? 'text-blue-600' : ''}`} />
    </Button>
    <Button isIconOnly variant="light" aria-label="Share" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
    </Button>
  </div>
</div>

      <main className="container mx-auto px-4 py-2">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Skeleton isLoaded={!isLoading} className="rounded-lg mb-6">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={queueData?.image_url || 'https://via.placeholder.com/300x200'}
                  alt={queueData?.name || 'Queue Image'}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </Skeleton>
            <Skeleton isLoaded={!isLoading} className="mb-4">
  <h1 className="text-4xl font-bold mb-2">{queueData?.name}</h1>
</Skeleton>
<Skeleton isLoaded={!isLoading} className="mb-6">
  <div className="flex items-center justify-between flex-wrap gap-2">
    <div className="flex items-center gap-2">
      <Chip color="secondary" variant="flat">{queueData?.category}</Chip>
    </div>
    <div className="flex items-center">
      <div className="flex items-center bg-yellow-100 rounded-full px-3 py-1">
        <Star className="w-4 h-4 text-yellow-500 mr-1" />
        <span className="font-medium text-yellow-700">{queueData?.avg_rating || 'NaN'}</span>
      </div>
      <span className="text-sm text-gray-500 ml-2">({queueData?.total_ratings || 0} ratings)</span>
    </div>
  </div>
</Skeleton>
<Skeleton isLoaded={!isLoading} className="mb-6">
  <p className="text-gray-600 text-lg">{queueData?.description}</p>
</Skeleton>
<div className="space-y-4 mb-8">
  <Skeleton isLoaded={!isLoading}>
    <div className="flex items-center text-gray-700 bg-gray-100 rounded-lg p-3">
      <MapPin className="w-5 h-5 mr-3 text-gray-500" />
      <span className="font-medium">{queueData?.location}</span>
    </div>
  </Skeleton>
  <Skeleton isLoaded={!isLoading}>
    <div className="flex items-center text-gray-700 bg-gray-100 rounded-lg p-3">
      <Clock className="w-5 h-5 mr-3 text-gray-500" />
      <span className="font-medium">Open: {queueData?.opening_time} - {queueData?.closing_time}</span>
    </div>
  </Skeleton>
</div>
          </div>
          <div>
          {isLoading ? (
  <>
    <Skeleton className="w-full h-40 rounded-lg mb-6" />
    <Skeleton className="w-full h-40 rounded-lg" />
  </>
) : queueData?.userQueueEntry ? (
  <>
    <Card className="bg-black text-primary-foreground mb-6">
      <CardHeader>
        <h2 className="text-2xl font-bold">Your Position</h2>
      </CardHeader>
      <CardBody>
        <div className="flex items-center justify-center">
          <div className="text-6xl font-bold">{queueData.userQueueEntry.position}</div>
          <div className="text-2xl ml-2">of {queueData.current_queue}</div>
        </div>
        <Progress 
          value={(queueData.userQueueEntry.position / queueData.current_queue) * 100} 
          className="h-2 mt-4"
        />
      </CardBody>
    </Card>
    <Card className="mb-6">
  <CardHeader>
    <h2 className="text-2xl font-bold">Estimated Wait Time</h2>
  </CardHeader>
  <CardBody>
    <div className="space-y-4">
      <div className="text-5xl font-bold text-center">
        {queueData.userQueueEntry.estimated_wait_time} minutes
      </div>
      <p className="text-center text-muted-foreground">
  {expectedTurnTime ? `Your turn is expected at ${expectedTurnTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Service start time not available"}
</p>
      {countdown && (
        <div className="text-2xl font-bold text-center text-primary">
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
    <div className="mt-4 text-sm text-gray-500">
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
  </>
) : (
  // ... (rest of the code for when user is not in queue
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Current Queue Status</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Queue Capacity</span>
                          <span>{queueData.current_queue} / {queueData.max_capacity}</span>
                        </div>
                        <Progress value={(queueData.current_queue / queueData.max_capacity) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          <span>People in queue</span>
                        </div>
                        <span className="font-semibold">{queueData.current_queue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-blue-600" />
                          <span>Estimated wait time</span>
                        </div>
                        <span className="font-semibold">{queueData.avg_wait_time} minutes</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                
                <Card>
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
                    
                    <div className="mt-4 text-sm text-gray-500">
                      <h3 className="font-semibold mb-2">Before you join:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Make sure you're ready to arrive when it's your turn</li>
                        <li>You'll receive notifications as you move up in the queue</li>
                        <li>You can leave the queue at any time if needed</li>
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}