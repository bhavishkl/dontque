import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function GET(request, { params }) {
  const { shortId } = params

  try {
    const { data, error } = await supabase
      .from('queues')
      .select('queue_id')
      .eq('short_id', shortId)
      .single()

    if (error) throw error

    if (data) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}