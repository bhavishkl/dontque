import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { supabase } from '../../../lib/supabase'
import { PerformanceMonitor } from '../../../utils/performance'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const monitor = new PerformanceMonitor('GET /api/queues/owner')
  
  try {
    const session = await getServerSession(authOptions)
    monitor.markStep('auth')

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('queue_dashboard_stats')
      .select(`
        queue_id,
        name,
        status,
        service_type,
        current_queue,
        total_served_today,
        seven_day_avg_wait_time,
        avg_rating
      `)
      .eq('owner_id', session.user.id)
    monitor.markStep('fetch_stats')

    if (error) {
      throw error
    }

    // Transform the data to match existing frontend expectations
    const transformedData = data.map(queue => ({
      ...queue,
      total_served: queue.total_served_today
    }))
    monitor.markStep('transform_data')

    monitor.end()
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching queues:', error)
    monitor.end()
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}