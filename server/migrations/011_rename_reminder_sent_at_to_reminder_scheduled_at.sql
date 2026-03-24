-- Rename reminder_sent_at to reminder_scheduled_at
-- This fixes the semantic issue where the column was being set when jobs were scheduled,
-- not when notifications were actually sent

ALTER TABLE appointments RENAME COLUMN reminder_sent_at TO reminder_scheduled_at;

-- Update the column comment to reflect its new purpose
COMMENT ON COLUMN appointments.reminder_scheduled_at IS 'Timestamp when reminder jobs were scheduled (not when actually sent)';