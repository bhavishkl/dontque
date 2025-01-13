import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { supabase } from '../../../lib/supabase'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('queues')
      .select(`
        queue_id,
        name,
        current_queue,
        avg_wait_time,
        total_served,
        status,
        service_type
      `)
      .eq('owner_id', session.user.id)

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching queues:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}