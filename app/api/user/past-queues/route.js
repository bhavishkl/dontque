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
    const { data: archiveEntries, error: archiveError } = await supabase
      .from('queue_entries_archive')
      .select('*')
      .eq('user_id', session.user.id)
      .order('join_time', { ascending: false })
      .limit(10)

    if (archiveError) throw archiveError

    // Fetch queue names separately
    const queueIds = [...new Set(archiveEntries.map(entry => entry.queue_id))]
    const { data: queuesData, error: queueError } = await supabase
      .from('queues')
      .select('queue_id, name, category, opening_time, closing_time')
      .in('queue_id', queueIds)

    if (queueError) throw queueError

    const queueMap = Object.fromEntries(queuesData.map(q => [q.queue_id, q]))

    const formattedData = archiveEntries.map(entry => {
      const q = queueMap[entry.queue_id] || {};
      return {
        id: entry.queue_id,
        name: q.name || 'Unknown Queue',
        category: q.category,
        operating_hours: q.opening_time && q.closing_time ? `${q.opening_time} - ${q.closing_time}` : null,
        date: new Date(entry.join_time).toLocaleDateString(),
        waitTime: entry.actual_wait_time || entry.wait_time,
        rating: entry.rating || 0
      };
    })

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching past queues:', error)
    return NextResponse.json({ error: 'Failed to fetch past queues' }, { status: 500 })
  }
}