'use client'

import { useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Badge, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton } from "@nextui-org/react"
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
    <Table>
      <TableHeader>
        <TableColumn className="dark:text-gray-200">Queue Name</TableColumn>
        <TableColumn className="dark:text-gray-200">Position</TableColumn>
        <TableColumn className="dark:text-gray-200">Estimated Wait Time</TableColumn>
        <TableColumn className="dark:text-gray-200">Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {[...Array(3)].map((_, index) => (
          <TableRow key={index} className="dark:bg-gray-800 dark:text-white">
            <TableCell><Skeleton className="w-full h-6" /></TableCell>
            <TableCell><Skeleton className="w-16 h-6" /></TableCell>
            <TableCell><Skeleton className="w-24 h-6" /></TableCell>
            <TableCell><Skeleton className="w-24 h-8 rounded-md" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="dark:bg-gray-800 border-none shadow-lg">
          <CardHeader className="flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary dark:text-primary-dark" />
              <h2 className="text-lg sm:text-xl font-semibold dark:text-white">Current Queues</h2>
            </div>
          </CardHeader>
          <CardBody className="px-2 sm:px-6">
            {isLoading ? (
              renderCurrentQueuesSkeleton()
            ) : currentQueues && currentQueues.length > 0 ? (
              <div className="overflow-x-auto">
                <Table aria-label="Current queues">
                  <TableHeader>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Queue Name</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Position</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base whitespace-nowrap">Est. Wait Time</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Actions</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {currentQueues.map((queue) => (
                      <TableRow key={queue.id} className="dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <TableCell className="font-medium text-sm sm:text-base">{queue.name}</TableCell>
                        <TableCell>
                          <Badge color="primary" variant="flat" className="text-xs sm:text-sm">#{queue.position}</Badge>
                        </TableCell>
                        <TableCell className="text-sm sm:text-base">{queue.estimatedWaitTime} min</TableCell>
                        <TableCell>
                          <Link href={`/user/queue/${queue.id}`} passHref>
                            <Button 
                              size="sm"
                              className="text-xs sm:text-sm bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary/20 dark:hover:bg-primary-dark/20"
                            >
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="dark:text-gray-300 text-base sm:text-lg">You are not currently in any queues.</p>
                <Link href="/user/queues" passHref>
                  <Button 
                    className="mt-4 bg-primary text-white dark:bg-primary-dark hover:opacity-90 transition-opacity text-sm sm:text-base"
                  >
                    Join a Queue
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  )
} 