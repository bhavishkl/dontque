import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const { phoneNumber } = await request.json()

        if (!phoneNumber) {
            return NextResponse.json(
                { success: false, error: 'Phone number is required' },
                { status: 400 }
            )
        }

        const apiKey = process.env.TWOFACTOR_API_KEY
        const templateId = process.env.TWOFACTOR_TEMPLATE_ID

        if (!apiKey || !templateId) {
            console.error('2Factor API credentials not configured')
            return NextResponse.json(
                { success: false, error: 'SMS service not configured' },
                { status: 500 }
            )
        }

        // Send OTP using 2Factor API
        const response = await fetch(
            `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/AUTOGEN/${templateId}`,
            {
                method: 'GET',
            }
        )

        const data = await response.json()

        if (data.Status === 'Success') {
            return NextResponse.json({
                success: true,
                sessionId: data.Details,
                message: 'OTP sent successfully'
            })
        } else {
            console.error('2Factor API error:', data)
            return NextResponse.json(
                { success: false, error: data.Details || 'Failed to send OTP' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Error sending OTP:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to send OTP' },
            { status: 500 }
        )
    }
}
