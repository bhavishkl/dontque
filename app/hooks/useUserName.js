import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserInfo(userId) {
  const [userInfo, setUserInfo] = useState({ name: '', role: '', image: '' })
  const [isNameNull, setIsNameNull] = useState(false)

  const fetchUserInfo = async () => {
    if (userId) {
      if (typeof window !== 'undefined') {
        const storedInfo = localStorage.getItem(`userInfo_${userId}`)
        if (storedInfo) {
          const parsedInfo = JSON.parse(storedInfo)
          setUserInfo(parsedInfo)
          setIsNameNull(!parsedInfo.name)
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
        setIsNameNull(!data.name)
        if (typeof window !== 'undefined') {
          localStorage.setItem(`userInfo_${userId}`, JSON.stringify(newUserInfo))
        }
      }
    }
  }

  useEffect(() => {
    fetchUserInfo()
  }, [userId])

  const updateUserInfo = (newInfo) => {
    setUserInfo(prevInfo => ({ ...prevInfo, ...newInfo }))
    setIsNameNull(!newInfo.name)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`userInfo_${userId}`, JSON.stringify({ ...userInfo, ...newInfo }))
    }
  }

  return { ...userInfo, isNameNull, updateUserInfo }
}