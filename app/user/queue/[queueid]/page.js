'use client'

import QueueDetailsPage from '@/app/components/QueueIdCompo/QueueidPage/Default'
import StreetFoodPreOrder from '@/app/components/QueueIdCompo/ServiceTypes/StreetFood'
import PharmacyPreOrder from '@/app/components/QueueIdCompo/ServiceTypes/Pharmacy'
import RestaurantPage from '@/app/components/QueueIdCompo/ServiceTypes/restaurant'
import { useApi } from '@/app/hooks/useApi'
import { Spinner } from "@nextui-org/react"

export default function QueuePage({ params }) {
  const { data: minimalQueueData, isLoading, isError, error } = useApi(`/api/queues/${params.queueid}/minimal`)

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
    <>
      {content}
    </>
  )
}