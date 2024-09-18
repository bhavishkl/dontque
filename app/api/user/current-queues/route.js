import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function GET(req) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('queue_entries')
      .select(`
        *,
        queue:queues(*)
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'waiting')
      .order('join_time', { ascending: true })

    if (error) throw error

    const formattedData = data.map(entry => ({
      id: entry.queue.queue_id,
      name: entry.queue.name,
      position: entry.position,
      estimatedWaitTime: entry.estimated_wait_time
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching current queues:', error)
    return NextResponse.json({ error: 'Failed to fetch current queues' }, { status: 500 })
  }
}