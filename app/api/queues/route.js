import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const limit = searchParams.get('limit') || 10;
  const search = searchParams.get('search');

  let query = supabase
    .from('queues')
    .select(`
      queue_id,
      name,
      category,
      avg_wait_time,
      image_url,
      est_time_to_serve,
      opening_time,
      closing_time,
      service_start_time,
      description
    `)
    .eq('status', 'active');

  if (city && city.trim()) {
    query = query.eq('location', city);
  }

  if (search && search.trim()) {
    query = query.or(`name.ilike.%${search.trim()}%, description.ilike.%${search.trim()}%, location.ilike.%${search.trim()}%`);
  }

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  query = query.limit(limit);

  const { data: queueData, error: queueError } = await query;

  if (queueError) {
    return NextResponse.json({ error: queueError.message }, { status: 500 });
  }

  // Fetch queue stats from the view
  const { data: queueStats, error: statsError } = await supabase
    .from('queue_current_stats')
    .select('queue_id, current_queue_count, total_estimated_wait_time, avg_rating, capacity_percentage')
    .in('queue_id', queueData.map(q => q.queue_id));

  if (statsError) {
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  // Log queue stats
  queueStats.forEach(stat => {
    console.log(`Queue ${stat.queue_id} - Current Queue Count: ${stat.current_queue_count}, Average Rating: ${stat.avg_rating}`);
  });

  // Merge queue data with stats
  const queuesWithStats = queueData.map(queue => {
    const stats = queueStats.find(stat => stat.queue_id === queue.queue_id) || {
      current_queue_count: 0,
      total_estimated_wait_time: 0,
      avg_rating: null,
      capacity_percentage: 0
    };
    
    return {
      ...queue,
      current_queue: stats.current_queue_count,
      queue_entry_length: stats.current_queue_count,
      total_est_wait_time: stats.total_estimated_wait_time,
      avg_rating: stats.avg_rating,
      capacity_percentage: stats.capacity_percentage
    };
  });

  return NextResponse.json(queuesWithStats);
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