import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../auth/[...nextauth]/route"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function archiveQueueEntry(entryId, userId) {
  try {
    // Fetch the queue entry with services to be archived
    const { data: entryData, error: fetchError } = await supabase
      .from('queue_entries')
      .select(`
        *,
        queue_entry_services (
          service_id,
          services (
            estimated_time
          )
        )
      `)
      .eq('entry_id', entryId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching queue entry:', fetchError);
      return false;
    }

    if (!entryData) {
      console.error('No queue entry found to archive');
      return false;
    }

    // Calculate total service time
    const totalServiceTime = entryData.queue_entry_services?.reduce((total, service) => {
      return total + (service.services?.estimated_time || 0);
    }, 0) || 0;

    // Calculate actual wait time
    const actualWaitTime = Math.floor((new Date() - new Date(entryData.join_time)) / 60000);

    // Insert into queue_entries_archive
    const { error: insertError } = await supabase
      .from('queue_entries_archive')
      .insert({
        entry_id: entryData.entry_id,
        queue_id: entryData.queue_id,
        counter_id: entryData.counter_id,
        user_id: entryData.user_id,
        status: 'left',
        estimated_wait_time: totalServiceTime,
        actual_wait_time: actualWaitTime,
        join_time: entryData.join_time,
        leave_time: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting into archive:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in archiving queue entry:', error);
    return false;
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entry_id } = await request.json();

    if (!entry_id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Archive the queue entry before deleting
    const archiveSuccess = await archiveQueueEntry(entry_id, session.user.id);
    if (!archiveSuccess) {
      console.warn('Failed to archive queue entry, but proceeding with queue leave operation');
    }

    // Delete queue entry services first (due to foreign key constraints)
    const { error: servicesDeleteError } = await supabase
      .from('queue_entry_services')
      .delete()
      .eq('entry_id', entry_id);

    if (servicesDeleteError) {
      throw servicesDeleteError;
    }

    // Then delete the queue entry
    const { error: entryDeleteError } = await supabase
      .from('queue_entries')
      .delete()
      .match({
        entry_id: entry_id,
        user_id: session.user.id
      });

    if (entryDeleteError) {
      throw entryDeleteError;
    }

    return NextResponse.json({
      message: 'Successfully left the queue'
    });

  } catch (error) {
    console.error('Error leaving queue:', error);
    return NextResponse.json(
      { error: 'Failed to leave queue' },
      { status: 500 }
    );
  }
} 