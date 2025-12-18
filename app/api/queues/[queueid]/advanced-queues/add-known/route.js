import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from "@/lib/mock-auth"
import { authOptions } from "../../../../auth/[...nextauth]/route"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request, { params }) {
  const requestId = crypto.randomUUID()
  
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { shortId, services, counterId } = await request.json()

    // Validate input
    if (!shortId || !services?.length || !counterId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists and get their ID
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('user_id, name')
      .eq('user_short_id', shortId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already in any queue
    const { data: existingEntry, error: existingError } = await supabase
      .from('queue_entries')
      .select('entry_id')
      .eq('user_id', userData.user_id)
      .eq('status', 'waiting')
      .single()

    if (existingEntry) {
      return NextResponse.json(
        { error: 'User is already in a queue' },
        { status: 400 }
      )
    }

    // Create queue entry
    const { data: entry, error: entryError } = await supabase
      .from('queue_entries')
      .insert({
        queue_id: params.queueid,
        user_id: userData.user_id,
        counter_id: counterId,
        status: 'waiting',
        join_time: new Date().toISOString(),
        added_by: session.user.id,
        entry_type: 'advanced' // Add this to specify it's an advanced entry
      })
      .select()
      .single()

    if (entryError) {
      console.error('Entry Error:', entryError)
      throw entryError
    }

    // Add services for the entry - remove queue_id as it's not in the schema
    const serviceEntries = services.map(serviceId => ({
      entry_id: entry.entry_id,
      service_id: serviceId
    }))

    const { error: servicesError } = await supabase
      .from('queue_entry_services')
      .insert(serviceEntries)

    if (servicesError) {
      console.error('Services Error:', servicesError)
      // If services insertion fails, delete the queue entry
      await supabase
        .from('queue_entries')
        .delete()
        .eq('entry_id', entry.entry_id)
      throw servicesError
    }

    // Update known_users in user_profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profile')
      .select('known_users')
      .eq('user_id', session.user.id)
      .single()

    if (!profileError && profileData) {
      const knownUsers = profileData.known_users || []
      const updatedKnownUsers = [...knownUsers, { shortId, name: userData.name }]

      await supabase
        .from('user_profile')
        .update({ known_users: updatedKnownUsers })
        .eq('user_id', session.user.id)
    }

    return NextResponse.json({
      message: 'Successfully added known user to queue',
      entry,
      name: userData.name
    })

  } catch (error) {
    console.error(JSON.stringify({
      requestId,
      event: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }))

    return NextResponse.json(
      { error: 'Failed to add known user to queue' },
      { status: 500 }
    )
  }
} 