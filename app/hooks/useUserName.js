import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserInfo(userId) {
  const [userInfo, setUserInfo] = useState({ name: '', role: '', image: '' })

  useEffect(() => {
    async function fetchUserInfo() {
      if (userId) {
        if (typeof window !== 'undefined') {
          const storedInfo = localStorage.getItem(`userInfo_${userId}`)
          if (storedInfo) {
            setUserInfo(JSON.parse(storedInfo))
            return
          }
        }

        const { data, error } = await supabase
          .from('user_profile')
          .select('name, role, image')
          .eq('user_id', userId)
          .single()

        if (error) {
          console.error('Error fetching user info:', error)
        } else if (data) {
          const newUserInfo = { name: data.name, role: data.role, image: data.image }
          setUserInfo(newUserInfo)
          if (typeof window !== 'undefined') {
            localStorage.setItem(`userInfo_${userId}`, JSON.stringify(newUserInfo))
          }
        }
      }
    }

    fetchUserInfo()
  }, [userId])

  return userInfo
}