import { twilioClient, whatsappConfig } from '../config/whatsapp';

export const sendWhatsAppMessage = async (
  to: string,
  body: string
) => {
  try {
    const message = await twilioClient.messages.create({
      body,
      from: `whatsapp:${whatsappConfig.phoneNumber}`,
      to: `whatsapp:${to}`,
    });

    return { success: true, message: 'WhatsApp message sent successfully', sid: message.sid };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, message: 'Failed to send WhatsApp message' };
  }
};