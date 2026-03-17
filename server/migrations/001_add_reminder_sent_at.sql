-- Add reminder_sent_at column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP;

-- Create index on reminder_sent_at for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent_at ON appointments(reminder_sent_at);

-- Create index on date_time for better query performance in scheduler
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date_time);

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

COMMENT ON COLUMN appointments.reminder_sent_at IS 'Timestamp when reminders were last scheduled for this appointment';