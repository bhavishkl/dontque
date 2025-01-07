import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import { PerformanceMonitor } from '@/utils/performance'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request, { params }) {
  const perf = new PerformanceMonitor('advanced_queue_join')
  let session

  try {
    session = await getServerSession(authOptions)
    perf.markStep('auth')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { counter_id, services } = await request.json()
    const { queueid } = params

    if (!counter_id || !services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Validate counter and services
    const { data: validServices, error: serviceError } = await supabase
      .from('services')
      .select('service_id, estimated_time')
      .in('service_id', services)
      .eq('counter_id', counter_id)
      .eq('status', 'active')
    
    if (serviceError || validServices.length !== services.length) {
      return NextResponse.json({ error: 'Invalid services selected' }, { status: 400 })
    }

    // Start transaction
    const { data: newEntry, error: entryError } = await supabase
      .from('queue_entries')
      .insert({
        queue_id: queueid,
        user_id: session.user.id,
        counter_id: counter_id,
        status: 'waiting',
        entry_type: 'advanced',
        position: 0, // Will be updated in the next step
      })
      .select()
      .single()

    if (entryError) throw entryError

    // Insert service selections
    const serviceEntries = services.map(service_id => ({
      entry_id: newEntry.entry_id,
      service_id: service_id,
    }))

    const { error: serviceInsertError } = await supabase
      .from('queue_entry_services')
      .insert(serviceEntries)

    if (serviceInsertError) throw serviceInsertError

    // Fetch complete entry data with services for response
    const { data: finalEntry, error: finalError } = await supabase
      .from('queue_entries')
      .select(`
        *,
        queue_entry_services (
          service_id,
          services (
            name,
            estimated_time,
            price
          )
        )
      `)
      .eq('entry_id', newEntry.entry_id)
      .single()

    if (finalError) throw finalError

    return NextResponse.json({
      message: 'Successfully joined the queue',
      entry: finalEntry
    })

  } catch (error) {
    console.error('Error joining advanced queue:', error)
    return NextResponse.json(
      { error: 'Failed to join queue' },
      { status: 500 }
    )
  }
}