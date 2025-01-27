'use client'

import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import { useSession } from 'next-auth/react'

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
      needsNameUpdate: !data.name || data.name === 'User'
    }
  } catch (error) {
    console.error('Error fetching user info:', error)
    throw error
  }
}

// Global SWR configuration for user info
const userInfoConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 3600000,
  refreshInterval: 0,
  shouldRetryOnError: false,
}

export function useUserInfo(userId) {
  const { data: session, update: updateSession } = useSession()
  const cacheKey = userId ? `${USER_INFO_KEY}-${userId}` : null

  const { data, error, mutate } = useSWR(
    cacheKey,
    () => fetchUserInfo(userId),
    {
      ...userInfoConfig,
      onSuccess: async (data) => {
        if (data?.role && session?.user && data.role !== session.user.role) {
          // Update session with the role from database
          await updateSession({
            ...session,
            user: {
              ...session.user,
              role: data.role
            }
          })
        }
      }
    }
  )

  const updateUserName = async (newName) => {
    if (!newName || newName.trim() === '') {
      throw new Error('Name cannot be empty')
    }

    try {
      // Optimistic update
      mutate({ ...data, name: newName.trim(), needsNameUpdate: false }, false)

      const { error: updateError } = await supabase
        .from('user_profile')
        .update({ name: newName.trim() })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Update all instances of this user's data
      mutate()

      return true
    } catch (error) {
      // Revert optimistic update
      mutate(data, false)
      console.error('Error updating user name:', error)
      throw error
    }
  }

  return {
    ...data,
    isLoading: !error && !data,
    isError: error,
    updateUserName,
    needsNameUpdate: data?.needsNameUpdate,
    mutate,
  }
}

// Optional: Add a preload function for critical user data
export const preloadUserInfo = (userId) => {
  if (userId) {
    const key = `${USER_INFO_KEY}-${userId}`
    useSWR.preload(key, () => fetchUserInfo(userId))
  }
}