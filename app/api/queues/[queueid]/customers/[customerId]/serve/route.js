import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function archiveQueueEntry(queueId, entryId) {
  try {
    // Fetch the queue entry to be archived
    const { data: entryData, error: fetchError } = await supabase
      .from('queue_entries')
      .select('*')
      .match({ queue_id: queueId, entry_id: entryId })
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
        status: 'served',
        wait_time: entryData.estimated_wait_time,
        actual_wait_time: actualWaitTime,
        join_time: entryData.join_time,
        leave_time: new Date().toISOString(),
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

async function notifyFifthInQueue(queueId) {
  try {
    // Fetch the queue entries ordered by position
    const { data: queueEntries, error: fetchError } = await supabase
      .from('queue_entries')
      .select('user_id, position')
      .eq('queue_id', queueId)
      .order('position', { ascending: true })
      .limit(5);

    if (fetchError) throw fetchError;

    if (queueEntries.length >= 5) {
      const fifthUser = queueEntries[4];
      
      // Fetch user's phone number
      const { data: userData, error: userError } = await supabase
        .from('user_profile')
        .select('phone_number')
        .eq('user_id', fifthUser.user_id)
        .single();

      if (userError) throw userError;

      if (userData && userData.phone_number) {
        // Send WhatsApp notification
        const message = `
🔔 Queue Update: You're Now 5th in Line!

Dear Customer,

You're now 5th in the queue. Please start preparing to be served soon.

📍 Your current position: 5
⏰ Estimated wait time: Approximately 15-20 minutes

🔄 Need to reschedule?
If you need more time, reply "RESCHEDULE" to this message, and we'll move you back in the queue.

Thank you for your patience. We look forward to serving you soon!

QueueSmart Team
        `;
        
        await client.messages.create({
          body: message,
          from: 'whatsapp:+14155238886',
          to: `whatsapp:+${userData.phone_number}`
        });
      }
    }
  } catch (error) {
    console.error('Error notifying fifth user in queue:', error);
  }
}

export async function POST(request, { params }) {
  const { queueid: queueId, customerId } = params;

  if (!queueId || !customerId) {
    console.log('Invalid queue ID or customer ID');
    return NextResponse.json({ error: 'Invalid queue ID or customer ID' }, { status: 400 });
  }

  try {
    // Archive the queue entry before deleting
    const archiveSuccess = await archiveQueueEntry(queueId, customerId);
    if (!archiveSuccess) {
      console.warn('Failed to archive queue entry, but proceeding with serve operation');
    }

    // Delete the customer from the queue
    const { error: deleteError } = await supabase
      .from('queue_entries')
      .delete()
      .eq('queue_id', queueId)
      .eq('entry_id', customerId);

    if (deleteError) throw deleteError;

    // Update the queue's current count, total served, and total estimated time
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('current_queue, total_served, est_time_to_serve')
      .eq('queue_id', queueId)
      .single();

    if (queueError) throw queueError;

    const newQueueCount = Math.max(0, queueData.current_queue - 1);
    const newTotalServed = queueData.total_served + 1;
    const newTotalEstimatedTime = newQueueCount * queueData.est_time_to_serve;

    const { data: updatedQueue, error: updateError } = await supabase
      .from('queues')
      .update({ 
        current_queue: newQueueCount,
        total_served: newTotalServed,
        total_estimated_time: newTotalEstimatedTime
      })
      .eq('queue_id', queueId)
      .select('current_queue, total_served, total_estimated_time')
      .single();

    if (updateError) throw updateError;

    // Notify the fifth person in the queue
    await notifyFifthInQueue(queueId);

    return NextResponse.json({ 
      message: 'Customer served and removed from queue',
      current_queue: updatedQueue.current_queue,
      total_served: updatedQueue.total_served,
      total_estimated_time: updatedQueue.total_estimated_time
    });
  } catch (error) {
    console.error('Error serving customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}