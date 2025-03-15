import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PerformanceMonitor } from '@/app/utils/performance';
import { NotificationService, NotificationTypes } from '../../../../../../../services/NotificationService';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const notificationService = new NotificationService();

export async function POST(request, { params }) {
  const monitor = new PerformanceMonitor('serveCustomer');
  const { queueid: queueId, customerId } = params;

  try {
    monitor.markStep('startProcess');
    const { queueData, customersInQueue } = await request.json();
    
    if (!queueData || !customersInQueue) {
      throw new Error('Missing required queue data');
    }

    const entryData = customersInQueue.find(c => c.entry_id === customerId);
    if (!entryData) {
      throw new Error('Customer not found in queue');
    }

    const fourthPerson = customersInQueue[2];
    monitor.markStep('dataProcessed');

    const actualWaitTime = Math.floor((new Date() - new Date(entryData.join_time)) / 60000);
    const newTotalServed = queueData.total_served + 1;
    monitor.markStep('metricsCalculated');

    // Prepare notifications but don't send yet
    const notifications = {
      fourthPerson: fourthPerson ? {
        type: NotificationTypes.TURN_APPROACHING,
        userId: fourthPerson.user_id,
        data: {
          customerName: fourthPerson.user_profile?.name || fourthPerson.name || 'Customer',
          queueName: queueData.name,
          timeLeft: Math.round(2 * queueData.est_time_to_serve).toString(),
          position: "3",
          expectedTime: new Date(Date.now() + (2 * queueData.est_time_to_serve * 60000))
            .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }
      } : null,
      servedCustomer: {
        type: NotificationTypes.CUSTOMER_SERVED,
        userId: entryData.user_id,
        data: {
          queueName: queueData.name,
          actualWaitTime: actualWaitTime.toString()
        }
      }
    };

    // Database operations
    const [archiveResult, deleteResult, updateResult] = await Promise.all([
      supabase.from('queue_entries_archive').insert({
        entry_id: entryData.entry_id,
        queue_id: entryData.queue_id,
        user_id: entryData.user_id,
        status: 'served',
        wait_time: entryData.estimated_wait_time,
        actual_wait_time: actualWaitTime,
        join_time: entryData.join_time,
        leave_time: new Date().toISOString(),
        added_by: entryData.added_by,
      }),
      supabase.from('queue_entries').delete()
        .match({ queue_id: queueId, entry_id: customerId }),
      supabase.from('queues').update({ 
        total_served: newTotalServed,
        next_serve_at: new Date().toISOString()
      })
      .eq('queue_id', queueId)
      .select()
      .single()
    ]);

    if (archiveResult.error || deleteResult.error || updateResult.error) {
      throw new Error('Database operation failed');
    }

    // Send notifications after successful database operations
    const notificationPromises = [];
    if (notifications.fourthPerson) {
      notificationPromises.push(
        notificationService.sendNotification(
          notifications.fourthPerson.type,
          notifications.fourthPerson.userId,
          notifications.fourthPerson.data
        )
      );
    }
    notificationPromises.push(
      notificationService.sendNotification(
        notifications.servedCustomer.type,
        notifications.servedCustomer.userId,
        notifications.servedCustomer.data
      )
    );

    // Handle notifications in background
    Promise.allSettled(notificationPromises)
      .then(results => {
        console.log('Notification promises settled:', {
          total: results.length,
          fulfilled: results.filter(r => r.status === 'fulfilled').length,
          rejected: results.filter(r => r.status === 'rejected').length
        });
      })
      .catch(console.error);

    monitor.markStep('complete');
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