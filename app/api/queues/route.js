import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = searchParams.get('limit') || 10;
  const search = searchParams.get('search');

  let query = supabase
    .from('queues')
    .select(`
      queue_id,
      name,
      category,
      current_queue,
      avg_wait_time,
      image_url,
      est_time_to_serve
    `)
    .eq('status', 'active')
    .order('current_queue', { ascending: false })
    .limit(limit);

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%, location.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch queue entry lengths for each queue
  const queueEntryLengths = await Promise.all(data.map(async (queue) => {
    const { count, error: countError } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', queue.queue_id);

    if (countError) {
      console.error('Error fetching queue entry length:', countError);
      return 0;
    }

    return count;
  }));

  // Calculate total estimated wait time for each queue and add queue entry length
  const queuesWithTotalWaitTime = data.map((queue, index) => ({
    ...queue,
    total_est_wait_time: queueEntryLengths[index] * queue.est_time_to_serve,
    queue_entry_length: queueEntryLengths[index]
  }));

  return NextResponse.json(queuesWithTotalWaitTime);
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, category, location, max_capacity, opening_time, closing_time, est_time_to_serve, service_start_time } = await request.json();

    // Generate a unique queue ID
    const queueId = 'Q' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const { data, error } = await supabase
      .from('queues')
      .insert({
        owner_id: session.user.id,
        name,
        description,
        category,
        location,
        max_capacity,
        opening_time,
        closing_time,
        est_time_to_serve: parseInt(est_time_to_serve),
        service_start_time,
        status: 'active',
        queue_id_short: queueId  // New field to store the short queue ID
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating queue:', error);
    return NextResponse.json({ error: 'Failed to create queue' }, { status: 500 });
  }
}