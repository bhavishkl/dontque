import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request, { params }) {
  try {
    const { queueid } = params

    // Fetch counters with their services and staff details
    const { data: counters, error: counterError } = await supabase
      .from('counters')
      .select(`
        counter_id,
        name,
        counter_type,
        status,
        services (
          service_id,
          name,
          description,
          estimated_time,
          price,
          status
        ),
        staff_details (
          staff_id,
          name,
          image_url,
          experience_years,
          specialization,
          bio,
          rating,
          review_count
        )
      `)
      .eq('queue_id', queueid)
      .eq('status', 'active')

    if (counterError) {
      throw counterError
    }

    // Format the response
    const formattedCounters = counters.map(counter => ({
      id: counter.counter_id,
      name: counter.name,
      type: counter.counter_type,
      status: counter.status,
      services: (counter.services || []).map(service => ({
        id: service.service_id,
        name: service.name,
        description: service.description,
        estimatedTime: service.estimated_time,
        price: service.price ? `$${service.price}` : null,
        status: service.status
      })),
      ...(counter.counter_type === 'staff' && counter.staff_details?.[0] ? {
        staffDetails: {
          id: counter.staff_details[0].staff_id,
          name: counter.staff_details[0].name,
          image: counter.staff_details[0].image_url,
          experience: counter.staff_details[0].experience_years,
          specialization: counter.staff_details[0].specialization,
          bio: counter.staff_details[0].bio,
          rating: counter.staff_details[0].rating,
          reviewCount: counter.staff_details[0].review_count
        }
      } : {})
    }))

    return NextResponse.json(formattedCounters)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch counters' },
      { status: 500 }
    )
  }
} 