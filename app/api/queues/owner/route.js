import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { supabase } from '../../../lib/supabase'
import { PerformanceMonitor } from '../../../../utils/performance'

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
        status,
        service_type,
        current_queue,
        total_served_today,
        avg_wait_time,
        avg_rating
      `)
      .eq('owner_id', session.user.id)
    monitor.markStep('fetch_stats')

    if (error) {
      throw error
    }

    const { data: queueNames, error: namesError } = await supabase
      .from('queues')
      .select('queue_id, name')
      .eq('owner_id', session.user.id)
    monitor.markStep('fetch_names')

    if (namesError) {
      throw namesError
    }

    const combinedData = data.map(queue => {
      const queueInfo = queueNames.find(q => q.queue_id === queue.queue_id)
      return {
        ...queue,
        name: queueInfo.name,
        total_served: queue.total_served_today
      }
    })
    monitor.markStep('combine_data')

    monitor.end()
    return NextResponse.json(combinedData)
  } catch (error) {
    console.error('Error fetching queues:', error)
    monitor.end()
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}