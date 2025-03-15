import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  try {
    const { queueid } = params;
    const { searchParams } = new URL(request.url);
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    if (!queueid) {
      return NextResponse.json({ 
        error: 'Queue ID is required',
        userMessage: 'Unable to load queue information. Please try again.' 
      }, { status: 400 });
    }

    // Parallel data fetching for improved performance
    const [queueResult, customersResult] = await Promise.all([
      // Queue data fetch
      supabase
        .from('queues')
        .select('*')
        .eq('queue_id', queueid)
        .single(),
      
      // Customers fetch
      supabase
        .from('queue_entries')
        .select(`
          *,
          user_profile:user_id (
            user_id,
            name,
            email
          )
        `)
        .eq('queue_id', queueid)
        .order('join_time', { ascending: true })
    ]);

    // Handle queue errors
    if (queueResult.error) {
      console.error('Error fetching queue data:', queueResult.error);

      // Handle specific error cases
      if (queueResult.error.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Queue not found',
          userMessage: 'The requested queue does not exist or has been deleted.' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        error: queueResult.error.message,
        userMessage: 'Unable to load queue information. Please try again later.' 
      }, { status: 500 });
    }

    // Handle customers errors
    if (customersResult.error) {
      console.error('Error fetching customers in queue:', customersResult.error);
      return NextResponse.json({ 
        error: customersResult.error.message,
        userMessage: 'Unable to load customer information. Please refresh the page.' 
      }, { status: 500 });
    }

    const queueData = queueResult.data;
    const customersInQueue = customersResult.data || [];

    // Calculate waiting time for each customer
    const now = new Date();
    const customersWithFormattedTime = customersInQueue.map((customer) => {
      const joinTime = new Date(customer.join_time);
      const waitingTimeMs = now - joinTime;
      const waitingMinutes = Math.floor(waitingTimeMs / (1000 * 60));
      const waitingSeconds = Math.floor((waitingTimeMs % (1000 * 60)) / 1000);
      
      return {
        ...customer,
        formattedJoinTime: joinTime.toLocaleTimeString(),
        waitingTime: `${waitingMinutes}m ${waitingSeconds}s`,
        estimatedServiceTime: `${queueData.est_time_to_serve}m`,
        user_profile: customer.user_profile || { 
          name: 'Anonymous',
          email: 'Not provided'
        }
      };
    });

    return NextResponse.json({
      queueData,
      customersInQueue: customersWithFormattedTime,
      message: customersWithFormattedTime.length === 0 ? 'Queue is currently empty' : undefined
    });

  } catch (error) {
    console.error('Unexpected error in GET function:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      userMessage: 'Something went wrong. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 