import Queue from 'bull';
import { NotificationService } from './NotificationService';

const notificationQueue = new Queue('notifications', process.env.REDIS_URL);
const notificationService = new NotificationService();

// Process notifications
notificationQueue.process(async (job) => {
  const { type, user, data, channels } = job.data;
  
  try {
    return await notificationService.send(type, user, data, channels);
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
});

// Add retry logic
notificationQueue.on('failed', async (job, err) => {
  if (job.attemptsMade < 3) {
    await job.retry();
  }
});

export async function queueNotification(type, user, data, channels) {
  return notificationQueue.add({
    type,
    user,
    data,
    channels
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}