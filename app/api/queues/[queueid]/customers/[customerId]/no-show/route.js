import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PerformanceMonitor } from '../../../../../../../utils/performance';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function processNoShow(queueId, entryId) {
  const monitor = new PerformanceMonitor('processNoShow');
  
  try {
    monitor.markStep('initProcess');
    
    // Fetch queue entry and queue data in parallel
    const [entryResult, queueResult] = await Promise.all([
      supabase
        .from('queue_entries')
        .select('*')
        .match({ queue_id: queueId, entry_id: entryId })
        .single(),
      supabase
        .from('queues')
        .select('current_queue, est_time_to_serve')
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
    monitor.markStep('metricsCalculated');

    // Perform all database operations in parallel
    const [archiveResult, deleteResult] = await Promise.all([
      // Archive entry
      supabase
        .from('queue_entries_archive')
        .insert({
          queue_id: entryData.queue_id,
          user_id: entryData.user_id,
          status: 'no-show',
          wait_time: entryData.estimated_wait_time,
          actual_wait_time: actualWaitTime,
          join_time: entryData.join_time,
          leave_time: new Date().toISOString()
        }),
      // Delete entry
      supabase
        .from('queue_entries')
        .delete()
        .match({ queue_id: queueId, entry_id: entryId })
    ]);
    monitor.markStep('databaseOperations');

    if (archiveResult.error || deleteResult.error) {
      const errors = [
        archiveResult.error,
        deleteResult.error
      ].filter(Boolean);
      throw new Error(`Database operations failed: ${errors.map(e => e.message).join(', ')}`);
    }

    // Start background notification check
    const entriesPromise = supabase
      .from('queue_entries')
      .select('*')
      .eq('queue_id', queueId)
      .order('join_time', { ascending: true });
    monitor.markStep('notificationStarted');

    const result = {
      success: true,
      entriesPromise
    };
    monitor.markStep('resultPrepared');

    return result;
  } catch (error) {
    monitor.markStep('error');
    throw error;
  }
}

export async function POST(request, { params }) {
  const monitor = new PerformanceMonitor('noShowCustomer');
  const { queueid: queueId, customerId } = params;

  if (!queueId || !customerId) {
    return NextResponse.json({ 
      error: 'Invalid queue ID or customer ID',
      metrics: monitor.end()
    }, { status: 400 });
  }

  try {
    monitor.markStep('startProcess');
    const result = await processNoShow(queueId, customerId);
    monitor.markStep('processComplete');

    // Handle remaining entries check in background
    result.entriesPromise
      .then(({ data: entries, error }) => {
        if (!error && entries?.length >= 5) {
          // Implement notification logic here
          console.log('Background: Notifying 5th person in queue');
        }
      })
      .catch(error => {
        console.error('Background notification error:', error);
      });

    const metrics = monitor.end();
    
    return NextResponse.json({ 
      message: 'Customer marked as no-show and removed from queue',
      metrics
    });
  } catch (error) {
    console.error('Error marking customer as no-show:', error);
    const metrics = monitor.end();
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred',
      metrics 
    }, { status: 500 });
  }
}
