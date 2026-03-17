-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL, -- 'email' or 'whatsapp'
    notification_type VARCHAR(20) NOT NULL, -- 'confirmation', 'reminder', 'cancellation', 'completed', 'missed'
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'error'
    template_used VARCHAR(50),
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_appointment_id ON notification_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_client_id ON notification_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);

-- Add comments for documentation
COMMENT ON TABLE notification_logs IS 'Logs all notification attempts and results';
COMMENT ON COLUMN notification_logs.channel IS 'Channel used for notification (email/whatsapp)';
COMMENT ON COLUMN notification_logs.notification_type IS 'Type of notification sent';
COMMENT ON COLUMN notification_logs.status IS 'Status of notification attempt';
COMMENT ON COLUMN notification_logs.template_used IS 'Template name used for the notification';
COMMENT ON COLUMN notification_logs.error_message IS 'Error message if notification failed';