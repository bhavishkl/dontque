'use client'

import { useSession } from 'next-auth/react'
import { useSupabase } from './useSupabase'
import { useEffect, useRef } from 'react'

// Global cache key prefix
const USER_INFO_KEY = 'user-info'

export function useUserInfo(userId) {
  const { data: session, update: updateSession } = useSession()
  const lastRoleRef = useRef(null)

  const cacheKey = userId ? `${USER_INFO_KEY}-${userId}` : null

  const { data, error, mutate } = useSupabase('user_profile', {
    action: 'select',
    data: 'name, role, image, user_short_id',
    filters: userId ? [{ type: 'eq', column: 'user_id', value: userId }] : null,
    key: cacheKey
  })

  // Transform the data to match the expected format
  const transformedData = data?.[0] ? {
    name: data[0].name,
    role: data[0].role,
    image: data[0].image,
    short_id: data[0].user_short_id,
    needsNameUpdate: !data[0].name || data[0].name === 'User'
  } : null

  // Use useEffect with proper cleanup and ref to prevent infinite updates
  useEffect(() => {
    const currentRole = transformedData?.role
    const sessionRole = session?.user?.role

    // Only update if roles are different and we haven't updated for this role yet
    if (currentRole && 
        sessionRole && 
        currentRole !== sessionRole && 
        currentRole !== lastRoleRef.current) {
      
      lastRoleRef.current = currentRole // Update ref before making the change
      
      updateSession({
        ...session,
        user: {
          ...session.user,
          role: currentRole
        }
      }).catch(console.error) // Handle promise rejection
    }

    // Cleanup function
    return () => {
      // No cleanup needed for this case
    }
  }, [transformedData?.role, session])

  const updateUserName = async (newName) => {
    if (!newName || newName.trim() === '') {
      throw new Error('Name cannot be empty')
    }

    try {
      // Optimistic update
      const optimisticData = {
        ...transformedData,
        name: newName.trim(),
        needsNameUpdate: false
      }
      mutate({ name: newName.trim() }, {
        action: 'update',
        filters: [{ type: 'eq', column: 'user_id', value: userId }],
        optimisticData: [optimisticData]
      })

      return true
    } catch (error) {
      console.error('Error updating user name:', error)
      throw error
    }
  }

  return {
    ...transformedData,
    isLoading: !error && !transformedData,
    isError: error,
    updateUserName,
    needsNameUpdate: transformedData?.needsNameUpdate,
    mutate,
  }
}
