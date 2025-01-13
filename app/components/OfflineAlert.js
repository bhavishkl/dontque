'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function OfflineAlert() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      toast.success('Back online!')
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast.error('No internet connection')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial state
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOffline) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 left-0 right-0 mx-auto w-[calc(100%-32px)] sm:w-auto sm:min-w-[320px] sm:max-w-[420px] bg-danger-50 dark:bg-danger-900 text-danger-500 dark:text-danger-400 p-4 rounded-lg shadow-lg z-50">
        <p className="text-center text-sm font-medium">
          You're currently offline. Please check your internet connection.
        </p>
      </div>
    )
  }

  return null
} 