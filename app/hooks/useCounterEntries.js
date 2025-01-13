'use client'

import useSWR from 'swr'

export function useCounterEntries(queueId, counterId) {
  const { data, error, mutate } = useSWR(
    counterId ? `/api/queues/${queueId}/counters/${counterId}/entries` : null,
    async (url) => {
      const response = await fetch(url)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch entries')
      }
      return data.entries // Return the entries array directly
    }
  )

  return {
    entries: data || [], // Provide entries directly instead of data
    isLoading: !error && !data,
    error,
    mutate
  }
} 