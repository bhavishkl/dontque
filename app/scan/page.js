'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from "@nextui-org/react"

export default function QRScannerPage() {
  const router = useRouter()
  const [hasCameraAccess, setHasCameraAccess] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
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
      // Stop scanning when component unmounts
      if (scannerRef.current) {
        scannerRef.current.stop().catch(error => {
          console.error("Failed to stop scanner", error);
        });
      }
    }
  }, [])

  useEffect(() => {
    // Initialize QR scanner when camera access is confirmed
    if (hasCameraAccess && containerRef.current && !isScanning) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      ).catch((err) => {
        console.error("Failed to start scanner", err);
        setIsScanning(false);
        setCameraError("Failed to start scanner: " + err.message);
        setHasCameraAccess(false);
      });
    }
  }, [hasCameraAccess]);

  const onScanSuccess = (decodedText) => {
    console.log(`Scan result: ${decodedText}`);
    
    try {
      // Navigate based on URL type
      if (decodedText.startsWith('http')) {
        window.open(decodedText, '_blank');
      } else {
        router.push(decodedText);
      }
      
      toast.success('QR code scanned successfully');
      
      // Stop scanning after successful scan
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => {
          console.error("Failed to stop scanner", err);
        });
      }
    } catch (error) {
      console.error('Error handling scan result:', error);
      toast.error('Failed to process QR code');
    }
  };

  const onScanFailure = (error) => {
    // Don't log scan failures - these happen constantly when no QR code is present
    // and would flood the console
  };

  if (hasCameraAccess === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="animate-pulse">Checking camera permissions...</div>
      </div>
    );
  }

  if (!hasCameraAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Camera access required</h1>
        <p className="text-gray-600 mb-8">
          {cameraError === 'NotAllowedError' 
            ? 'Please enable camera permissions in your browser settings'
            : cameraError || 'Camera not available or supported'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Scan QR Code</h1>
      <div className="max-w-md mx-auto">
        <div 
          id="qr-reader" 
          ref={containerRef}
          className="overflow-hidden rounded-xl border-2 border-white/20"
          style={{ width: '100%', minHeight: '300px' }}
        ></div>
      </div>
      
      <div className="text-center mt-4 text-gray-400 space-y-4">
        <p>Point your camera at a QR code</p>
        <Button
          onClick={() => router.push('/user/home')}
          className="mx-auto bg-gray-100 hover:bg-gray-200 text-gray-800"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
} 