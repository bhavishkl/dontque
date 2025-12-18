import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "@/lib/mock-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { NotificationService, NotificationTypes } from '@/services/NotificationService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const notificationService = new NotificationService();

export async function POST(request, { params }) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { queueid } = params;
    const { delayUntil, queueData, customersInQueue } = await request.json();

    console.log("Received queueData in /delay API:", queueData);
    console.log("service_start_time from queueData:", queueData.service_start_time);

    if (!delayUntil) {
      return NextResponse.json({ error: 'Delay time is required' }, { status: 400 });
    }

    // Update queue with delay information
    const { data: updatedQueue, error: updateError } = await supabase
      .from('queues')
      .update({ delayed_until: delayUntil })
      .eq('queue_id', queueid)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update queue',
        details: updateError.message 
      }, { status: 500 });
    }

    // Simple time format conversion from 24h to 12h
    const formatTime = (timeStr) => {
      if (!timeStr) return 'N/A';
      
      try {
        // Handle 24-hour time format (HH:mm:ss)
        if (timeStr.includes(':')) {
          const [hours, minutes] = timeStr.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'pm' : 'am';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes.padStart(2, '0')}${ampm}`;
        }
        
        // Fallback to date parsing if not in HH:mm:ss format
        const date = new Date(timeStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).toLowerCase().replace(/\s+/g, '');
        }
        
        return 'N/A';
      } catch (error) {
        console.error('Time formatting error:', error);
        return 'N/A';
      }
    };

    // Log the times before formatting
    console.log('Times before formatting:', {
      original: queueData.service_start_time,
      new: delayUntil
    });

    const originalTime = formatTime(queueData.service_start_time);
    const newTime = formatTime(delayUntil);

    // Log the formatted times
    console.log('Formatted times:', {
      original: originalTime,
      new: newTime
    });

    // Send notifications to all waiting customers
    const waitingCustomers = customersInQueue.filter(customer => customer.status === 'waiting');
    
    if (waitingCustomers.length > 0) {
      const notificationPromises = waitingCustomers.map((customer, index) => {
        const notificationData = {
          queueName: queueData.name,
          originalTime: originalTime,
          newTime: newTime,
          statusUrl: queueid
        };

        // Log notification data for debugging
        console.log('Sending notification with data:', notificationData);

        return new Promise(async (resolve) => {
          await new Promise(r => setTimeout(r, index * 1000));
          try {
            const result = await notificationService.sendNotification(
              NotificationTypes.QUEUE_DELAY,
              customer.user_id,
              notificationData
            );
            resolve({ success: true, customer, result });
          } catch (error) {
            console.error('Notification error:', error);
            resolve({ success: false, customer, error });
          }
        });
      });

      // Handle notifications in background
      Promise.allSettled(notificationPromises)
        .then(results => {
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const failedCount = results.filter(r => r.status === 'rejected').length;
          console.log(`Sent ${successCount} delay notifications, ${failedCount} failed`);
          
          // Log failed notifications for debugging
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Failed to send notification to customer ${waitingCustomers[index].user_id}:`, result.reason);
            }
          });
        })
        .catch(error => {
          console.error('Error sending delay notifications:', error);
        });
    }

    return NextResponse.json({
      message: 'Delay added successfully',
      queue: updatedQueue
    });

  } catch (error) {
    console.error('Error processing delay:', error);
    return NextResponse.json({ 
      error: 'Failed to process delay request',
      details: error.message
    }, { status: 500 });
  }
}
