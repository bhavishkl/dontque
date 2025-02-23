import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request, { params }) {
  try {
    const { queueId } = params

    // Fetch queue data from the "queues" table
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('*')
      .eq('queue_id', queueId)
      .single()

    if (queueError) {
      console.error('Error fetching queue data:', queueError)
      return NextResponse.json({ error: queueError.message }, { status: 500 })
    }

    // Fetch customers in the queue with their user profile data
    const { data: customers, error: customersError } = await supabase
      .from('queue_entries')
      .select(`
        *,
        user_profile:user_id (
          user_id,
          name,
          email
        )
      `)
      .eq('queue_id', queueId)
      .order('position', { ascending: true })

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      return NextResponse.json({ error: customersError.message }, { status: 500 })
    }

    // Format join_time for display
    const formattedCustomers = customers.map(customer => ({
      ...customer,
      formattedJoinTime: new Date(customer.join_time).toLocaleTimeString()
    }))

    // Compute analytics
    const now = new Date()
    const waitTimes = formattedCustomers.map(customer => (now - new Date(customer.join_time)) / 60000)
    const currentAvgWaitTime =
      waitTimes.length > 0 ? parseFloat((waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length).toFixed(1)) : 0
    const longestWait = waitTimes.length > 0 ? parseFloat(Math.max(...waitTimes).toFixed(1)) : 0

    // Get served count in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: servedData, error: servedError } = await supabase
      .from('queue_entries')
      .select('entry_id')
      .eq('queue_id', queueId)
      .eq('status', 'served')
      .gt('updated_at', oneHourAgo)
    const servedLastHour = servedData ? servedData.length : 0

    // Fetch statuses (to calculate no-show rate)
    const { data: statusesData, error: statusesError } = await supabase
      .from('queue_entries')
      .select('status')
      .eq('queue_id', queueId)
      .in('status', ['served', 'no-show'])
    const totalCompleted = statusesData ? statusesData.length : 0
    const noShowCount = statusesData ? statusesData.filter(entry => entry.status === 'no-show').length : 0
    const noShowRate = totalCompleted > 0 ? Math.round((noShowCount / totalCompleted) * 100) : 0

    // Calculate queue efficiency based on the current service time versus the average wait time
    const currentServiceTime = queueData.est_time_to_serve
    let queueEfficiency = 100
    if (currentAvgWaitTime > 0 && currentServiceTime) {
      const rawEfficiency = (currentServiceTime / currentAvgWaitTime) * 100
      queueEfficiency = rawEfficiency > 100 ? 100 : Math.round(rawEfficiency)
    }

    // Determine if it's peak time (for example, between 11 AM and 2 PM)
    const currentHour = now.getHours()
    const isPeakTime = currentHour >= 11 && currentHour < 14

    const responsePayload = {
      queueData,
      customersInQueue: formattedCustomers,
      currentAvgWaitTime,
      servedLastHour,
      currentServiceTime,
      queueEfficiency,
      longestWait,
      noShowRate,
      isPeakTime
    }

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Unexpected error in management default route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  }
} 