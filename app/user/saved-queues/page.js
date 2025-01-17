'use client'

import { useState } from 'react'
import { Card, CardBody, Skeleton } from "@nextui-org/react"
import { useApi } from '@/app/hooks/useApi'
import { useSession } from 'next-auth/react'
import { Bookmark } from 'lucide-react'
import QueueItem from '@/app/components/UniComp/QueueItem'

export default function SavedQueues() {
  const { data: session } = useSession()
  const { data: savedQueues, isLoading, error } = useApi('/api/user/saved-queues')

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardBody className="text-center p-8">
            <div className="mb-4">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Error Loading Saved Queues</h3>
            <p className="text-gray-500 dark:text-gray-400">
              There was an error loading your saved queues. Please try again later.
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Queues</h1>

      {isLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-4">
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-1/2 h-4 mb-4" />
                <Skeleton className="w-full h-10 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : savedQueues?.length > 0 ? (
        // Saved queues grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedQueues.map((queue) => (
            <QueueItem key={queue.queue_id} queue={queue} />
          ))}
        </div>
      ) : (
        // Empty state
        <Card className="max-w-md mx-auto">
          <CardBody className="text-center p-8">
            <div className="mb-4">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Saved Queues</h3>
            <p className="text-gray-500 dark:text-gray-400">
              You haven't saved any queues yet. When you find a queue you like, click the bookmark icon to save it for later.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  )
} 