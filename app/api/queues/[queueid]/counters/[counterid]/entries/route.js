import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../auth/[...nextauth]/route"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: entries, error } = await supabase
      .from('queue_entries')
      .select(`
        *,
        user_profile:user_id (
          name
        ),
        queue_entry_services (
          service_id,
          services (
            name,
            estimated_time
          )
        )
      `)
      .eq('counter_id', params.counterid)
      .eq('status', 'waiting')
      .order('join_time', { ascending: true })

    if (error) throw error

    return NextResponse.json({ entries })

  } catch (error) {
    console.error('Error fetching counter entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch counter entries' },
      { status: 500 }
    )
  }
} 