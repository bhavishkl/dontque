import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request, { params }) {
  const requestId = crypto.randomUUID()
  
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log(JSON.stringify({
        requestId,
        event: 'auth_error',
        timestamp: new Date().toISOString()
      }))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { queueid } = params

    const { data: userEntry, error: userEntryError } = await supabase
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
        ),
        counters!queue_entries_counter_id_fkey (
          service_start_time,
          next_serve_at,
          name,
          status
        )
      `)
      .eq('queue_id', queueid)
      .eq('user_id', session.user.id)
      .eq('status', 'waiting')
      .single()

    if (userEntryError && userEntryError.code !== 'PGRST116') {
      throw userEntryError
    }

    let position = null
    let totalEstimatedTime = 0

    if (userEntry?.counter_id) {
      const { data: entries, error: countError } = await supabase
        .from('queue_entries')
        .select(`
          join_time,
          queue_entry_services (
            services (
              estimated_time
            )
          )
        `)
        .eq('counter_id', userEntry.counter_id)
        .eq('status', 'waiting')
        .order('join_time', { ascending: true })

      if (countError) throw countError

      if (entries && entries.length > 0) {
        // Calculate position for display only
        position = entries.findIndex(entry => 
          entry.join_time === userEntry.join_time
        ) + 1;

        // Calculate total wait time from entries ahead including their selected services
        const entriesAhead = entries.slice(0, position - 1);
        totalEstimatedTime = entriesAhead.reduce((total, entry) => {
          const entryServicesTime = entry.queue_entry_services?.reduce((serviceTotal, service) => {
            return serviceTotal + (service.services?.estimated_time || 0);
          }, 0) || 0;
          return total + entryServicesTime;
        }, 0);

        // Add current user's service time to total
        const currentUserServiceTime = userEntry.queue_entry_services?.reduce((total, service) => {
          return total + (service.services?.estimated_time || 0);
        }, 0) || 0;
        
        totalEstimatedTime += currentUserServiceTime;
      }
    }

    return NextResponse.json({ 
      entry: {
        ...userEntry,
        position,
        totalEstimatedTime, // Include totalEstimatedTime in the entry object
        currentTime: new Date().toISOString(), // Add current server time
        expectedServeTime: userEntry?.counters?.next_serve_at // Include next_serve_at
      }
    })

  } catch (error) {
    console.error(JSON.stringify({
      requestId,
      event: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }))

    return NextResponse.json(
      { error: 'Failed to check queue entry' },
      { status: 500 }
    )
  }
} 