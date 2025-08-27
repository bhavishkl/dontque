'use client'

import { useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Clock, Users, MapPin, Calendar, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Badge, Skeleton, Progress, Chip } from "@nextui-org/react"
import Link from 'next/link'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'

export default function CurrentQueues() {
  const { data: currentQueues, isLoading, isError } = useApi('/api/user/current-queues')
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/signin')
    }
  }, [session, router])

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load queue data. Please try again.')
    }
  }, [isError])

  const renderCurrentQueuesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="bg-background/60 shadow-sm">
          <CardBody className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-2 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )

  const getWaitTimeStatus = (estimatedWaitTime) => {
    if (estimatedWaitTime <= 5) return { color: 'success', text: 'Almost there!' }
    if (estimatedWaitTime <= 15) return { color: 'warning', text: 'Getting closer' }
    return { color: 'default', text: 'Please be patient' }
  }

  const getPositionStatus = (position) => {
    if (position <= 3) return { color: 'success', text: 'Next up!' }
    if (position <= 10) return { color: 'warning', text: 'Getting close' }
    return { color: 'default', text: 'In queue' }
  }

  const formatJoinTime = (joinTime) => {
    const now = new Date()
    const join = new Date(joinTime)
    const diffInMinutes = Math.floor((now - join) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hr${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/70 backdrop-blur-lg border-b border-divider z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Current Queues</h1>
              <p className="text-sm text-default-500">Track your queue positions and wait times</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          renderCurrentQueuesSkeleton()
        ) : currentQueues && currentQueues.length > 0 ? (
          <div className="space-y-6">
            {/* Queue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentQueues.map((queue) => {
                const waitTimeStatus = getWaitTimeStatus(queue.estimatedWaitTime)
                const positionStatus = getPositionStatus(queue.position)
                
                return (
                  <Card 
                    key={queue.id} 
                    className="bg-background/60 shadow-sm hover:shadow-md transition-all duration-200 border border-divider/50 hover:border-divider"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-default-900 truncate">
                              {queue.name}
                            </h3>
                            {queue.service_type === 'advanced' && (
                              <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                                PRO
                              </Chip>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-default-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{queue.location || 'Location not specified'}</span>
                          </div>
                        </div>
                        <Badge 
                          color={positionStatus.color} 
                          variant="flat" 
                          className="text-xs font-medium"
                        >
                          #{queue.position}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardBody className="pt-0">
                      {/* Position Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-default-600">Queue Progress</span>
                          <span className="text-xs text-default-500">{positionStatus.text}</span>
                        </div>
                        <Progress 
                          value={Math.max(0, 100 - (queue.position * 10))} 
                          color={positionStatus.color}
                          className="h-2"
                        />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-default-50 rounded-lg">
                          <div className="text-lg font-bold text-primary">
                            {queue.estimatedWaitTime || 0}
                          </div>
                          <div className="text-xs text-default-500">Est. Wait (min)</div>
                        </div>
                        <div className="text-center p-3 bg-default-50 rounded-lg">
                          <div className="text-lg font-bold text-secondary">
                            #{queue.position}
                          </div>
                          <div className="text-xs text-default-500">Your Position</div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-default-400" />
                            <span className="text-xs text-default-600">Joined</span>
                          </div>
                          <span className="text-xs text-default-500">
                            {formatJoinTime(queue.join_time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-default-400" />
                            <span className="text-xs text-default-600">Wait Status</span>
                          </div>
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            color={waitTimeStatus.color}
                            className="text-xs"
                          >
                            {waitTimeStatus.text}
                          </Chip>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/user/queue/${queue.id}`} className="flex-1">
                          <Button 
                            color="primary" 
                            variant="flat" 
                            size="sm" 
                            className="w-full"
                            endContent={<ArrowRight className="w-3 h-3" />}
                          >
                            View Details
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="bordered"
                          className="text-xs"
                        >
                          Leave Queue
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>

            {/* Tips Section */}
            <Card className="bg-background/60 shadow-sm border border-divider/50">
              <CardBody className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-info/10">
                    <AlertCircle className="h-5 w-5 text-info" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Queue Tips</h3>
                    <ul className="text-sm text-default-600 space-y-1">
                      <li>• Estimated wait times are approximate and may vary</li>
                      <li>• You'll receive notifications when it's your turn</li>
                      <li>• Keep your phone nearby for updates</li>
                      <li>• You can leave a queue anytime if needed</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <Card className="bg-background/60 shadow-sm">
            <CardBody className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-default-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-default-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-default-700">No Active Queues</h3>
                  <p className="text-sm text-default-500 mt-1">
                    You're not currently waiting in any queues
                  </p>
                </div>
                <Link href="/user/queues">
                  <Button color="primary" startContent={<Users className="w-4 h-4" />}>
                    Join a Queue
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  )
} 