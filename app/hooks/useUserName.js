import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserName(userId) {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function fetchUserName() {
      if (userId) {
        const { data, error } = await supabase
          .from('user_profile')
          .select('name')
          .eq('user_id', userId)
          .single()

        if (error) {
          console.error('Error fetching user name:', error)
        } else if (data) {
          setUserName(data.name)
        }
      }
    }

    fetchUserName()
  }, [userId])

  return userName
}