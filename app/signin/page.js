'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Script from 'next/script'
import { signIn } from 'next-auth/react'

export default function SignIn() {
  const router = useRouter()

  const handleOTPlessSuccess = async (response) => {
    console.log('OTPless success:', response);
    const { otplessUser } = response;
    const { userId, idToken } = otplessUser;

    try {
      const result = await signIn("credentials", {
        userId,
        idToken,
        redirect: false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Save user data
      await saveUserData(otplessUser, '');

      // Redirect to home page
      router.push('/home');
    } catch (error) {
      console.error('Error signing in:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const saveUserData = async (otplessUser, userName) => {
    const { userId, identities, deviceInfo, network, timestamp } = otplessUser;
    const identity = identities[0];
    const { identityType, identityValue, channel, methods, verified } = identity;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profile')
        .upsert({
          user_id: userId,
          email: identityType === 'EMAIL' ? identityValue : null,
          phone_number: identityType === 'MOBILE' ? identityValue : null,
          name: userName || identityValue.split('@')[0], // Use email username if no name provided
          image: `https://api.dicebear.com/6.x/initials/svg?seed=${identityValue}`, // Generate avatar
          country_code: otplessUser.country_code
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (profileError) throw profileError;

      const { error: infoError } = await supabase
        .from('user_info')
        .upsert({
          user_id: userId,
          identity_type: identityType,
          identity_value: identityValue,
          channel,
          methods,
          verified,
          verified_at: new Date(timestamp).toISOString(),
          is_company_email: identityType === 'EMAIL' ? identityValue.includes('@company.com') : false,
          ip_address: network.ip,
          timezone: network.timezone,
          user_agent: deviceInfo.userAgent,
          platform: deviceInfo.platform,
          vendor: deviceInfo.vendor,
          browser: deviceInfo.browser,
          connection: deviceInfo.connection,
          id_token: otplessUser.idToken,
          auth_time: new Date(timestamp).toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (infoError) throw infoError;

      console.log('User data saved successfully');
      
      // Update the session with the new user data
      await signIn("credentials", {
        userId,
        idToken: otplessUser.idToken,
        name: profileData.name,
        image: profileData.image,
        redirect: false,
      });

      router.push('/home');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Script
        id="otpless-sdk"
        src="https://otpless.com/v2/auth.js"
        data-appid="F2MITR92JXCX7PJTCMPP"
        onLoad={() => {
          window.otpless = (otplessUser) => {
            handleOTPlessSuccess({ otplessUser });
          };
        }}
      />
      <div id="otpless-login-page"></div>
    </div>
  );
}