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
        .select('current_queue')
        .eq('queue_id', queueid)
        .single();

      if (fetchError) {
        console.error('Error fetching queue data:', fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }
      // Update the current queue count, ensuring it doesn't go below zero
      const newQueueCount = Math.max(0, queueData.current_queue - 1);
      const { error: updateError } = await supabase
        .from('queues')
        .update({ current_queue: newQueueCount })
        .eq('queue_id', queueid);

      if (updateError) {
        console.error('Error updating queue count:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'Successfully left the queue',
        current_queue: queueData.current_queue - 1
      });
    } catch (error) {
      console.error('Unexpected error in Supabase operations:', error);
      return NextResponse.json({ error: 'An unexpected error occurred while processing your request' }, { status: 500 });
    }
}