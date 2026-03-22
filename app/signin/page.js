'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Header from '../components/LandingPageCompo/Header'
import { Spinner } from '@nextui-org/react'
import { NavigationIcons } from '../utils/navigationIcons'

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
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header showNavLinks={false} />

      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md rounded-[2.5rem] bg-[#f5f7fa] p-8 shadow-[12px_12px_24px_rgba(0,0,0,0.06),-12px_-12px_24px_rgba(255,255,255,0.8),inset_-4px_-4px_8px_rgba(0,0,0,0.02),inset_4px_4px_8px_rgba(255,255,255,0.6)] border border-white/60 flex flex-col items-center relative mt-10">
          
          <div className="flex items-center justify-center w-20 h-20 rounded-[1.75rem] bg-[#f0f4f8] shadow-[6px_6px_12px_rgba(0,0,0,0.06),-6px_-6px_12px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.02),inset_2px_2px_4px_rgba(255,255,255,0.6)] mb-6 absolute -top-10 border border-white/80">
             <NavigationIcons.ProfileFilled className="w-10 h-10 text-gray-700 drop-shadow-sm" />
          </div>

          <div className="mt-10 flex flex-col items-center w-full">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-sm">Welcome Back</h1>
            <p className="mt-3 text-sm text-gray-500 text-center px-4 font-medium">
              Enter your phone number to receive a one-time password and securely sign in.
            </p>

            <div className="mt-10 w-full space-y-6">
              <div>
                <label htmlFor="phone" className="mb-3 block text-sm font-bold text-gray-600 pl-2 drop-shadow-sm">
                  Phone Number
                </label>
                <div className="flex items-center overflow-hidden rounded-2xl bg-[#e8ecf1] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] transition-all focus-within:ring-2 focus-within:ring-gray-300 focus-within:bg-[#eef2f6]">
                  <span className="pl-5 pr-3 text-gray-500 font-bold text-lg">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full bg-transparent px-2 py-4 text-gray-800 outline-none placeholder:text-gray-400 font-bold text-lg"
                    disabled={isLoading || otpSent}
                  />
                </div>
              </div>

              {otpSent && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <label htmlFor="otp" className="mb-3 block text-sm font-bold text-gray-600 pl-2 drop-shadow-sm">
                    Verification Code
                  </label>
                  <div className="flex items-center rounded-2xl bg-[#e8ecf1] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] transition-all focus-within:ring-2 focus-within:ring-gray-300 focus-within:bg-[#eef2f6]">
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the 6-digit code"
                      className="w-full bg-transparent px-4 py-4 text-gray-800 outline-none placeholder:text-gray-400 font-bold text-center tracking-[0.5em] text-xl"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={otpSent ? verifyOtp : sendOtp}
                disabled={isLoading}
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-4 text-white font-bold text-lg transition-all hover:bg-gray-800 active:scale-[0.97] disabled:opacity-70 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-4px_-4px_10px_rgba(255,255,255,0.4),inset_2px_2px_4px_rgba(255,255,255,0.15)]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Spinner size="sm" color="current" />
                    {otpSent ? 'Verifying...' : 'Sending...'}
                  </span>
                ) : otpSent ? (
                  'Verify & Continue'
                ) : (
                  'Send Code'
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
                  className="w-full text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors pt-2 pb-1"
                >
                  Change phone number?
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
