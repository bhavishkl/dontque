'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Spinner } from "@nextui-org/react"
import QueueInfoSec from '../QueueidPage/QueueInfoSec'
import { toast } from 'sonner'

export default function Advanced({ params }) {
  const [queueData, setQueueData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        const response = await fetch(`/api/queues/${params.queueid}`)
        if (!response.ok) throw new Error('Failed to fetch queue data')
        const data = await response.json()
        setQueueData(data)
      } catch (error) {
        console.error('Error fetching queue data:', error)
        toast.error('Failed to load queue data')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.queueid) {
      fetchQueueData()
    }
  }, [params.queueid])

  const handleShare = async () => {
    try {
      await navigator.share({
        title: queueData?.name,
        text: `Check out ${queueData?.name} on DontQ!`,
        url: window.location.href,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleJoinQueue = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queueId: params.queueid,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to join queue')
      }

      const data = await response.json()
      toast.success('Successfully joined the queue!')
      // Refresh queue data
      const updatedQueueResponse = await fetch(`/api/queues/${params.queueid}`)
      if (updatedQueueResponse.ok) {
        const updatedData = await updatedQueueResponse.json()
        setQueueData(updatedData)
      }
    } catch (error) {
      toast.error('Failed to join queue')
      console.error('Error joining queue:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <QueueInfoSec
        queueData={queueData}
        isLoading={isLoading}
        handleShare={handleShare}
      />
      
      <div className="mt-8 grid gap-6">
        <Card className="dark:bg-gray-800">
          <CardBody>
            <h2 className="text-2xl font-semibold mb-4">Advanced Queue Features</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Current Position</h3>
                  <p className="text-gray-500">
                    {queueData?.current_position || 'Not in queue'}
                  </p>
                </div>
                <Button
                  color="primary"
                  onClick={handleJoinQueue}
                  isLoading={isSubmitting}
                >
                  Join Queue
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Estimated Wait Time</h3>
                <p className="text-gray-500">
                  {queueData?.estimated_wait_time || 'Calculating...'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Priority Status</h3>
                <p className="text-gray-500">
                  {queueData?.priority_status || 'Standard'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
