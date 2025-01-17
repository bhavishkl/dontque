import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PerformanceMonitor } from '@/utils/performance';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  const monitor = new PerformanceMonitor('GET queue details');
  try {
    const { queueid } = params;
    const session = await getServerSession(authOptions);
    monitor.markStep('auth check');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch both queue data and entries in parallel
    const [queueResponse, entriesResponse] = await Promise.all([
      supabase
        .from('queue_stats_extended')
        .select('*')
        .eq('queue_id', queueid)
        .single(),
      
      supabase
        .from('queue_entries')
        .select('entry_id, user_id, join_time')  // Select only needed fields
        .eq('queue_id', queueid)
        .eq('status', 'waiting')
        .order('join_time', { ascending: true })
    ]);
    monitor.markStep('fetch data');

    if (queueResponse.error) {
      console.error('Error fetching queue data:', queueResponse.error);
      return NextResponse.json({ error: queueResponse.error.message }, { status: 500 });
    }

    if (entriesResponse.error) {
      console.error('Error fetching queue entries:', entriesResponse.error);
      return NextResponse.json({ error: entriesResponse.error.message }, { status: 500 });
    }

    // Find user's position
    const userPosition = entriesResponse.data.findIndex(entry => entry.user_id === session.user.id) + 1;
    const userEntry = userPosition > 0 ? entriesResponse.data[userPosition - 1] : null;
    monitor.markStep('process position');

    const responseData = {
      ...queueResponse.data,
      queueEntries: entriesResponse.data,
      userQueueEntry: userEntry ? {
        ...userEntry,
        position: userPosition,
        estimated_wait_time: queueResponse.data.est_time_to_serve * userPosition
      } : null,
    };

    monitor.end();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Unexpected error in GET function:', error);
    monitor.end();
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const monitor = new PerformanceMonitor('PATCH queue details');
  try {
    const { queueid } = params;
    const session = await getServerSession(authOptions);
    monitor.markStep('auth check');

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
    monitor.markStep('update queue');

    if (error) {
      console.error('Error updating queue:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    monitor.end();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PATCH function:', error);
    monitor.end();
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}