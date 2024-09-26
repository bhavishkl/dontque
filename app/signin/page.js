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
      router.push('/user/home');
    } catch (error) {
      console.error('Error signing in:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const saveUserData = async (otplessUser, userName) => {
    const { userId, identities, deviceInfo, network, timestamp, token } = otplessUser;
    const identity = identities[0];
    const { identityType, identityValue, channel, methods, verified } = identity;
    const city = network.ipLocation?.city?.name || null;

    try {
      // First, check if the user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('user_profile')
        .select('user_id, name')
        .eq(identityType === 'EMAIL' ? 'email' : 'phone_number', identityValue)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let profileData;
      if (existingUser) {
        // Update existing user, but don't change the name
        const { data, error: updateError } = await supabase
          .from('user_profile')
          .update({
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${identityValue}`,
            country_code: otplessUser.country_code,
            otpless_token: token,
            city: city
          })
          .eq('user_id', existingUser.user_id)
          .select()
          .single();

        if (updateError) throw updateError;
        profileData = data;
        profileData.name = existingUser.name; // Preserve the existing name
      } else {
        // Insert new user
        const { data, error: insertError } = await supabase
          .from('user_profile')
          .insert({
            user_id: userId,
            email: identityType === 'EMAIL' ? identityValue : null,
            phone_number: identityType === 'MOBILE' ? identityValue : null,
            name: userName || (identityType === 'EMAIL' ? identityValue.split('@')[0] : ''),
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${identityValue}`,
            country_code: otplessUser.country_code,
            otpless_token: token,
            city: city
          })
          .select()
          .single();

        if (insertError) throw insertError;
        profileData = data;
      }

      // Update user_info
      const { error: infoError } = await supabase
        .from('user_info')
        .upsert({
          user_id: profileData.user_id,
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
          auth_time: new Date(timestamp).toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (infoError) throw infoError;

      console.log('User data saved successfully');
      
      // Update the session with the new user data
      await signIn("credentials", {
        userId: profileData.user_id,
        name: profileData.name,
        image: profileData.image,
        redirect: false,
      });

      router.push('/user/home');
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