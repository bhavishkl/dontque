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

    const { data: ratingStats, error } = await supabase
      .from('queue_rating_stats')
      .select('total_reviews, avg_rating')
      .eq('queue_id', queueid)
      .single();

    console.log('Fetching queue entries for queue ID:', queueid);
    const { data: queueEntries, error: queueEntriesError } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('queue_id', queueid)
      .order('join_time', { ascending: true });

    if (queueEntriesError) {
      console.error('Error fetching queue entries:', queueEntriesError);
      return NextResponse.json({ error: queueEntriesError.message }, { status: 500 });
    }

    let userQueueEntry = null;
    let userPosition = null;

    queueEntries.forEach((entry, index) => {
      if (entry.user_id === session.user.id) {
        userQueueEntry = entry;
        userPosition = index + 1;
      }
    });

    if (userQueueEntry) {
      userQueueEntry.position = userPosition;
    }

    // Calculate estimated wait time
   // Dummy estimated wait time
let estimatedWaitTime = 15; // Fixed 15 minutes for everyone

    // Fetch join time of user in front
    let userInFrontJoinTime = null;
    if (userQueueEntry) {
      const { data: frontUser, error: frontUserError } = await supabase
        .from('queue_entries')
        .select('join_time')
        .eq('queue_id', queueid)
        .lt('join_time', userQueueEntry.join_time)
        .order('join_time', { ascending: false })
        .limit(1)
        .single();

      if (frontUserError && frontUserError.code !== 'PGRST116') {
        console.error('Error fetching front user:', frontUserError);
      } else if (frontUser) {
        userInFrontJoinTime = frontUser.join_time;
      }
    }

    const responseData = {
      ...queueData,
      queueEntries,
      short_id: queueData.short_id,
      userQueueEntry: userQueueEntry ? {
        ...userQueueEntry,
        position: userPosition,
        estimated_wait_time: 15 // Fixed dummy value
      } : null,
      total_reviews: ratingStats?.total_reviews || 0,
      rating: ratingStats?.avg_rating || 0
    };

    
    console.log('Returning queue data:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Unexpected error in GET function:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { queueid } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, est_time_to_serve } = body;

    const updateData = {};
    if (status) updateData.status = status;
    if (est_time_to_serve) updateData.est_time_to_serve = est_time_to_serve;

    const { data, error } = await supabase
      .from('queues')
      .update(updateData)
      .eq('queue_id', queueid)
      .select()
      .single();

    if (error) {
      console.error('Error updating queue:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PATCH function:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}