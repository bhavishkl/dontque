'use client'

import { Spinner } from "@nextui-org/react"
import { SWRConfig } from 'swr'
import { useApi } from '@/app/hooks/useApi'
import dynamic from 'next/dynamic'

// Dynamic imports with loading fallback
const ServiceComponents = {
  streetfood: dynamic(() => import('@/app/components/QueueIdCompo/ServiceTypes/StreetFood'), {
    loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }),
  pharmacy: dynamic(() => import('@/app/components/QueueIdCompo/ServiceTypes/Pharmacy'), {
    loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }),
  restaurant: dynamic(() => import('@/app/components/QueueIdCompo/ServiceTypes/restaurant'), {
    loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }),
  advanced: dynamic(() => import('@/app/components/QueueIdCompo/ServiceTypes/Advanced'), {
    loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }),
  default: dynamic(() => import('@/app/components/QueueIdCompo/QueueidPage/Default'), {
    loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  })
}

// Prefetch configuration
const fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}

function getServiceEndpoint(serviceType) {
  switch(serviceType) {
    case 'streetfood':
      return 'menu'
    case 'pharmacy':
      return 'inventory'
    case 'restaurant':
      return 'tables'
    case 'advanced':
      return 'queue-status'
    default:
      return ''
  }
}

export default function QueuePage({ params }) {
  const { data: queueData, isLoading, isError: error } = useApi(`/api/queues/${params.queueid}`)

  if (error) {
    return <div className="text-red-500">Error loading queue data</div>
  }

  if (!queueData && isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>
  }

  const ServiceComponent = ServiceComponents[queueData?.service_type] || ServiceComponents.default
  return (
    <SWRConfig
      value={{
        fetcher,
        suspense: false,
      }}
    >
      <div>
        <ServiceComponent params={params} queueData={queueData} />
      </div>
    </SWRConfig>
  )
}