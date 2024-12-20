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
    const { data: savedQueues, error } = await supabase
      .from('saved_queues')
      .select(`
        queue_id,
        queue:queues(
          queue_id,
          name,
          description,
          current_queue,
          estimated_wait_time,
          short_id
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const formattedData = savedQueues.map(item => ({
      ...item.queue,
      isSaved: true
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching saved queues:', error)
    return NextResponse.json({ error: 'Failed to fetch saved queues' }, { status: 500 })
  }
} 