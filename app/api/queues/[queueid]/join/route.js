import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request, { params }) {
  console.log('🚀 Starting queue join process for queue:', params.queueid);
  const metrics = {
    startTime: performance.now(),
    authTime: 0,
    dbTransactionTime: 0,
    totalTime: 0
  };

  let session;

  try {
    // Auth check with timing
    console.log('📝 Authenticating user...');
    const authStart = performance.now();
    session = await getServerSession(authOptions);
    metrics.authTime = performance.now() - authStart;
    console.log('⏱️ Auth time:', metrics.authTime.toFixed(2) + 'ms');

    if (!session) {
      console.log('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { queueid } = params;

    // First, check if queue exists and has capacity
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('current_queue, max_capacity, est_time_to_serve')
      .eq('queue_id', queueid)
      .single();

    if (queueError) {
      throw new Error('Queue not found');
    }

    if (queueData.current_queue >= queueData.max_capacity) {
      return NextResponse.json({ error: 'Queue is full' }, { status: 400 });
    }

    // Check if user is already in queue
    const { data: existingEntry, error: existingError } = await supabase
      .from('queue_entries')
      .select('entry_id')
      .eq('queue_id', queueid)
      .eq('user_id', session.user.id)
      .eq('status', 'waiting')
      .single();

    if (existingEntry) {
      return NextResponse.json({ error: 'Already in queue' }, { status: 400 });
    }

    // Execute the database transaction
    console.log('💾 Executing database transaction...');
    const dbStart = performance.now();
    
    const { data: newEntry, error: joinError } = await supabase
      .from('queue_entries')
      .insert({
        queue_id: queueid,
        user_id: session.user.id,
        status: 'waiting',
        position: queueData.current_queue + 1,
        estimated_wait_time: queueData.est_time_to_serve * (queueData.current_queue + 1)
      })
      .select()
      .single();

    if (joinError) throw joinError;

    // Update queue count
    const { data: updatedQueue, error: updateError } = await supabase
      .from('queues')
      .update({ 
        current_queue: queueData.current_queue + 1,
        total_estimated_time: (queueData.current_queue + 1) * queueData.est_time_to_serve
      })
      .eq('queue_id', queueid)
      .select('current_queue, total_estimated_time')
      .single();

    if (updateError) throw updateError;

    metrics.dbTransactionTime = performance.now() - dbStart;
    console.log('⏱️ Database transaction time:', metrics.dbTransactionTime.toFixed(2) + 'ms');

    metrics.totalTime = performance.now() - metrics.startTime;
    console.log('✅ Queue join complete! Final metrics:', {
      ...metrics,
      totalTime: metrics.totalTime.toFixed(2) + 'ms',
      userId: session.user.id,
      queueId: queueid
    });

    return NextResponse.json({
      message: 'Successfully joined the queue',
      entry: newEntry,
      queue: updatedQueue,
      metrics
    });

  } catch (error) {
    metrics.totalTime = performance.now() - metrics.startTime;
    console.error('❌ Error joining queue:', {
      error: error.message,
      metrics: {
        ...metrics,
        totalTime: metrics.totalTime.toFixed(2) + 'ms'
      },
      userId: session?.user?.id,
      queueId: params.queueid
    });
    
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      details: error.message,
      metrics
    }, { status: 500 });
  }
}