import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request, { params }) {
  try {
    const { data: counters, error } = await supabase
      .from('counters')
      .select(`
        counter_id,
        name,
        counter_type,
        status,
        service_start_time,
        services (
          service_id,
          name,
          description,
          estimated_time,
          price,
          status
        )
      `)
      .eq('queue_id', params.queueid)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ counters })
  } catch (error) {
    console.error('Error fetching counters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch counters' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { counterId, status, serviceStartTime } = await request.json()

    const updates = {}
    if (status !== undefined) updates.status = status
    if (serviceStartTime !== undefined) updates.service_start_time = serviceStartTime

    const { data, error } = await supabase
      .from('counters')
      .update(updates)
      .eq('counter_id', counterId)
      .eq('queue_id', params.queueid)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating counter:', error)
    return NextResponse.json(
      { error: 'Failed to update counter' },
      { status: 500 }
    )
  }
} 