import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PerformanceMonitor } from '../../../../../../../utils/performance';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function processQueueEntry(queueId, entryId) {
  const monitor = new PerformanceMonitor('processQueueEntry');
  
  try {
    // Fetch queue entry and queue data in parallel
    const [entryResult, queueResult] = await Promise.all([
      supabase
        .from('queue_entries')
        .select('*')
        .match({ queue_id: queueId, entry_id: entryId })
        .single(),
      supabase
        .from('queues')
        .select('current_queue, total_served, est_time_to_serve')
        .eq('queue_id', queueId)
        .single()
    ]);
    monitor.markStep('fetchData');

    if (entryResult.error || queueResult.error) {
      throw new Error(entryResult.error?.message || queueResult.error?.message);
    }

    const entryData = entryResult.data;
    const queueData = queueResult.data;

    // Calculate metrics
    const actualWaitTime = Math.floor((new Date() - new Date(entryData.join_time)) / 60000);
    const newTotalServed = queueData.total_served + 1;

    const now = new Date();
    const nextServeAt = now; // Set next serve time to now since customer is being served

    // Perform all database operations in parallel
    const [archiveResult, deleteResult, updateResult] = await Promise.all([
      // Archive entry
      supabase
        .from('queue_entries_archive')
        .insert({
          queue_id: entryData.queue_id,
          user_id: entryData.user_id,
          status: 'served',
          wait_time: entryData.estimated_wait_time,
          actual_wait_time: actualWaitTime,
          join_time: entryData.join_time,
          leave_time: new Date().toISOString()
        }),
      // Delete entry
      supabase
        .from('queue_entries')
        .delete()
        .match({ queue_id: queueId, entry_id: entryId }),
      // Update queue
      supabase
        .from('queues')
        .update({ 
          total_served: newTotalServed,
          next_serve_at: nextServeAt.toISOString()
        })
        .eq('queue_id', queueId)
        .select()
        .single()
    ]);
    monitor.markStep('databaseOperations');

    if (archiveResult.error || deleteResult.error || updateResult.error) {
      throw new Error('Database operation failed');
    }

    monitor.end();
    return {
      success: true,
      updatedQueue: updateResult.data
    };
  } catch (error) {
    monitor.end();
    throw error;
  }
}

export async function POST(request, { params }) {
  const monitor = new PerformanceMonitor('serveCustomer');
  const { queueid: queueId, customerId } = params;

  if (!queueId || !customerId) {
    return NextResponse.json({ 
      error: 'Invalid queue ID or customer ID',
      metrics: monitor.end()
    }, { status: 400 });
  }

  try {
    monitor.markStep('startProcess');
    
    // Fetch queue entry and queue data in parallel
    const [entryResult, queueResult] = await Promise.all([
      supabase
        .from('queue_entries')
        .select('*')
        .match({ queue_id: queueId, entry_id: customerId })
        .single(),
      supabase
        .from('queues')
        .select('current_queue, total_served, est_time_to_serve')
        .eq('queue_id', queueId)
        .single()
    ]);
    monitor.markStep('dataFetch');

    if (entryResult.error || queueResult.error) {
      throw new Error(entryResult.error?.message || queueResult.error?.message);
    }

    const entryData = entryResult.data;
    const queueData = queueResult.data;

    // Calculate metrics
    const actualWaitTime = Math.floor((new Date() - new Date(entryData.join_time)) / 60000);
    const newTotalServed = queueData.total_served + 1;
    monitor.markStep('metricsCalculated');

    const now = new Date();
    const nextServeAt = now;

    // Perform all database operations in parallel
    const [archiveResult, deleteResult, updateResult] = await Promise.all([
      supabase
        .from('queue_entries_archive')
        .insert({
          queue_id: entryData.queue_id,
          user_id: entryData.user_id,
          status: 'served',
          wait_time: entryData.estimated_wait_time,
          actual_wait_time: actualWaitTime,
          join_time: entryData.join_time,
          leave_time: new Date().toISOString()
        }),
      supabase
        .from('queue_entries')
        .delete()
        .match({ queue_id: queueId, entry_id: customerId }),
      supabase
        .from('queues')
        .update({ 
          total_served: newTotalServed,
          next_serve_at: nextServeAt.toISOString()
        })
        .eq('queue_id', queueId)
        .select()
        .single()
    ]);
    monitor.markStep('databaseOperations');

    if (archiveResult.error || deleteResult.error || updateResult.error) {
      throw new Error('Database operation failed');
    }

    const metrics = monitor.end();
    
    return NextResponse.json({ 
      message: 'Customer served and removed from queue',
      queue: updateResult.data,
      metrics
    });
  } catch (error) {
    console.error('Error serving customer:', error);
    const metrics = monitor.end();
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred',
      metrics 
    }, { status: 500 });
  }
}