import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "@/lib/mock-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PerformanceMonitor } from '@/app/utils/performance';

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

export async function DELETE(request, { params }) {
  const monitor = new PerformanceMonitor('DELETE queue');
  try {
    const { queueid } = params;
    const session = await getServerSession(authOptions);
    monitor.markStep('auth check');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, verify the user owns this queue
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('owner_id')
      .eq('queue_id', queueid)
      .single();
    
    if (queueError) {
      console.error('Error fetching queue:', queueError);
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }

    if (queueData.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'You do not have permission to delete this queue' }, { status: 403 });
    }
    
    monitor.markStep('ownership verified');

    // Delete related records first (due to foreign key constraints)
    // 1. Delete queue entries
    const { error: entriesError } = await supabase
      .from('queue_entries')
      .delete()
      .eq('queue_id', queueid);
    
    if (entriesError) {
      console.error('Error deleting queue entries:', entriesError);
      return NextResponse.json({ error: 'Failed to delete queue entries' }, { status: 500 });
    }
    
    // 2. Delete saved queues references
    const { error: savedQueuesError } = await supabase
      .from('saved_queues')
      .delete()
      .eq('queue_id', queueid);
    
    if (savedQueuesError) {
      console.error('Error deleting saved queue references:', savedQueuesError);
      // Continue anyway as this is not critical
    }
    
    // 3. Delete queue counters if they exist
    const { error: countersError } = await supabase
      .from('queue_counters')
      .delete()
      .eq('queue_id', queueid);
    
    if (countersError) {
      console.error('Error deleting queue counters:', countersError);
      // Continue anyway as not all queues have counters
    }
    
    monitor.markStep('related records deleted');

    // Finally, delete the queue itself
    const { error: deleteError } = await supabase
      .from('queues')
      .delete()
      .eq('queue_id', queueid);
    
    if (deleteError) {
      console.error('Error deleting queue:', deleteError);
      return NextResponse.json({ error: 'Failed to delete queue' }, { status: 500 });
    }
    
    monitor.markStep('queue deleted');
    monitor.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Queue deleted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error in DELETE function:', error);
    monitor.end();
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}