import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserInfo(userId) {
  const [userInfo, setUserInfo] = useState({ name: '', role: '' })

  useEffect(() => {
    async function fetchUserInfo() {
      if (userId) {
        const { data, error } = await supabase
          .from('user_profile')
          .select('name, role')
          .eq('user_id', userId)
          .single()

        if (error) {
          console.error('Error fetching user info:', error)
        } else if (data) {
          setUserInfo({ name: data.name, role: data.role })
        }
      }
    }

    fetchUserInfo()
  }, [userId])

  return userInfo
}