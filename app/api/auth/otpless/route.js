import { supabase } from '@/app/lib/supabase'

export async function POST(request) {
  try {
    const { otplessUser, userName } = await request.json()
    const { userId, identities, deviceInfo, network, timestamp, token } = otplessUser
    const identity = identities[0]
    const { identityType, identityValue, channel, methods, verified } = identity
    const city = network.ipLocation?.city?.name || null

    // First, check if the user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profile')
      .select('user_id, name')
      .eq(identityType === 'EMAIL' ? 'email' : 'phone_number', identityValue)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    let profileData
    if (existingUser) {
      // Update existing user, but don't change the name
      const { data, error: updateError } = await supabase
        .from('user_profile')
        .update({
          country_code: otplessUser.country_code,
          otpless_token: token,
          city: city
        })
        .eq('user_id', existingUser.user_id)
        .select()
        .single()

      if (updateError) throw updateError
      profileData = data
      profileData.name = existingUser.name // Preserve the existing name
    } else {
      // Insert new user
      const { data, error: insertError } = await supabase
        .from('user_profile')
        .insert({
          user_id: userId,
          email: identityType === 'EMAIL' ? identityValue : null,
          phone_number: identityType === 'MOBILE' ? identityValue : null,
          name: userName || (identityType === 'EMAIL' ? identityValue.split('@')[0] : ''),
          country_code: otplessUser.country_code,
          otpless_token: token,
          city: city
        })
        .select()
        .single()

      if (insertError) throw insertError
      profileData = data
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
      .single()

    if (infoError) throw infoError

    return Response.json({ success: true, data: profileData })
  } catch (error) {
    console.error('Error in OTPless route handler:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
} 