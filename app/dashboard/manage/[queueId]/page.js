'use client'

import { Spinner } from "@nextui-org/react"
import { useApi } from '@/app/hooks/useApi'
import dynamic from 'next/dynamic'

// Dynamic imports with loading fallback
const ManagementComponents = {
  advanced: dynamic(() => import('@/app/components/ManagementComponents/Manage-advanced'), {
    loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }),
  default: dynamic(() => import('@/app/components/ManagementComponents/Manage-default'), {
    loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }),
  default2: dynamic(() => import('@/app/components/ManagementComponents/Manage-default-2'), {
    loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  })
}

export default function QueueManagementPage({ params }) {
  const { data: queueData, isLoading, isError, mutate: refetchQueueData } = useApi(`/api/queues/${params.queueId}/manage`, {
    revalidateOnMount: true,
    dedupingInterval: 3000,
    onSuccess: (data) => {
      if (data?.id) {
        fetch(`/api/queues/${params.queueId}/stats`)
      }
    }
  })

  // Debug log
  console.log('Queue service type:', queueData?.queueData?.service_type)

  if (isError) {
    return <div className="text-red-500">Error loading queue data</div>
  }

  if (!queueData && isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }

  const serviceType = queueData?.queueData?.service_type
  const ManagementComponent = ManagementComponents[serviceType] || ManagementComponents.default
  
  return <ManagementComponent 
    params={params} 
    queueData={queueData} 
    isLoading={isLoading} 
    refetchQueueData={refetchQueueData}
  />
}