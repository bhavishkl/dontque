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

    // Fetch remaining queue entries
    const { data: queueEntries, error: entriesError } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('queue_id', queueId)
      .order('join_time', { ascending: true });

    if (entriesError) throw entriesError;

    // Check if there's a 5th person in the queue
    if (queueEntries.length >= 5) {
      const fifthPerson = queueEntries[4];
      await notifyCustomer(fifthPerson.user_id);
    }

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

async function notifyCustomer(userId) {
  try {
    const { data: userData, error: userError } = await supabase
      .from('user_profile')
      .select('email')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error(`Error fetching user data: ${userError.message}`);
      return;
    }

    if (userData && userData.email) {
      await sendEmailNotification(userData.email);
    } else {
      console.log(`No email found for user ${userId}`);
    }
  } catch (error) {
    console.error('Error in notifyCustomer:', error.message);
    // Don't throw the error, just log it
  }
}

async function sendEmailNotification(email) {
  try {
    const options = {
      method: 'POST',
      headers: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sendTo: email,
        channel: "EMAIL",
        message: "Your position in the queue is now 5. Please be prepared!"
      })
    };

    console.log('Sending email notification with options:', JSON.stringify(options, null, 2));

    const response = await fetch('https://marketing.otpless.app/v1/api/send', options);
    const data = await response.json();

    console.log('Email API response:', JSON.stringify(data, null, 2));

    if (!response.ok || !data.success) {
      console.error(`Email API error: status ${response.status}, message: ${JSON.stringify(data)}`);
      if (data.message === "something went wrong please check again!") {
        console.error('OTPLESS API returned a generic error. Please check your account settings and API credentials.');
      } else if (data.message && data.message.toLowerCase().includes('invalid email')) {
        console.log(`Invalid email: ${email}`);
      } else {
        console.error('Unknown error occurred while sending email. Please check OTPLESS API documentation.');
      }
      return;
    }

    console.log('Email notification sent successfully:', data);
  } catch (error) {
    console.error('Error sending email notification:', error.message);
  }
}