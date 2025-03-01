import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { NotificationService } from '@/services/NotificationService';
import { PerformanceMonitor } from '@/app/utils/performance';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const notificationService = new NotificationService();

export async function POST(request, { params }) {
  const perf = new PerformanceMonitor('queue_join');
  let session;

  try {
    // Auth check
    session = await getServerSession(authOptions);
    perf.markStep('auth');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { queueid } = params;

    // First, check if queue exists and has capacity
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('name, current_queue, max_capacity, est_time_to_serve')
      .eq('queue_id', queueid)
      .single();
    perf.markStep('check_queue');

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
    perf.markStep('check_existing');

    if (existingEntry) {
      return NextResponse.json({ error: 'Already in queue' }, { status: 400 });
    }

    const { data: newEntry, error: joinError } = await supabase
      .from('queue_entries')
      .insert({
        queue_id: queueid,
        user_id: session.user.id,
        status: 'waiting',
        position: queueData.current_queue + 1,
      })
      .select()
      .single();
    perf.markStep('insert_entry');

    if (joinError) throw joinError;

    console.log('✅ Queue join complete!', {
      userId: session.user.id,
      queueId: queueid
    });

    // After successful queue join and before returning response
    const { data: userData } = await supabase
      .from('user_profile')
      .select('email, phone_number')
      .eq('user_id', session.user.id)
      .single();
    perf.markStep('fetch_user_data');

    // Format phone number to E.164 format if not already formatted
    const formattedPhone = userData?.phone_number?.startsWith('+') 
      ? userData.phone_number 
      : userData?.phone_number ? `+${userData.phone_number?.replace(/\D/g, '')}` : null;

    // After successful queue join and before sending notification
    const { data: queueEntries } = await supabase
      .from('queue_entries')
      .select('user_id, join_time')
      .eq('queue_id', queueid)
      .eq('status', 'waiting')
      .order('join_time', { ascending: true });
    perf.markStep('fetch_queue_entries');

    // Calculate actual position and estimated wait time
    let actualPosition = 0;
    queueEntries.forEach((entry, index) => {
      if (entry.user_id === session.user.id) {
        actualPosition = index + 1;
      }
    });
    
    // Calculate estimated wait time based on position and service time
    const estimatedWaitTime = Math.ceil(actualPosition * queueData.est_time_to_serve);

    // Send notification with accurate data including wait time
    await notificationService.sendNotification(
      'QUEUE_JOIN',
      session.user.id,
      {
        email: userData?.email,
        phone: formattedPhone
      },
      {
        queueName: queueData.name,
        position: actualPosition,
        waitTime: estimatedWaitTime
      }
    );
    perf.markStep('send_notification');

    perf.end();
    return NextResponse.json({
      message: 'Successfully joined the queue',
      entry: {
        ...newEntry,
        estimated_wait_time: estimatedWaitTime
      }
    });

  } catch (error) {
    console.error('❌ Error joining queue:', {
      error: error.message,
      userId: session?.user?.id,
      queueId: params.queueid
    });
    
    return NextResponse.json({ 
      error: 'An unexpected error occurred', 
      details: error.message
    }, { status: 500 });
  }
}