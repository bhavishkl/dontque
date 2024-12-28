import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import { supabase } from '../app/lib/supabase';

export class NotificationService {
  constructor() {
    // Validate required environment variables
    const requiredEnvVars = {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars);
    }

    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return data || {
      email_enabled: true,
      sms_enabled: true,
      whatsapp_enabled: false
    };
  }

  async sendNotification(type, userId, userData, data) {
    // Fire and forget - don't await this
    this.sendNotificationAsync(type, userId, userData, data).catch(error => {
      console.error('Background notification error:', error);
    });
  }

  async sendNotificationAsync(type, userId, userData, data) {
    try {
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) return;

      const template = this.getTemplate(type, data);
      const notifications = [];

      if (prefs.whatsapp_enabled && userData.phone) {
        try {
          if (!process.env.TWILIO_WHATSAPP_NUMBER) {
            throw new Error('TWILIO_WHATSAPP_NUMBER environment variable is not configured');
          }

          const whatsappMessage = await this.twilioClient.messages.create({
            body: template.whatsapp,
            to: `whatsapp:${userData.phone}`,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
          });
          console.log('WhatsApp notification sent:', {
            sid: whatsappMessage.sid,
            to: userData.phone,
            from: process.env.TWILIO_WHATSAPP_NUMBER
          });
        } catch (whatsappError) {
          console.error('WhatsApp notification failed:', {
            error: whatsappError.message,
            code: whatsappError.code,
            phone: userData.phone,
            whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER
          });
        }
      }

      if (prefs.sms_enabled && userData.phone) {
        notifications.push(
          this.twilioClient.messages.create({
            body: template.sms,
            to: userData.phone,
            from: process.env.TWILIO_PHONE_NUMBER
          })
        );
      }

      if (prefs.email_enabled && userData.email) {
        notifications.push(
          sgMail.send({
            to: userData.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: template.email.subject,
            html: template.email.html,
          })
        );
      }

      await Promise.allSettled(notifications);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  getTemplate(type, data) {
    switch (type) {
      case 'QUEUE_JOIN':
        return {
          sms: `You've joined ${data.queueName}. Position: ${data.position}. Est. wait: ${data.waitTime} mins.`,
          whatsapp: `🎫 *Queue Join Confirmation*\n\n` +
            `Welcome to *${data.queueName}*! Your spot has been reserved.\n\n` +
            `📍 *Your Position:* ${data.position}\n` +
            `⏱️ *Estimated Wait Time:* ${data.waitTime} minutes\n\n` +
            `We'll notify you when:\n` +
            `• Your turn is approaching\n` +
            `• There are any updates to the queue\n\n` +
            `_Reply with:_\n` +
            `• *STATUS* - to check your current position\n` +
            `• *LEAVE* - to exit the queue\n\n` +
            `Thank you for using our service! 🙏`,
          email: {
            subject: `Queue Join Confirmation - ${data.queueName}`,
            html: `
              <h2>Queue Join Confirmation</h2>
              <p>You have successfully joined the queue.</p>
              <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <p><strong>Queue:</strong> ${data.queueName}</p>
                <p><strong>Position:</strong> ${data.position}</p>
                <p><strong>Estimated Wait Time:</strong> ${data.waitTime} minutes</p>
              </div>
            `
          }
        };

      case 'TURN_APPROACHING':
        return {
          sms: `Your turn is approaching at ${data.queueName}. Please be ready in ${data.timeLeft} minutes.`,
          whatsapp: `🔔 *Your Turn is Approaching!*\n\n` +
            `Get ready! You'll be served soon at *${data.queueName}*\n\n` +
            `⏰ *Time Remaining:* ${data.timeLeft} minutes\n\n` +
            `_Please ensure you're ready when called._\n\n` +
            `Can't make it? Reply with *LEAVE* to exit the queue.\n\n` +
            `See you soon! 👋`,
          email: {
            subject: `Your Turn is Approaching - ${data.queueName}`,
            html: `
              <h2>Your Turn is Approaching</h2>
              <p>Please be ready for your turn.</p>
              <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <p><strong>Queue:</strong> ${data.queueName}</p>
                <p><strong>Time Remaining:</strong> ${data.timeLeft} minutes</p>
              </div>
            `
          }
        };

      // Add more notification types as needed
      default:
        throw new Error(`Invalid notification type: ${type}`);
    }
  }
}

export const NotificationTypes = {
  QUEUE_JOIN: 'QUEUE_JOIN',
  TURN_APPROACHING: 'TURN_APPROACHING',
  QUEUE_LEAVE: 'QUEUE_LEAVE',
  QUEUE_CANCELLED: 'QUEUE_CANCELLED'
}; 