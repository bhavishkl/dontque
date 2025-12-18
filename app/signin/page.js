'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { signIn, useSession } from '@/lib/mock-auth'
import { toast } from 'sonner'
import Header from '../components/LandingPageCompo/Header'
import { Spinner } from '@nextui-org/react'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const callbackUrl = searchParams.get('callbackUrl') || '/user/home'

  useEffect(() => {
    if (session) {
      router.push(callbackUrl)
    }
  }, [session, router, callbackUrl])

  const handleOTPlessSuccess = async (response) => {
    setIsLoading(true)
    console.log('OTPless success:', response);
    const { otplessUser } = response;
    const { userId, idToken } = otplessUser;

    try {
      // Save user data using the API route
      const res = await fetch('/api/auth/otpless', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otplessUser, userName: '' }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      // Sign in with credentials and handle redirect
      const signInResult = await signIn("credentials", {
        userId,
        idToken,
        redirect: false,
        callbackUrl
      });

      if (signInResult.error) {
        throw new Error(signInResult.error);
      }

      console.log('Redirecting to:', callbackUrl);
      router.push(callbackUrl);
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('An error occurred. Please try again.');
      setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showNavLinks={false} />
      
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Script
          id="otpless-sdk"
          src="https://otpless.com/v2/auth.js"
          data-appid="95K6ZOU4OBTASN3YCALX"
          onLoad={() => {
            window.otpless = (otplessUser) => {
              handleOTPlessSuccess({ otplessUser });
            };
          }}
        />
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-lg text-gray-600">Signing you in...</p>
          </div>
        ) : (
          <div id="otpless-login-page"></div>
        )}
      </div>
    </div>
  );
}