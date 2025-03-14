'use client'

import { Spinner } from "@nextui-org/react"
import { useApi } from '@/app/hooks/useApi'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

// Simplified dynamic imports with shared loading state
const ManagementComponents = {
  advanced: dynamic(() => import('@/app/components/ManagementComponents/Manage-advanced')),
  default: dynamic(() => import('@/app/components/ManagementComponents/Manage-default'))
}

export default function QueueManagementPage({ params }) {
  const { data: queueData, isLoading, isError, mutate } = useApi(
    `/api/queues/${params.queueId}/manage`,
    { dedupingInterval: 5000, revalidateOnMount: true }
  )

  // Preserve refetch functionality
  useEffect(() => {
    const handleRefetch = () => mutate()
    window.addEventListener('refetchQueueData', handleRefetch)
    return () => window.removeEventListener('refetchQueueData', handleRefetch)
  }, [mutate])

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }

  if (isError || !queueData?.queueData) {
    return <div className="text-red-500 p-4">Error loading queue management</div>
  }

  const Component = ManagementComponents[queueData.queueData.service_type] || ManagementComponents.default
  
  return <Component 
    params={params} 
    queueData={queueData} 
    onUpdate={mutate}
  />
}