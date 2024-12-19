'use client'

import QueueDetailsPage from '@/app/components/QueueIdCompo/QueueidPage/Default'
import StreetFoodPreOrder from '@/app/components/QueueIdCompo/ServiceTypes/StreetFood'
import PharmacyPreOrder from '@/app/components/QueueIdCompo/ServiceTypes/Pharmacy'
import RestaurantPage from '@/app/components/QueueIdCompo/ServiceTypes/restaurant'
import { useApi } from '@/app/hooks/useApi'
import { Spinner } from "@nextui-org/react"
import { SWRConfig } from 'swr'

// Prefetch configuration
const fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}

export default function QueuePage({ params }) {
  const { data: minimalQueueData, isLoading, isError, error } = useApi(`/api/queues/${params.queueid}/minimal`, {
    onSuccess: (data) => {
      // Prefetch full queue data based on service type
      if (data?.service_type) {
        // Prefetch detailed queue data
        fetcher(`/api/queues/${params.queueid}`)
        
        // Prefetch service-specific data
        switch(data.service_type) {
          case 'streetfood':
            fetcher(`/api/queues/${params.queueid}/menu`)
            break
          case 'pharmacy':
            fetcher(`/api/queues/${params.queueid}/inventory`)
            break
          case 'restaurant':
            fetcher(`/api/queues/${params.queueid}/tables`)
            break
        }
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  let content;
  if (minimalQueueData?.service_type === 'streetfood') {
    content = <StreetFoodPreOrder params={params} />
  } else if (minimalQueueData?.service_type === 'pharmacy') {
    content = <PharmacyPreOrder params={params} />
  } else if (minimalQueueData?.service_type === 'restaurant') {
    content = <RestaurantPage />
  } else {
    content = <QueueDetailsPage params={params} />
  }

  return (
    <SWRConfig 
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval: 5000,
        suspense: false,
      }}
    >
      {content}
    </SWRConfig>
  )
}