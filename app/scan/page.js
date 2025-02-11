'use client'
import { useEffect, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function QRScannerPage() {
  const router = useRouter()
  const [scanResult, setScanResult] = useState('')
  const [hasCameraAccess, setHasCameraAccess] = useState(null) // Start with null for initial state
  const [cameraError, setCameraError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          signal: controller.signal
        })
        
        if (isMounted) {
          setHasCameraAccess(true)
          // Stop any existing tracks
          stream.getTracks().forEach(track => track.stop())
        }
      } catch (error) {
        if (isMounted) {
          setHasCameraAccess(false)
          setCameraError(error.name)
          console.error('Camera error:', error)
        }
      }
    }

    checkCameraAccess()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const handleScanResult = (result) => {
    if (result && result !== scanResult) {
      setScanResult(result)
      
      setTimeout(() => {
        try {
          const url = result.startsWith('/') 
            ? new URL(result, window.location.origin)
            : new URL(result);
          
          if (url.origin === window.location.origin) {
            router.push(url.pathname)
          } else {
            toast.error('External links are not allowed')
            router.back()
          }
        } catch (error) {
          console.log('Scanned content:', result)
          if (result.startsWith('/')) {
            router.push(result)
          } else {
            toast.error('Invalid QR code content')
            router.back()
          }
        }
      }, 100)
    }
  }

  if (hasCameraAccess === null) {
    // Loading state while checking permissions
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="animate-pulse">Checking camera permissions...</div>
      </div>
    )
  }

  if (!hasCameraAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Camera access required</h1>
        <p className="text-gray-600 mb-8">
          {cameraError === 'NotAllowedError' 
            ? 'Please enable camera permissions in your browser settings'
            : 'Camera not available or supported'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Scan QR Code</h1>
      <div className="max-w-2xl mx-auto rounded-xl overflow-hidden border-2 border-white/20 bg-black">
        <Scanner
          onResult={(result) => {
            if (result) {
              const text = result?.getText()
              if (text && text.trim().length > 0) {
                handleScanResult(text.trim())
              }
            }
          }}
          onError={(error) => {
            console.error('Scanner error:', error)
            // Only set access to false if it's a permission error
            if (error.name === 'NotAllowedError') {
              setHasCameraAccess(false)
            }
          }}
          options={{
            constraints: {
              facingMode: 'environment',
            }
          }}
          styles={{
            container: {
              width: '100%',
              height: '60vh',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: 'black'
            },
            video: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            },
            finderBorder: {
              borderColor: 'rgba(255, 165, 0, 0.5)'
            }
          }}
        />
      </div>
      
      {hasCameraAccess && !scanResult && (
        <div className="text-center mt-4 text-gray-400">
          <p>Point your camera at a QR code</p>
          <div className="mt-2 animate-pulse">Initializing camera...</div>
        </div>
      )}
    </div>
  )
} 