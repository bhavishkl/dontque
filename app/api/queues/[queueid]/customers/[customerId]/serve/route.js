import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PerformanceMonitor } from '../../../../../../../utils/performance';
import { NotificationService, NotificationTypes } from '../../../../../../../services/NotificationService';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const notificationService = new NotificationService();

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
    
    // Initial parallel data fetch - Get 4th person (changed from 3rd to 4th)
    const [fourthPersonResult, entryResult, queueResult] = await Promise.all([
      supabase
        .from('queue_entries')
        .select('entry_id, user_id')
        .eq('queue_id', queueId)
        .eq('status', 'waiting')
        .order('join_time', { ascending: true })
        .range(3, 3), // Changed: now gets 4th position (index 3)
      supabase
        .from('queue_entries')
        .select('*')
        .match({ queue_id: queueId, entry_id: customerId })
        .single(),
      supabase
        .from('queues')
        .select('current_queue, total_served, est_time_to_serve, name')
        .eq('queue_id', queueId)
        .single()
    ]);
    monitor.markStep('dataFetch');

    console.log('Fourth person query result:', {
      data: fourthPersonResult.data,
      error: fourthPersonResult.error,
      count: fourthPersonResult.data?.length
    });

    if (entryResult.error || queueResult.error) {
      throw new Error(entryResult.error?.message || queueResult.error?.message);
    }

    // Start preparing notifications in parallel with database operations
    const notificationPromises = [];
    
    // Prepare fourth person notification if exists
    if (fourthPersonResult.data?.[0]) {
      const fourthPerson = fourthPersonResult.data[0];
      
      console.log('Found fourth person:', {
        entryId: fourthPerson.entry_id,
        userId: fourthPerson.user_id
      });
      
      notificationPromises.push(
        (async () => {
          console.log('Fetching user data for fourth person notification');
          const { data: userData, error: userError } = await supabase
            .from('user_profile')
            .select('email, phone_number')
            .eq('user_id', fourthPerson.user_id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            return;
          }

          console.log('User data found:', {
            hasEmail: !!userData?.email,
            hasPhone: !!userData?.phone_number,
            userId: fourthPerson.user_id
          });

          if (userData) {
            const formattedPhone = userData?.phone_number?.startsWith('+') 
              ? userData.phone_number 
              : userData?.phone_number ? `+${userData.phone_number?.replace(/\D/g, '')}` : null;

            const timeLeft = Math.round(2 * queueResult.data.est_time_to_serve); // Changed: multiply by 4 for 4th position

            console.log('Sending approaching notification:', {
              userId: fourthPerson.user_id,
              queueName: queueResult.data.name,
              timeLeft,
              contactInfo: {
                hasEmail: !!userData.email,
                hasPhone: !!formattedPhone
              }
            });

            return notificationService.sendNotification(
              NotificationTypes.TURN_APPROACHING,
              fourthPerson.user_id,
              {
                email: userData.email,
                phone: formattedPhone
              },
              {
                queueName: queueResult.data.name,
                timeLeft: timeLeft
              }
            ).then(() => {
              console.log('Successfully initiated approaching notification');
            }).catch((error) => {
              console.error('Error sending approaching notification:', {
                error: error.message,
                userId: fourthPerson.user_id
              });
            });
          } else {
            console.log('No user data found for notification');
          }
        })()
      );
    } else {
      console.log('No fourth person found in queue');
    }

    // Calculate metrics
    const entryData = entryResult.data;
    const queueData = queueResult.data;
    const actualWaitTime = Math.floor((new Date() - new Date(entryData.join_time)) / 60000);
    const newTotalServed = queueData.total_served + 1;
    monitor.markStep('metricsCalculated');

    // Parallel database operations
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
          next_serve_at: new Date().toISOString()
        })
        .eq('queue_id', queueId)
        .select()
        .single()
    ]);
    monitor.markStep('databaseOperations');

    // Prepare served notification in parallel
    notificationPromises.push(
      (async () => {
        const { data: userData } = await supabase
          .from('user_profile')
          .select('email, phone_number')
          .eq('user_id', entryData.user_id)
          .single();

        if (userData) {
          const formattedPhone = userData?.phone_number?.startsWith('+') 
            ? userData.phone_number 
            : userData?.phone_number ? `+${userData.phone_number?.replace(/\D/g, '')}` : null;

          return notificationService.sendNotification(
            NotificationTypes.CUSTOMER_SERVED,
            entryData.user_id,
            {
              email: userData.email,
              phone: formattedPhone
            },
            {
              queueName: queueResult.data.name,
              actualWaitTime: actualWaitTime.toString()
            }
          );
        }
      })()
    );

    // Modified notification settlement logging
    Promise.allSettled(notificationPromises)
      .then(results => {
        console.log('Notification promises settled:', {
          total: results.length,
          fulfilled: results.filter(r => r.status === 'fulfilled').length,
          rejected: results.filter(r => r.status === 'rejected').length,
          errors: results
            .filter(r => r.status === 'rejected')
            .map(r => r.reason?.message)
        });
      })
      .catch(error => {
        console.error('Error in parallel notifications:', error);
      });

    monitor.markStep('notificationsInitiated');

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
    console.error('Error serving customer:', {
      error: error.message,
      queueId,
      customerId
    });
    const metrics = monitor.end();
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred',
      metrics 
    }, { status: 500 });
  }
}