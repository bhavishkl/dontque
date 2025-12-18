'use client'

import { useEffect } from 'react'
import { useSession } from "@/lib/mock-auth"
import { useRouter } from 'next/navigation'
import { History, Star, ExternalLink } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton } from "@nextui-org/react"
import Link from 'next/link'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'

export default function QueueHistory() {
  const { data: pastQueues, isLoading, isError } = useApi('/api/user/past-queues')
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/signin')
    }
  }, [session, router])

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load queue history. Please try again.')
    }
  }, [isError])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="dark:bg-gray-800 border-none shadow-lg">
          <CardHeader className="flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary dark:text-primary-dark" />
              <h2 className="text-lg sm:text-xl font-semibold dark:text-white">Queue History</h2>
            </div>
          </CardHeader>
          <CardBody className="px-2 sm:px-6">
            {isLoading ? (
              <Skeleton className="w-full h-60" />
            ) : pastQueues && pastQueues.length > 0 ? (
              <div className="overflow-x-auto">
                <Table aria-label="Queue history">
                  <TableHeader>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Queue Name</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Date</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Wait Time</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Rating</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Details</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {pastQueues.map((queue) => (
                      <TableRow key={queue.id} className="dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <TableCell className="font-medium text-sm sm:text-base">{queue.name}</TableCell>
                        <TableCell className="text-sm sm:text-base whitespace-nowrap">{queue.date}</TableCell>
                        <TableCell className="text-sm sm:text-base">{queue.waitTime} min</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm sm:text-base">{queue.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/user/queue-history/${queue.id}`} passHref>
                            <Button 
                              size="sm"
                              variant="bordered" 
                              className="text-xs sm:text-sm bg-transparent border-primary text-primary dark:border-primary-dark dark:text-primary-dark hover:bg-primary/10 dark:hover:bg-primary-dark/10"
                              startContent={<ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />}
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
                <p className="dark:text-gray-300 text-base sm:text-lg">You have no queue history.</p>
              </div>
            )}
          </CardBody>
        </Card>
      </main>
    </div>
  )
} 