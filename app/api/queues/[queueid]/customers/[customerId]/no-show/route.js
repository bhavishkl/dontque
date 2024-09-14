import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request, { params }) {
  const { queueid: queueId, customerId } = params;

  if (!queueId || !customerId) {
    console.log('Invalid queue ID or customer ID');
    return NextResponse.json({ error: 'Invalid queue ID or customer ID' }, { status: 400 });
  }

  try {
    // Delete the customer from the queue
    const { error: deleteError } = await supabase
      .from('queue_entries')
      .delete()
      .eq('queue_id', queueId)
      .eq('entry_id', customerId);

    if (deleteError) throw deleteError;

    // Update the queue's current count and total estimated time
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('current_queue, est_time_to_serve')
      .eq('queue_id', queueId)
      .single();

    if (queueError) throw queueError;

    const newQueueCount = Math.max(0, queueData.current_queue - 1);
    const newTotalEstimatedTime = newQueueCount * queueData.est_time_to_serve;

    const { data: updatedQueue, error: updateError } = await supabase
      .from('queues')
      .update({ 
        current_queue: newQueueCount,
        total_estimated_time: newTotalEstimatedTime
      })
      .eq('queue_id', queueId)
      .select('current_queue, total_estimated_time')
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ 
      message: 'Customer marked as no-show and removed from queue',
      current_queue: updatedQueue.current_queue,
      total_estimated_time: updatedQueue.total_estimated_time
    });
  } catch (error) {
    console.error('Error marking customer as no-show:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}