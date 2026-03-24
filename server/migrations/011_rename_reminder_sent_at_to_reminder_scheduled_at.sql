-- Migration to ensure reminder_scheduled_at column exists
-- This handles the case where reminder_sent_at might already be renamed or doesn't exist

-- Add the reminder_scheduled_at column if it doesn't already exist
-- This is safer than trying to rename an existing column
ALTER TABLE IF EXISTS appointments ADD COLUMN IF NOT EXISTS reminder_scheduled_at TIMESTAMP;

-- Add comment to the column
COMMENT ON COLUMN appointments.reminder_scheduled_at IS 'Timestamp when reminder jobs were scheduled (not when actually sent)';

-- If reminder_sent_at exists, we'll leave it as is for now to avoid breaking anything
-- The application should use reminder_scheduled_at going forward
