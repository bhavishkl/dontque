'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Header from '../components/LandingPageCompo/Header'
import { Spinner } from '@nextui-org/react'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/user/home'

  useEffect(() => {
    if (session) {
      router.push(callbackUrl)
    }
  }, [session, router, callbackUrl])

  const fullPhoneNumber = `+91${phoneNumber}`

  const sendOtp = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/otpless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', phoneNumber: fullPhoneNumber })
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to send OTP')
      }

      setOtpSent(true)
      toast.success('OTP sent successfully.')
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast.error(error.message || 'Unable to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/otpless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', phoneNumber: fullPhoneNumber, otp })
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'OTP verification failed')
      }

      const signInResult = await signIn('credentials', {
        userId: result.data.userId,
        idToken: result.data.idToken,
        redirect: false,
        callbackUrl
      })

      if (signInResult?.error) {
        throw new Error(signInResult.error)
      }

      router.push(callbackUrl)
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error(error.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showNavLinks={false} />

      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your phone number to receive a one-time password.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 focus-within:border-black">
                <span className="border-r border-gray-300 bg-gray-100 px-3 py-2 text-gray-700">+91</span>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 outline-none"
                  disabled={isLoading || otpSent}
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label htmlFor="otp" className="mb-1 block text-sm font-medium text-gray-700">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the code"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-black"
                  disabled={isLoading}
                />
              </div>
            )}

            <button
              type="button"
              onClick={otpSent ? verifyOtp : sendOtp}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" color="current" />
                  Processing...
                </span>
              ) : otpSent ? (
                'Verify OTP'
              ) : (
                'Send OTP'
              )}
            </button>

            {otpSent && (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false)
                  setOtp('')
                }}
                disabled={isLoading}
                className="w-full text-sm text-gray-600 underline"
              >
                Change phone number
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
