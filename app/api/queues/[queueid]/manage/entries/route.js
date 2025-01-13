import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, entryId } = await request.json()
    const { queueid } = params

    if (!action || !entryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch queue entry and queue data in parallel
    const [entryResult, queueResult] = await Promise.all([
      supabase
        .from('queue_entries')
        .select('*')
        .match({ queue_id: queueid, entry_id: entryId })
        .single(),
      supabase
        .from('queues')
        .select('current_queue, total_served, est_time_to_serve')
        .eq('queue_id', queueid)
        .single()
    ])

    if (entryResult.error) {
      console.error('Entry fetch error:', entryResult.error)
      throw new Error('Failed to fetch entry data')
    }
    if (queueResult.error) {
      console.error('Queue fetch error:', queueResult.error)
      throw new Error('Failed to fetch queue data')
    }

    const entryData = entryResult.data
    const queueData = queueResult.data

    // Calculate metrics
    const actualWaitTime = Math.floor((new Date() - new Date(entryData.join_time)) / 60000)
    const newTotalServed = action === 'serve' ? queueData.total_served + 1 : queueData.total_served
    const now = new Date()

    try {
      // Delete entry services first
      const { error: servicesDeleteError } = await supabase
        .from('queue_entry_services')
        .delete()
        .eq('entry_id', entryId)

      if (servicesDeleteError) {
        console.error('Services delete error:', servicesDeleteError)
        throw new Error('Failed to delete entry services')
      }

      // Then perform remaining operations
      const [archiveResult, deleteResult, updateResult] = await Promise.all([
        // Archive entry
        supabase
          .from('queue_entries_archive')
          .insert({
            queue_id: entryData.queue_id,
            user_id: entryData.user_id,
            status: action === 'serve' ? 'served' : 'no_show',
            wait_time: entryData.estimated_wait_time,
            actual_wait_time: actualWaitTime,
            join_time: entryData.join_time,
            leave_time: now.toISOString()
          }),
        // Delete entry
        supabase
          .from('queue_entries')
          .delete()
          .match({ queue_id: queueid, entry_id: entryId }),
        // Update queue
        supabase
          .from('queues')
          .update({ 
            total_served: newTotalServed,
            current_queue: queueData.current_queue - 1,
            next_serve_at: action === 'serve' ? now.toISOString() : queueData.next_serve_at
          })
          .eq('queue_id', queueid)
          .select()
          .single()
      ])

      if (archiveResult.error) {
        console.error('Archive error:', archiveResult.error)
        throw new Error('Failed to archive entry')
      }
      if (deleteResult.error) {
        console.error('Delete error:', deleteResult.error)
        throw new Error('Failed to delete entry')
      }
      if (updateResult.error) {
        console.error('Update error:', updateResult.error)
        throw new Error('Failed to update queue')
      }

      return NextResponse.json({
        message: `Customer ${action === 'serve' ? 'served' : 'marked as no-show'} successfully`,
        queue: updateResult.data
      })

    } catch (operationError) {
      console.error('Operation error details:', operationError)
      throw operationError
    }

  } catch (error) {
    console.error('Error processing entry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process entry' },
      { status: 500 }
    )
  }
} 