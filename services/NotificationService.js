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

// Define Email template configurations for MSG91
const EMAIL_TEMPLATES = {
  QUEUE_JOIN: {
    template_id: "template_02_03_2025_18_03_2",
    variables: {
      queueName: "QUEUE_NAME",
      position: "POSITION",
      waitTime: "WAIT_TIME"
    }
  },
  TURN_APPROACHING: {
    template_id: "turn_approaching_template_id",
    variables: {
      queueName: "QUEUE_NAME",
      timeLeft: "TIME_LEFT",
      businessName: "BUSINESS_NAME"
    }
  },
  CUSTOMER_SERVED: {
    template_id: "customer_served_template_id",
    variables: {
      queueName: "QUEUE_NAME",
      actualWaitTime: "ACTUAL_WAIT_TIME",
      businessName: "BUSINESS_NAME",
      feedbackUrl: "FEEDBACK_URL"
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
      },
      timeout: 10000 // 10 seconds timeout
    });
  }

  async getUserPreferences(userId) {
    console.log('Fetching notification preferences for user:', userId);
    
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('whatsapp_enabled, sms_enabled, email_enabled')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user preferences:', error);
      
      // Check if it's a "not found" error
      if (error.code === 'PGRST116') {
        console.log('No preferences found, using default preferences');
        // Return default preferences if none exist
        return {
          whatsapp_enabled: true,
          sms_enabled: false,
          email_enabled: true
        };
      }
      
      return null;
    }

    console.log('User preferences found:', data);
    return data;
  }

  async getUserContactInfo(userId) {
    try {
      console.log('Fetching contact info for user:', userId);
      
      const { data: userData, error } = await supabase
        .from('user_profile')
        .select('email, phone_number, name')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user contact info:', error);
        return null;
      }
      
      // Format phone number to E.164 format if not already formatted
      const formattedPhone = userData?.phone_number?.startsWith('+') 
        ? userData.phone_number 
        : userData?.phone_number ? `+${userData.phone_number?.replace(/\D/g, '')}` : null;
      
      const contactInfo = {
        email: userData?.email,
        phone: formattedPhone,
        name: userData?.name
      };
      
      console.log('User contact info retrieved:', contactInfo);
      return contactInfo;
    } catch (error) {
      console.error('Error in getUserContactInfo:', error);
      return null;
    }
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

      const response = await axios({
        url: 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.msg91Config.authKey
        },
        data: payload,
        timeout: 30000, // Increase timeout to 30 seconds
        retry: 3, // Add retry capability
        retryDelay: (retryCount) => {
          return retryCount * 2000; // Progressive delay: 2s, 4s, 6s
        }
      });

      console.log('WhatsApp notification sent successfully:', {
        to: phone,
        template: template.name,
        response: response.data
      });

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error(`WhatsApp notification timeout for ${phone}: ${error.message}`);
        // You might want to queue this for retry later
      }
      throw error;
    }
  }

  async sendEmailMessage(email, templateType, data, name = '') {
    try {
      if (!email) {
        throw new Error('Email address is required');
      }

      const template = EMAIL_TEMPLATES[templateType];
      if (!template) {
        throw new Error(`Invalid email template type: ${templateType}`);
      }

      // Prepare variables for the template
      const variables = {};
      Object.entries(template.variables).forEach(([key, placeholder]) => {
        variables[placeholder] = data[key]?.toString() || '';
      });

      const payload = {
        recipients: [
          {
            to: [
              {
                email: email,
                name: name
              }
            ],
            variables: variables
          }
        ],
        from: {
          email: `no-reply@${process.env.MSG91_REGISTERED_DOMAIN}`
        },
        domain: process.env.MSG91_REGISTERED_DOMAIN,
        template_id: template.template_id
      };

      console.log('Sending email notification:', {
        email,
        template: template.template_id,
        data,
        payload: JSON.stringify(payload)
      });

      const response = await this.axiosInstance.post(
        'https://api.msg91.com/api/v5/email/send',
        payload
      );

      console.log('Email notification sent successfully:', {
        to: email,
        template: template.template_id,
        response: response.data
      });

      return response.data;
    } catch (error) {
      console.error('Email notification failed:', {
        error: error.message,
        email,
        template: templateType,
        response: error.response?.data,
        stack: error.stack
      });
      return null;
    }
  }

  async sendNotification(type, userId, data) {
    try {
      console.log('Starting notification process for user:', userId, 'type:', type);
      console.log('Notification data:', data);
      
      // Get user preferences
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) {
        console.error('Failed to get user preferences, aborting notification');
        return false;
      }
      
      // Get user contact information
      const contactInfo = await this.getUserContactInfo(userId);
      if (!contactInfo) {
        console.error('Failed to get user contact info, aborting notification');
        return false;
      }
      
      console.log('Preparing to send notifications with preferences:', prefs);
      const notifications = [];

      if (prefs.whatsapp_enabled && contactInfo.phone) {
        console.log('WhatsApp notification enabled and phone available');
        notifications.push(
          this.sendWhatsAppMessage(contactInfo.phone, type, data)
        );
      } else {
        console.log('Skipping WhatsApp notification:', 
          !prefs.whatsapp_enabled ? 'disabled in preferences' : 'no phone number');
      }

      if (prefs.email_enabled && contactInfo.email) {
        console.log('Email notification enabled and email available');
        notifications.push(
          this.sendEmailMessage(contactInfo.email, type, data, contactInfo.name || '')
        );
      } else {
        console.log('Skipping email notification:', 
          !prefs.email_enabled ? 'disabled in preferences' : 'no email address');
      }

      if (notifications.length === 0) {
        console.log('No notifications to send based on preferences and contact info');
        return false;
      }

      console.log(`Sending ${notifications.length} notification(s)`);
      const results = await Promise.allSettled(notifications);
      
      console.log('Notification results:', results);
      
      // Check if any notifications succeeded
      const anySuccess = results.some(r => r.status === 'fulfilled' && r.value !== null);
      return anySuccess;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return false;
    }
  }
}

export const NotificationTypes = {
  QUEUE_JOIN: 'QUEUE_JOIN',
  TURN_APPROACHING: 'TURN_APPROACHING',
  CUSTOMER_SERVED: 'CUSTOMER_SERVED'
}; 