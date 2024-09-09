import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  try {
    const { queueid } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching queue data for queue ID:', queueid);
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('*')
      .eq('queue_id', queueid)
      .single();

    if (queueError) {
      console.error('Error fetching queue data:', queueError);
      return NextResponse.json({ error: queueError.message }, { status: 500 });
    }

    console.log('Fetching user queue entry for user ID:', session.user.id);
    const { data: userQueueEntry, error: userQueueEntryError } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('queue_id', queueid)
      .eq('user_id', session.user.id)
      .single();

    if (userQueueEntryError && userQueueEntryError.code !== 'PGRST116') {
      console.error('Error fetching user queue entry:', userQueueEntryError);
      console.log('User is not in the queue');
    }

    // Calculate estimated wait time
    let estimatedWaitTime = null;
    if (userQueueEntry && queueData.est_time_to_serve) {
      if (userQueueEntry.position === 1) {
        estimatedWaitTime = 0;
      } else {
        estimatedWaitTime = (userQueueEntry.position - 1) * queueData.est_time_to_serve;
      }
    }

    const responseData = {
      ...queueData,
      userQueueEntry: userQueueEntry ? {
        ...userQueueEntry,
        estimated_wait_time: estimatedWaitTime
      } : null
    };

    console.log('Returning queue data:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Unexpected error in GET function:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}