import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PerformanceMonitor } from '@/utils/performance';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  const monitor = new PerformanceMonitor('GET /api/queues');
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const limit = Math.min(parseInt(searchParams.get('limit') || 10), 50);
    const search = searchParams.get('search')?.trim();

    monitor.markStep('params-parsed');

    // Using the new view
    let query = supabase
      .from('queue_stats_extended')
      .select(`
        queue_id,
        name,
        category,
        image_url,
        description,
        location,
        operating_hours,
        current_queue_count,
        total_estimated_wait_time,
        avg_rating,
        capacity_percentage
      `)
      .eq('status', 'active');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (city) {
      query = query.eq('location', city.trim());
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query
      .order('name', { ascending: true })
      .limit(limit);

    monitor.markStep('query-built');

    const { data: queueData, error: queueError } = await query;

    monitor.markStep('data-fetched');

    if (queueError) {
      console.error('Query error:', queueError);
      monitor.end();
      return NextResponse.json({ error: 'Failed to fetch queues' }, { status: 500 });
    }

    // The view already returns data in the correct format, but let's ensure all fields are present
    const formattedQueues = queueData?.map(queue => ({
      queue_id: queue.queue_id,
      name: queue.name,
      category: queue.category,
      image_url: queue.image_url,
      description: queue.description,
      location: queue.location,
      operating_hours: queue.operating_hours,
      current_queue_count: queue.current_queue_count || 0,
      total_estimated_wait_time: queue.total_estimated_wait_time || 0,
      avg_rating: queue.avg_rating || 0,
      capacity_percentage: queue.capacity_percentage || 0
    })) || [];

    monitor.markStep('data-transformed');
    monitor.end();

    return NextResponse.json(formattedQueues);

  } catch (error) {
    console.error('Unexpected error:', error);
    monitor.end();
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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