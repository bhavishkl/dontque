import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  try {
    const { queueid } = params;

    // Add these headers to prevent caching
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    // Fetch queue data
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('*')
      .eq('queue_id', queueid)
      .single();

    if (queueError) {
      console.error('Error fetching queue data:', queueError);
      return NextResponse.json({ error: queueError.message }, { status: 500, headers: headers });
    }

    // Fetch customers in queue
    const { data: customersInQueue, error: customersError } = await supabase
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
      .order('position', { ascending: true });

    if (customersError) {
      console.error('Error fetching customers in queue:', customersError);
      return NextResponse.json({ error: customersError.message }, { status: 500, headers: headers });
    }

    // Format join_time for each customer
    const customersWithFormattedTime = customersInQueue.map((customer) => ({
      ...customer,
      formattedJoinTime: new Date(customer.join_time).toLocaleTimeString()
    }));

    return NextResponse.json({
      queueData,
      customersInQueue: customersWithFormattedTime
    }, {
      headers: headers,
    });
  } catch (error) {
    console.error('Unexpected error in GET function:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}