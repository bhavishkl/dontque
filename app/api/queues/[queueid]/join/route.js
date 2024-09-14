import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { queueid } = params;

  // Get the current queue information
  const { data: queueData, error: queueError } = await supabase
    .from('queues')
    .select('current_queue, max_capacity, avg_wait_time, est_time_to_serve')
    .eq('queue_id', queueid)
    .single();

  if (queueError) {
    return NextResponse.json({ error: queueError.message }, { status: 500 });
  }

  if (queueData.current_queue >= queueData.max_capacity) {
    return NextResponse.json({ error: 'Queue is full' }, { status: 400 });
  }

  // Add the user to the queue
  const { data, error } = await supabase
    .from('queue_entries')
    .insert({
      queue_id: queueid,
      user_id: session.user.id,
      position: queueData.current_queue + 1,
      status: 'waiting'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update the current queue count and total estimated time
  const newQueueCount = queueData.current_queue + 1;
  const newTotalEstimatedTime = newQueueCount * queueData.est_time_to_serve;

  const { data: updatedQueue, error: updateError } = await supabase
    .from('queues')
    .update({ 
      current_queue: newQueueCount,
      total_estimated_time: newTotalEstimatedTime
    })
    .eq('queue_id', queueid)
    .select('current_queue, total_estimated_time')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...updatedQueue,
    userPosition: newQueueCount,
    estWaitTime: newQueueCount * queueData.avg_wait_time
  });
}