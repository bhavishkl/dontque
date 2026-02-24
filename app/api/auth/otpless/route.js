import { supabase } from '@/app/lib/supabase'
import twilio from 'twilio'
import { randomUUID } from 'crypto'

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

const twilioClient = twilioAccountSid && twilioAuthToken
  ? twilio(twilioAccountSid, twilioAuthToken)
  : null

function normalizePhoneNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return null
  }

  let normalized = rawPhone.replace(/[\s()-]/g, '')
  if (!normalized.startsWith('+')) {
    normalized = `+${normalized}`
  }

  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    return null
  }

  return normalized
}

async function sendOtp(phoneNumber) {
  if (!twilioClient || !twilioVerifyServiceSid) {
    throw new Error('Twilio is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.')
  }

  const verification = await twilioClient.verify.v2
    .services(twilioVerifyServiceSid)
    .verifications.create({ to: phoneNumber, channel: 'sms' })

  if (verification.status !== 'pending') {
    throw new Error('Failed to send OTP. Please try again.')
  }
}

async function verifyOtp(phoneNumber, otp) {
  if (!twilioClient || !twilioVerifyServiceSid) {
    throw new Error('Twilio is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.')
  }

  const check = await twilioClient.verify.v2
    .services(twilioVerifyServiceSid)
    .verificationChecks.create({ to: phoneNumber, code: otp })

  if (check.status !== 'approved') {
    throw new Error('Invalid or expired OTP.')
  }

  return check
}

async function upsertUser(phoneNumber) {
  let profileData
  const fallbackUserId = randomUUID()

  const { data: existingUser, error: fetchError } = await supabase
    .from('user_profile')
    .select('*')
    .eq('phone_number', phoneNumber)
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError
  }

  if (existingUser) {
    const { data, error: updateError } = await supabase
      .from('user_profile')
      .update({ updated_at: new Date().toISOString() })
      .eq('user_id', existingUser.user_id)
      .select()
      .single()

    if (updateError) throw updateError
    profileData = data
  } else {
    const { data, error: insertError } = await supabase
      .from('user_profile')
      .insert({
        user_id: fallbackUserId,
        phone_number: phoneNumber,
        name: `User ${phoneNumber.slice(-4)}`,
        country_code: null,
        otpless_token: null
      })
      .select()
      .single()

    if (insertError) throw insertError
    profileData = data
  }

  const { error: infoError } = await supabase
    .from('user_info')
    .upsert({
      user_id: profileData.user_id,
      identity_type: 'MOBILE',
      identity_value: phoneNumber,
      channel: 'sms',
      methods: ['otp'],
      verified: true,
      verified_at: new Date().toISOString(),
      is_company_email: false,
      auth_time: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (infoError) throw infoError

  return profileData
}

export async function POST(request) {
  try {
    const { action, phoneNumber: rawPhoneNumber, otp } = await request.json()
    const phoneNumber = normalizePhoneNumber(rawPhoneNumber)

    if (!phoneNumber) {
      return Response.json({ success: false, error: 'Invalid phone number format. Use E.164, e.g. +15551234567' }, { status: 400 })
    }

    if (action === 'send_otp') {
      await sendOtp(phoneNumber)
      return Response.json({ success: true })
    }

    if (action === 'verify_otp') {
      if (!otp || typeof otp !== 'string') {
        return Response.json({ success: false, error: 'OTP is required.' }, { status: 400 })
      }

      const verificationCheck = await verifyOtp(phoneNumber, otp)
      const profileData = await upsertUser(phoneNumber)

      return Response.json({
        success: true,
        data: {
          userId: profileData.user_id,
          idToken: verificationCheck.sid,
          phoneNumber: profileData.phone_number
        }
      })
    }

    return Response.json({ success: false, error: 'Invalid action. Use send_otp or verify_otp.' }, { status: 400 })
  } catch (error) {
    console.error('Error in auth route handler:', error)
    return Response.json({ success: false, error: error.message || 'Authentication failed.' }, { status: 500 })
  }
}
