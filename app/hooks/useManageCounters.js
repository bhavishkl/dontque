'use client'

import { useApi } from './useApi'

export function useManageCounters(queueId) {
  const { data, isLoading, error, mutate } = useApi(
    `/api/queues/${queueId}/manage/counters`,
    {
      revalidateOnMount: true,
      dedupingInterval: 5000
    }
  )

  return {
    counters: data?.counters || [],
    isLoading,
    error,
    refetchCounters: mutate
  }
} 