import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const queueId = searchParams.get('queueId');
  const range = searchParams.get('range');

  if (!queueId || !range) {
    return NextResponse.json({ error: 'Missing queueId or range parameter' }, { status: 400 });
  }

  let startDate, endDate;
  const now = new Date();

  switch (range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      endDate = new Date();
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      endDate = new Date();
      break;
    default:
      return NextResponse.json({ error: 'Invalid range parameter' }, { status: 400 });
  }

  try {
    // Fetch queue details
    const { data: queueData, error: queueError } = await supabase
      .from('queues')
      .select('*')
      .eq('queue_id', queueId)
      .single();

    if (queueError) throw queueError;

    // Fetch analytics data from queue_entries_archive
    const { data: archiveData, error: archiveError } = await supabase
      .from('queue_entries_archive')
      .select('*')
      .eq('queue_id', queueId)
      .gte('join_time', startDate.toISOString())
      .lte('join_time', endDate.toISOString());

    if (archiveError) throw archiveError;

    // Process the data to calculate analytics
    const totalServed = archiveData.length;
    const avgWaitTime = Math.round(archiveData.reduce((sum, entry) => sum + entry.actual_wait_time, 0) / totalServed);
    
    // Calculate hourly data
    const hourlyData = Array(24).fill().map((_, i) => ({
      hour: i,
      customers: 0,
      avgWaitTime: 0
    }));

    archiveData.forEach(entry => {
      const hour = new Date(entry.join_time).getHours();
      hourlyData[hour].customers++;
      hourlyData[hour].avgWaitTime += entry.actual_wait_time;
    });

    hourlyData.forEach(data => {
      if (data.customers > 0) {
        data.avgWaitTime = Math.round(data.avgWaitTime / data.customers);
      }
    });

    // Calculate peak hour
    const peakHour = hourlyData.reduce((max, current) => (current.customers > max.customers ? current : max), hourlyData[0]);

    // Calculate customer types (you may need to adjust this based on your data structure)
    const customerTypes = [
      { name: 'New', value: 0 },
      { name: 'Returning', value: 0 }
    ];

    // Calculate weekly trend (for 'week' and longer ranges)
    const weeklyTrend = range !== 'today' ? Array(7).fill().map((_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      customers: 0
    })) : null;

    if (weeklyTrend) {
      archiveData.forEach(entry => {
        const day = new Date(entry.join_time).getDay();
        weeklyTrend[day].customers++;
      });
    }

    // Prepare the response data
    const analyticsData = {
      name: queueData.name,
      currentQueue: queueData.current_queue,
      averageWaitTime: avgWaitTime,
      totalServed,
      hourlyData,
      peakHour: `${peakHour.hour}:00`,
      customerTypes,
      weeklyTrend,
      // Add more analytics data as needed
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}

export async function POST(request) {
  // Implement the export functionality here
  // This will depend on how you want to format and deliver the exported data
  // For now, we'll return a simple message
  return NextResponse.json({ message: 'Export functionality not implemented yet' });
}