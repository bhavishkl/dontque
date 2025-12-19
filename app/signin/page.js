'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Header from '../components/LandingPageCompo/Header'
import { Spinner, Input, Button } from '@nextui-org/react'
import { useEffect } from 'react'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const callbackUrl = searchParams.get('callbackUrl') || '/user/home'

  useEffect(() => {
    if (session) {
      router.push(callbackUrl)
    }
  }, [session, router, callbackUrl])

  const handleSendOtp = async (e) => {
    e.preventDefault()

    if (!phoneNumber) {
      toast.error('Please enter your phone number')
      return
    }

    // Validate phone number (10 digits for India)
    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }

    setIsLoading(true)

    const fullPhoneNumber = `+91${phoneNumber}`

    try {
      const response = await fetch('/api/auth/2factor/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
      })

      const data = await response.json()

      if (data.success) {
        setSessionId(data.sessionId)
        setStep('otp')
        toast.success('OTP sent successfully!')
      } else {
        toast.error(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits')
      return
    }

    setIsLoading(true)

    try {
      const fullPhoneNumber = `+91${phoneNumber}`

      // Verify OTP
      const response = await fetch('/api/auth/2factor/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, otp, phoneNumber: fullPhoneNumber }),
      })

      const data = await response.json()

      if (data.success) {
        // Sign in with NextAuth
        const signInResult = await signIn('credentials', {
          userId: data.user.userId,
          phoneNumber: data.user.phoneNumber,
          redirect: false,
          callbackUrl,
        })

        if (signInResult.error) {
          throw new Error(signInResult.error)
        }

        toast.success('Signed in successfully!')
        router.push(callbackUrl)
      } else {
        toast.error(data.error || 'Invalid OTP')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setOtp('')
    await handleSendOtp({ preventDefault: () => { } })
  }

  const handleChangeNumber = () => {
    setStep('phone')
    setOtp('')
    setSessionId('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showNavLinks={false} />

      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'phone'
                ? 'Enter your phone number to receive an OTP'
                : 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Spinner size="lg" color="primary" />
              <p className="text-lg text-gray-600">
                {step === 'phone' ? 'Sending OTP...' : 'Verifying...'}
              </p>
            </div>
          ) : (
            <div className="bg-white py-8 px-6 shadow rounded-lg">
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">+91</span>
                      </div>
                    }
                    description="Enter your 10-digit mobile number"
                    isRequired
                    size="lg"
                  />
                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="w-full"
                  >
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      OTP sent to <span className="font-semibold">+91{phoneNumber}</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleChangeNumber}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      Change number
                    </button>
                  </div>

                  <Input
                    type="text"
                    label="Enter OTP"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    isRequired
                    size="lg"
                  />

                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    className="w-full"
                  >
                    Verify & Sign In
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}