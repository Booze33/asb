import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

export const whatsappConfig = {
  apiKey: process.env.WHATSAPP_API_KEY,
  phoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
};

// Create Twilio client
export const twilioClient = twilio(process.env.WHATSAPP_API_KEY, process.env.WHATSAPP_AUTH_TOKEN || '');
