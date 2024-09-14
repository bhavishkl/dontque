import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request, { params }) {
    try {
      const { queueid } = params;
      const session = await getServerSession(authOptions);
  
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

      // Fetch the current queue data
      const { data: queueData, error: fetchError } = await supabase
        .from('queues')
        .select('current_queue, est_time_to_serve')
        .eq('queue_id', queueid)
        .single();

      if (fetchError) {
        console.error('Error fetching queue data:', fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      // Calculate new queue count and total estimated time
      const newQueueCount = Math.max(0, queueData.current_queue - 1);
      const newTotalEstimatedTime = newQueueCount * queueData.est_time_to_serve;

      // Update the queue with new count and total estimated time
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
        console.error('Error updating queue:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'Successfully left the queue',
        current_queue: updatedQueue.current_queue,
        total_estimated_time: updatedQueue.total_estimated_time
      });
    } catch (error) {
      console.error('Unexpected error in Supabase operations:', error);
      return NextResponse.json({ error: 'An unexpected error occurred while processing your request' }, { status: 500 });
    }
}