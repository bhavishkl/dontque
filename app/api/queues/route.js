import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PerformanceMonitor } from '../../utils/performance';

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

    // Add empty state metadata
    const responsePayload = formattedQueues.length > 0 ? 
      formattedQueues : 
      { 
        data: [],
        meta: {
          search,
          category,
          city: city || 'Not specified',
          message: city ? 
            `No active queues found in ${city.trim()}` : 
            'No queues found with current filters'
        }
      };

    return NextResponse.json(responsePayload);

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

    const queueData = await request.json();

    // Validate required fields
    if (!queueData.name || !queueData.category || !queueData.location) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name, category, and location are required' 
      }, { status: 400 });
    }

    // Advanced queue is the default and only supported type
    if (!queueData.counters?.length) {
      return NextResponse.json({ 
        success: false, 
        message: 'At least one counter is required' 
      }, { status: 400 });
    }

    const parsedCounters = queueData.counters.map(counter => ({
      ...counter,
      parsedMaxCapacity: counter.maxCapacity ? parseInt(counter.maxCapacity) : 0
    }));

    const totalCounterCapacity = parsedCounters.reduce(
      (total, counter) => total + (Number.isFinite(counter.parsedMaxCapacity) ? counter.parsedMaxCapacity : 0),
      0
    );

    const queueServiceStartTime =
      parsedCounters.find(counter => counter.serviceStartTime)?.serviceStartTime || null;

    let parsedServices = [];
    if (queueData.services?.length) {
      parsedServices = queueData.services.map(service => ({
        ...service,
        parsedEstimatedTime: service.estTimeToServe ? parseInt(service.estTimeToServe) : 0,
        parsedPrice: service.price ? parseFloat(service.price) : null
      }));

      for (const service of parsedServices) {
        if (!Number.isFinite(service.parsedEstimatedTime) || service.parsedEstimatedTime < 0) {
          return NextResponse.json({
            success: false,
            message: 'Each service must have a valid estimated time'
          }, { status: 400 });
        }
      }
    }

    const queueEstimatedTime = parsedServices.length
      ? Math.round(
          parsedServices.reduce((total, service) => total + service.parsedEstimatedTime, 0) / parsedServices.length
        )
      : 0;

    // Clean and validate numeric fields
    const cleanedQueueData = {
      queue_id: queueData.id,
      owner_id: session.user.id,
      name: queueData.name,
      description: queueData.description,
      category: queueData.category,
      location: queueData.location,
      address: queueData.address,
      max_capacity: totalCounterCapacity,
      opening_time: queueData.openingTime || null,
      closing_time: queueData.closingTime || null,
      service_start_time: queueServiceStartTime,
      service_type: 'advanced',
      est_time_to_serve: queueEstimatedTime,
      status: 'active'
    };

    // Create a map of counter IDs for quick lookup
    const counterMap = new Map(
      queueData.counters.map(counter => [counter.id, counter])
    );

    // If services exist, validate counter links
    if (queueData.services?.length) {
      for (const service of queueData.services) {
        if (!service.linkedCounters?.length) {
          return NextResponse.json({ 
            success: false, 
            message: 'Each service must be linked to at least one counter' 
          }, { status: 400 });
        }

        // Validate counter references using UUIDs
        for (const counterId of service.linkedCounters) {
          if (!counterMap.has(counterId)) {
            return NextResponse.json({ 
              success: false, 
              message: 'Invalid counter reference in service' 
            }, { status: 400 });
          }
        }
      }
    }

    // Insert queue with cleaned data
    const { data: queue, error: queueError } = await supabase
      .from('queues')
      .insert(cleanedQueueData)
      .select()
      .single();

    if (queueError) throw queueError;

    // Insert counters
    const cleanedCounters = parsedCounters.map(counter => ({
      counter_id: counter.id,
      queue_id: queueData.id,
      name: counter.name,
      counter_type: queueData.staff?.length > 0 ? 'staff' : 'standard',
      status: 'active',
      service_start_time: counter.serviceStartTime || null,
      max_capacity: Number.isFinite(counter.parsedMaxCapacity) ? counter.parsedMaxCapacity : 0
    }));

    const { error: counterError } = await supabase
      .from('counters')
      .insert(cleanedCounters);

    if (counterError) {
      await supabase
        .from('queues')
        .delete()
        .eq('queue_id', queueData.id);
      throw counterError;
    }

    // Insert services if they exist
    if (parsedServices.length) {
      const serviceEntries = parsedServices.flatMap(service => 
        service.linkedCounters.map(counterId => ({
          service_id: service.id,
          counter_id: counterId,
          name: service.name,
          description: service.description || null,
          estimated_time: service.parsedEstimatedTime,
          price: service.parsedPrice,
          status: 'active'
        }))
      );

      const { error: serviceError } = await supabase
        .from('services')
        .insert(serviceEntries);

      if (serviceError) {
        await supabase
          .from('counters')
          .delete()
          .eq('queue_id', queueData.id);
        await supabase
          .from('queues')
          .delete()
          .eq('queue_id', queueData.id);
        throw serviceError;
      }
    }

    // Insert staff if they exist
    if (queueData.staff?.length) {
      const cleanedStaff = queueData.staff.map(staff => {
        const counterIndex = Number.parseInt(staff.assignedCounter, 10);
        const assignedCounterId = Number.isInteger(counterIndex)
          ? queueData.counters?.[counterIndex]?.id
          : null;

        return {
          staff_id: staff.id,
          counter_id: assignedCounterId || null,
          name: staff.name,
          specialization: staff.role,
          experience_years: null,
          rating: 4.0,
          review_count: 0
        };
      });

      const { error: staffError } = await supabase
        .from('staff_details')
        .insert(cleanedStaff);

      if (staffError) {
        await supabase
          .from('services')
          .delete()
          .in('counter_id', queueData.counters.map(counter => counter.id));
        await supabase
          .from('counters')
          .delete()
          .eq('queue_id', queueData.id);
        await supabase
          .from('queues')
          .delete()
          .eq('queue_id', queueData.id);
        throw staffError;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Queue created successfully',
      data: queue
    });

  } catch (error) {
    console.error('Error creating queue:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create queue',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
