-- Create archived_notification_logs table for data retention
-- This table will store notification logs that are archived before appointment deletion
CREATE TABLE IF NOT EXISTS archived_notification_logs (
    id SERIAL PRIMARY KEY,
    original_id INTEGER NOT NULL,
    appointment_id INTEGER,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    notification_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    template_used VARCHAR(50),
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    archived_at TIMESTAMP DEFAULT NOW(),
    archive_reason VARCHAR(50) NOT NULL -- 'appointment_cleanup', 'manual_archive', etc.
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_archived_notification_logs_appointment_id ON archived_notification_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_archived_notification_logs_client_id ON archived_notification_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_archived_notification_logs_channel ON archived_notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_archived_notification_logs_notification_type ON archived_notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_archived_notification_logs_status ON archived_notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_archived_notification_logs_sent_at ON archived_notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_archived_notification_logs_archived_at ON archived_notification_logs(archived_at);

-- Add comments for documentation
COMMENT ON TABLE archived_notification_logs IS 'Archived notification logs for compliance and audit purposes';
COMMENT ON COLUMN archived_notification_logs.original_id IS 'ID of the original notification_log record';
COMMENT ON COLUMN archived_notification_logs.archive_reason IS 'Reason for archiving the notification log';

-- Update notification_logs table foreign key constraint to prevent cascade deletion
-- First, drop the existing constraint
ALTER TABLE notification_logs DROP CONSTRAINT IF EXISTS notification_logs_appointment_id_fkey;

-- Then, recreate it without CASCADE DELETE
ALTER TABLE notification_logs ADD CONSTRAINT notification_logs_appointment_id_fkey 
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- Update the table comment to reflect the change
COMMENT ON TABLE notification_logs IS 'Logs all notification attempts and results (appointment_id set to NULL on appointment deletion)';