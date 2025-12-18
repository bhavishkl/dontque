import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "@/lib/mock-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function archiveQueueEntry(queueId, userId, leftPosition) {
  try {
    // Fetch the queue entry to be archived
    const { data: entryData, error: fetchError } = await supabase
      .from('queue_entries')
      .select('*')
      .match({ queue_id: queueId, user_id: userId })
      .single();

    if (fetchError) {
      console.error('Error fetching queue entry:', fetchError);
      return false;
    }

    if (!entryData) {
      console.error('No queue entry found to archive');
      return false;
    }

    // Calculate actual wait time
    const actualWaitTime = Math.floor((new Date() - new Date(entryData.join_time)) / 60000);

    // Insert into queue_entries_archive
    const { error: insertError } = await supabase
      .from('queue_entries_archive')
      .insert({
        queue_id: entryData.queue_id,
        user_id: entryData.user_id,
        status: 'left',
        wait_time: entryData.estimated_wait_time,
        actual_wait_time: actualWaitTime,
        join_time: entryData.join_time,
        leave_time: new Date().toISOString(),
        left_position: leftPosition
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
      const { queueid } = params;
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Fetch the user's current position in the queue
      const { data: userEntry, error: positionError } = await supabase
        .from('queue_entries')
        .select('position')
        .match({ queue_id: queueid, user_id: session.user.id })
        .single();

      if (positionError) {
        console.error('Error fetching user position:', positionError);
        return NextResponse.json({ error: positionError.message }, { status: 500 });
      }

      const leftPosition = userEntry ? userEntry.position : null;

      // Archive the queue entry before deleting
      const archiveSuccess = await archiveQueueEntry(queueid, session.user.id, leftPosition);
      if (!archiveSuccess) {
        console.warn('Failed to archive queue entry, but proceeding with queue leave operation');
      }

      // Remove the user's entry from the queue
      const { error } = await supabase
        .from('queue_entries')
        .delete()
        .match({ queue_id: queueid, user_id: session.user.id });

      if (error) {
        console.error('Error leaving queue:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'Successfully left the queue',
        left_position: leftPosition
      });
    } catch (error) {
      console.error('Unexpected error in Supabase operations:', error);
      return NextResponse.json({ error: 'An unexpected error occurred while processing your request' }, { status: 500 });
    }
}