import axios from 'axios';
import { supabase } from '../app/lib/supabase';

// Define WhatsApp template configurations
const WHATSAPP_TEMPLATES = {
  QUEUE_JOIN: {
    name: 'queue_joined',
    components: {
      body_1: { type: 'text', field: 'queueName' },
      body_2: { type: 'text', field: 'position' },
      body_3: { type: 'text', field: 'waitTime' }
    }
  },
  TURN_APPROACHING: {
    name: 'turn_approaching_alert',
    components: {
      body_1: { type: 'text', field: 'queueName' },
      body_2: { type: 'text', field: 'timeLeft' }
    }
  },
  CUSTOMER_SERVED: {
    name: 'queue_served_notification',
    components: {
      body_1: { type: 'text', field: 'queueName' },
      body_2: { type: 'text', field: 'actualWaitTime' }
    }
  }
};

export class NotificationService {
  constructor() {
    const requiredEnvVars = {
      MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
      MSG91_INTEGRATED_NUMBER: process.env.MSG91_INTEGRATED_NUMBER,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars);
    }

    this.msg91Config = {
      authKey: process.env.MSG91_AUTH_KEY,
      integratedNumber: process.env.MSG91_INTEGRATED_NUMBER
    };

    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'authkey': process.env.MSG91_AUTH_KEY
      }
    });
  }

  async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('whatsapp_enabled, sms_enabled, email_enabled')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return data || { 
      whatsapp_enabled: true,
      sms_enabled: true,
      email_enabled: true 
    };
  }

  async sendWhatsAppMessage(phone, templateType, data) {
    try {
      if (!phone.startsWith('+')) {
        phone = `+${phone.replace(/\D/g, '')}`;
      }

      const template = WHATSAPP_TEMPLATES[templateType];
      if (!template) {
        throw new Error(`Invalid template type: ${templateType}`);
      }

      const payload = {
        integrated_number: this.msg91Config.integratedNumber,
        content_type: "template",
        payload: {
          messaging_product: "whatsapp",
          type: "template",
          template: {
            name: template.name,
            language: {
              code: "en",
              policy: "deterministic"
            },
            to_and_components: [
              {
                to: [phone],
                components: Object.entries(template.components).reduce((acc, [key, config]) => {
                  acc[key] = {
                    type: 'text',
                    value: data[config.field]?.toString() || "0"
                  };
                  return acc;
                }, {})
              }
            ]
          }
        }
      };

      console.log('Sending WhatsApp message:', {
        phone,
        template: template.name,
        data
      });

      const response = await this.axiosInstance.post(
        'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
        payload
      );

      console.log('WhatsApp notification sent successfully:', {
        to: phone,
        template: template.name,
        response: response.data
      });

      return response.data;
    } catch (error) {
      console.error('WhatsApp notification failed:', {
        error: error.message,
        phone,
        template: templateType,
        response: error.response?.data
      });
      throw error;
    }
  }

  async sendNotification(type, userId, userData, data) {
    try {
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) return;

      const notifications = [];

      if (prefs.whatsapp_enabled && userData.phone) {
        notifications.push(
          this.sendWhatsAppMessage(userData.phone, type, data)
        );
      }

      // Add other notification methods here when implemented
      await Promise.allSettled(notifications);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
}

export const NotificationTypes = {
  QUEUE_JOIN: 'QUEUE_JOIN',
  TURN_APPROACHING: 'TURN_APPROACHING',
  CUSTOMER_SERVED: 'CUSTOMER_SERVED'
}; 