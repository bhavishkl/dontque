import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PerformanceMonitor } from '@/app/utils/performance';

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

    // Clean and validate numeric fields
    const cleanedQueueData = {
      queue_id: queueData.id,
      owner_id: session.user.id,
      name: queueData.name,
      description: queueData.description,
      category: queueData.category,
      location: queueData.location,
      address: queueData.address,
      max_capacity: queueData.maxCapacity ? parseInt(queueData.maxCapacity) : 0,
      opening_time: queueData.openingTime || null,
      closing_time: queueData.closingTime || null,
      service_start_time: queueData.serviceStartTime || null,
      service_type: queueData.serviceType,
      est_time_to_serve: queueData.serviceType === 'standard' 
        ? (queueData.estTimeToServe ? parseInt(queueData.estTimeToServe) : 10)
        : 0,
      status: 'active'
    };

    // Validate required fields
    if (!cleanedQueueData.name || !cleanedQueueData.category || 
        !cleanedQueueData.location || !cleanedQueueData.service_type) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name, category, location, and service type are required' 
      }, { status: 400 });
    }

    // Validate data based on service type
    if (queueData.serviceType === 'advanced') {
      // For advanced type, ensure we have counters
      if (!queueData.counters?.length) {
        return NextResponse.json({ 
          success: false, 
          message: 'Advanced queues require at least one counter' 
        }, { status: 400 });
      }

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

      // If staff exists, validate counter assignments
      if (queueData.staff?.length) {
        for (const staff of queueData.staff) {
          if (!counterMap.has(staff.assignedCounter)) {
            return NextResponse.json({ 
              success: false, 
              message: 'Invalid counter assignment for staff member' 
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

    // For advanced type, insert counters and related data
    if (queueData.serviceType === 'advanced') {
      // Clean counter data before insertion
      const cleanedCounters = queueData.counters.map(counter => ({
        counter_id: counter.id,
        queue_id: queueData.id,
        name: counter.name,
        counter_type: queueData.staff?.length > 0 ? 'staff' : 'standard',
        status: 'active',
        service_start_time: counter.serviceStartTime || null,
        max_capacity: counter.maxCapacity ? parseInt(counter.maxCapacity) : 0
      }));

      const { data: counters, error: counterError } = await supabase
        .from('counters')
        .insert(cleanedCounters)
        .select();

      if (counterError) {
        await supabase
          .from('queues')
          .delete()
          .eq('queue_id', queueData.id);
        throw counterError;
      }

      // Insert services if they exist
      if (queueData.services?.length) {
        const serviceEntries = queueData.services.flatMap(service => 
          service.linkedCounters.map(counterId => ({
            service_id: service.id,
            counter_id: counterId,
            name: service.name,
            description: service.description || null,
            estimated_time: service.estTimeToServe ? parseInt(service.estTimeToServe) : null,
            price: service.price ? parseFloat(service.price) : null,
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
        const cleanedStaff = queueData.staff.map(staff => ({
          staff_id: staff.id,
          counter_id: staff.assignedCounter,
          name: staff.name,
          specialization: staff.role,
          experience_years: null, // Add default values for required fields
          rating: 4.0, // Default rating as per schema
          review_count: 0 // Default count
        }));

        const { error: staffError } = await supabase
          .from('staff_details')
          .insert(cleanedStaff);

        if (staffError) {
          await supabase
            .from('services')
            .delete()
            .in('counter_id', queueData.counters.map(c => c.id));
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