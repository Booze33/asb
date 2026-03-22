-- Update admin passwords to use correct hash for 'admin123'
-- This fixes the password verification issue

UPDATE admins 
SET password_hash = '$2b$10$iIItzgbc71wx2lTzG6pjmuEX0i.DyUrN.UOUsqOPZXx2mOMjMRP3S'
WHERE username IN ('admin', 'manager', 'receptionist');

-- Log the password update
INSERT INTO notification_logs (appointment_id, client_id, channel, notification_type, status, template_used, sent_at) 
VALUES (NULL, NULL, 'system', 'password_update', 'success', 'admin_password_fix', CURRENT_TIMESTAMP);

-- Verify the update
SELECT username, email, password_hash FROM admins WHERE username IN ('admin', 'manager', 'receptionist');