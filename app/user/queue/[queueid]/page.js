'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Clock, Users, ClipboardCopy, Star, Share2, Bell, ChevronDown, ChevronUp, UserPlus } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Chip, Progress, Skeleton, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react"
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { createClient } from '@supabase/supabase-js'
import AddKnownUserModal from '@/app/components/UniComp/AddKnownUserModal';
import { useApi } from '@/app/hooks/useApi'

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

export default function QueueDetailsPage({ params }) {
  const { data: queueData, isLoading, isError, mutate } = useApi(`/api/queues/${params.queueid}`)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const { data: session } = useSession()
  const [showAllInfo, setShowAllInfo] = useState(false)
  const [countdown, setCountdown] = useState('');
  const [expectedTurnTime, setExpectedTurnTime] = useState(null);

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
      console.log('Creating Razorpay order...');
      const receipt = `queue_${params.queueid.substring(0, 34)}`;
      const orderResponse = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 10, // 10 INR
          currency: 'INR',
          receipt: receipt,
          notes: { queueId: params.queueid }
        }),
      });
  
      const orderData = await orderResponse.json();
  
      if (!orderResponse.ok) {
        console.error('Failed to create Razorpay order:', orderData);
        throw new Error(orderData.error || 'Failed to create Razorpay order');
      }
  
      console.log('Razorpay order created:', orderData);
  
      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'QueueSmart',
        description: 'Queue Joining Fee',
        order_id: orderData.id,
        handler: async function (response) {
          console.log('Payment successful:', response);
          // Handle successful payment
          const joinResponse = await fetch(`/api/queues/${params.queueid}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
  
          if (!joinResponse.ok) {
            throw new Error('Failed to join queue');
          }
  
          toast.success('Successfully joined the queue');
          await mutate();
          scrollToTop(); 
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };
  
      console.log('Initializing Razorpay payment with options:', { ...options, key: '(hidden)' });
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Error joining queue:', err);
      toast.error(err.message || 'Failed to join queue');
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
        throw new Error('Failed to leave queue');
      }
  
      toast.success('Successfully left the queue');
      await mutate();
    } catch (err) {
      console.error('Error leaving queue:', err);
      toast.error(err.message || 'Failed to leave queue');
    } finally {
      setIsLeaving(false);
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
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
                  <Skeleton className="w-full h-40 rounded-lg" />
                </CardBody>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <Skeleton className="w-48 h-8 rounded-lg" />
                </CardHeader>
                <CardBody>
                  <Skeleton className="w-full h-40 rounded-lg" />
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
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="w-48 h-8 rounded-lg" />
                </CardHeader>
                <CardBody>
                  <Skeleton className="w-full h-10 rounded-lg mb-4" />
                  <Skeleton className="w-full h-10 rounded-lg mb-4" />
                  <Skeleton className="w-full h-20 rounded-lg" />
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
        <div className="flex space-x-2">
          <Button isIconOnly variant="light" aria-label="Notify Me" onClick={toggleNotifications}>
            <Bell className={`h-4 w-4 ${notificationsEnabled ? 'text-blue-600 dark:text-blue-400' : ''}`} />
          </Button>
          <Button isIconOnly variant="light" aria-label="Share" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
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
              <div className="space-y-4">
                <Skeleton isLoaded={!isLoading} className="rounded-lg mb-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={queueData?.image_url || 'https://via.placeholder.com/300x200'}
                      alt={queueData?.name || 'Queue Image'}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </Skeleton>
                <Skeleton isLoaded={!isLoading} className="mb-2">
                  <h1 className="text-3xl font-bold dark:text-white">{queueData?.name}</h1>
                </Skeleton>
                <Skeleton isLoaded={!isLoading} className="mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Chip color="secondary" variant="flat">{queueData?.category}</Chip>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="font-medium text-yellow-700 dark:text-yellow-300">{queueData?.avg_rating || 'NaN'}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({queueData?.total_ratings || 0})</span>
                      </div>
                    </div>
                    {queueData?.short_id && (
                      <Chip
                        variant="flat"
                        color="default"
                        className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
                      >
                        <span className="mr-2">ID: {queueData.short_id}</span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => {
                            navigator.clipboard.writeText(queueData.short_id);
                            toast.success('Queue ID copied');
                          }}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </Chip>
                    )}
                  </div>
                </Skeleton>
                <Skeleton isLoaded={!isLoading} className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300">{queueData?.description}</p>
                </Skeleton>
                <Skeleton isLoaded={!isLoading}>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{queueData?.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>Open: {queueData?.opening_time} - {queueData?.closing_time}</span>
                    </div>
                  </div>
                </Skeleton>
              </div>
            </>
          ) : (
            <>
              {/* Queue Info Section */}
              <div className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <Skeleton isLoaded={!isLoading} className="rounded-lg mb-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={queueData?.image_url || 'https://via.placeholder.com/300x200'}
                      alt={queueData?.name || 'Queue Image'}
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h2 className="text-xl font-bold mb-1">{queueData?.name}</h2>
                      <p className="text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {queueData?.location}
                      </p>
                    </div>
                  </div>
                </Skeleton>
                <Skeleton isLoaded={!isLoading} className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{queueData?.description}</p>
                </Skeleton>
                <div className="space-y-4">
                  <Skeleton isLoaded={!isLoading} className="mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Chip color="secondary" variant="flat" className="text-sm">{queueData?.category}</Chip>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 rounded-full px-3 py-1">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-medium text-yellow-700 dark:text-yellow-300">{queueData?.avg_rating || 'NaN'}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({queueData?.total_ratings || 0})</span>
                        </div>
                        {queueData?.short_id && (
                          <Chip
                            variant="flat"
                            color="default"
                            className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
                          >
                            <span className="mr-2">Queue ID: {queueData.short_id}</span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onClick={() => {
                                navigator.clipboard.writeText(queueData.short_id);
                                toast.success('Queue ID copied');
                              }}
                            >
                              <ClipboardCopy className="h-4 w-4" />
                            </Button>
                          </Chip>
                        )}
                      </div>
                    </div>
                  </Skeleton>
                  <Skeleton isLoaded={!isLoading}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Clock className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                        <span>Open: {queueData?.opening_time} - {queueData?.closing_time}</span>
                      </div>
                    </div>
                  </Skeleton>
                </div>
              </div>
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
                          <span>{queueData.current_queue} / {queueData.max_capacity}</span>
                        </div>
                        <Progress value={(queueData.current_queue / queueData.max_capacity) * 100} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <span>People in queue</span>
                        </div>
                        <span className="font-semibold">{queueData.current_queue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                          <span>Estimated wait time</span>
                        </div>
                        <span className="font-semibold">{queueData.avg_wait_time} minutes</span>
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