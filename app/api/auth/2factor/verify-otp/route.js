import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function POST(request) {
    try {
        const { sessionId, otp, phoneNumber } = await request.json()

        if (!sessionId || !otp || !phoneNumber) {
            return NextResponse.json(
                { success: false, error: 'Session ID, OTP, and phone number are required' },
                { status: 400 }
            )
        }

        const apiKey = process.env.TWOFACTOR_API_KEY

        if (!apiKey) {
            console.error('2Factor API key not configured')
            return NextResponse.json(
                { success: false, error: 'SMS service not configured' },
                { status: 500 }
            )
        }

        // Verify OTP using 2Factor API
        const response = await fetch(
            `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`,
            {
                method: 'GET',
            }
        )

        const data = await response.json()

        if (data.Status === 'Success' && data.Details === 'OTP Matched') {
            // OTP verified successfully, now create/update user in Supabase
            const userId = `2factor_${phoneNumber.replace(/\+/g, '')}`

            // Check if user exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('user_profile')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError
            }

            let profileData

            if (existingUser) {
                // Update existing user
                const { data, error: updateError } = await supabase
                    .from('user_profile')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('user_id', userId)
                    .select()
                    .single()

                if (updateError) throw updateError
                profileData = data
            } else {
                // Create new user
                const { data, error: insertError } = await supabase
                    .from('user_profile')
                    .insert({
                        user_id: userId,
                        phone_number: phoneNumber,
                        name: phoneNumber, // Default name to phone number
                    })
                    .select()
                    .single()

                if (insertError) throw insertError
                profileData = data
            }

            // Update user_info table
            const { error: infoError } = await supabase
                .from('user_info')
                .upsert({
                    user_id: profileData.user_id,
                    identity_type: 'MOBILE',
                    identity_value: phoneNumber,
                    channel: 'SMS',
                    methods: ['OTP'],
                    verified: true,
                    verified_at: new Date().toISOString(),
                    auth_time: new Date().toISOString()
                }, { onConflict: 'user_id' })
                .select()
                .single()

            if (infoError) throw infoError

            return NextResponse.json({
                success: true,
                user: {
                    userId: profileData.user_id,
                    phoneNumber: profileData.phone_number,
                    name: profileData.name
                }
            })
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid OTP' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Error verifying OTP:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to verify OTP' },
            { status: 500 }
        )
    }
}
