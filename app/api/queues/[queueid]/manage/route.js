import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  try {
    const { queueid } = params;
    
    if (!queueid) {
      return NextResponse.json({ 
        error: 'Queue ID is required',
        userMessage: 'Unable to load queue information. Please try again.' 
      }, { status: 400 });
    }

    // Fetch queue data
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('*')
      .eq('queue_id', queueid)
      .single();

    if (queueError) {
      console.error('Error fetching queue data:', queueError);
      
      // Handle specific error cases
      if (queueError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Queue not found',
          userMessage: 'The requested queue does not exist or has been deleted.' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: queueError.message,
        userMessage: 'Unable to load queue information. Please try again later.' 
      }, { status: 500 });
    }

    // Fetch customers in queue ordered by join_time
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
      .order('join_time', { ascending: true });

    if (customersError) {
      console.error('Error fetching customers in queue:', customersError);
      return NextResponse.json({ 
        error: customersError.message,
        userMessage: 'Unable to load customer information. Please refresh the page.' 
      }, { status: 500 });
    }

    // Handle case when queue exists but no customers are found
    if (!customersInQueue || customersInQueue.length === 0) {
      return NextResponse.json({
        queueData,
        customersInQueue: [],
        message: 'Queue is currently empty'
      });
    }

    // Format join_time for each customer
    const customersWithFormattedTime = customersInQueue.map((customer) => ({
      ...customer,
      formattedJoinTime: new Date(customer.join_time).toLocaleTimeString(),
      user_profile: customer.user_profile || { 
        name: 'Anonymous',
        email: 'Not provided'
      }
    }));

    return NextResponse.json({
      queueData,
      customersInQueue: customersWithFormattedTime
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