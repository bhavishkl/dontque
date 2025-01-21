import useSWR from 'swr'
import { supabase } from '../lib/supabase'

// Global cache key prefix
const USER_INFO_KEY = 'user-info'

// Fetcher function with error handling
const fetchUserInfo = async (userId) => {
  if (!userId) return null

  try {
    const { data, error } = await supabase
      .from('user_profile')
      .select('name, role, image, user_short_id')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return {
      name: data.name,
      role: data.role,
      image: data.image,
      short_id: data.user_short_id,
      isNameNull: !data.name
    }
  } catch (error) {
    console.error('Error fetching user info:', error)
    throw error
  }
}

// Global SWR configuration for user info
const userInfoConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false, // Changed to false since user data rarely changes
  dedupingInterval: 3600000, // Increased to 1 hour since user data is relatively static
  refreshInterval: 0, // Removed auto-refresh since user data doesn't need constant updates
  shouldRetryOnError: false, // Don't retry on error since it's likely a permanent error
}

export function useUserInfo(userId) {
  const cacheKey = userId ? `${USER_INFO_KEY}-${userId}` : null

  const { data, error, mutate } = useSWR(
    cacheKey,
    () => fetchUserInfo(userId),
    userInfoConfig
  )

  const updateUserInfo = async (newInfo) => {
    try {
      // Optimistic update
      mutate({ ...data, ...newInfo }, false)

      const { error: updateError } = await supabase
        .from('user_profile')
        .update(newInfo)
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Update all instances of this user's data across the app
      mutate()

      return true
    } catch (error) {
      // Revert optimistic update
      mutate(data, false)
      console.error('Error updating user info:', error)
      throw error
    }
  }

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    updateUserInfo,
    mutate, // Expose mutate for manual revalidation if needed
  }
}

// Optional: Add a preload function for critical user data
export const preloadUserInfo = (userId) => {
  if (userId) {
    const key = `${USER_INFO_KEY}-${userId}`
    // Trigger fetch but don't wait for it
    useSWR.preload(key, () => fetchUserInfo(userId))
  }
}