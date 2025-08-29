'use client'

import { useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Clock, Users, MapPin, Calendar, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Badge, Skeleton, Progress, Chip } from "@nextui-org/react"
import Link from 'next/link'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import UserQueueCard from '@/app/components/UserQueueCard'

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

  // helpers are encapsulated in UserQueueCard

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
              {currentQueues.map((queue) => (
                <UserQueueCard key={queue.id} queue={queue} />
              ))}
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