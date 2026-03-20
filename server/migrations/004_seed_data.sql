-- Seed data for Salon Appointment System

-- Insert sample clients
INSERT INTO clients (name, email, phone, password_hash) VALUES
('John Doe', 'john.doe@example.com', '+1234567890', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Jane Smith', 'jane.smith@example.com', '+1234567891', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Bob Johnson', 'bob.johnson@example.com', '+1234567892', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Alice Brown', 'alice.brown@example.com', '+1234567893', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('Charlie Wilson', 'charlie.wilson@example.com', '+1234567894', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (email) DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (client_id, service, date, duration, status, notes) VALUES
((SELECT id FROM clients WHERE email = 'john.doe@example.com'), 'Haircut', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '9 hours', 60, 'booked', 'First time client'),
((SELECT id FROM clients WHERE email = 'jane.smith@example.com'), 'Hair Color', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours' + INTERVAL '30 minutes', 120, 'booked', 'Full color treatment'),
((SELECT id FROM clients WHERE email = 'bob.johnson@example.com'), 'Haircut', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours', 45, 'booked', 'Regular haircut'),
((SELECT id FROM clients WHERE email = 'alice.brown@example.com'), 'Hair Styling', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '11 hours', 90, 'booked', 'Bridal styling'),
((SELECT id FROM clients WHERE email = 'charlie.wilson@example.com'), 'Haircut', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '15 hours', 60, 'booked', 'Trim and style'),
((SELECT id FROM clients WHERE email = 'john.doe@example.com'), 'Hair Color', CURRENT_DATE + INTERVAL '7 days' + INTERVAL '10 hours', 180, 'pending', 'Root touch up'),
((SELECT id FROM clients WHERE email = 'jane.smith@example.com'), 'Haircut', CURRENT_DATE + INTERVAL '8 days' + INTERVAL '13 hours', 60, 'pending', 'Regular maintenance'),
((SELECT id FROM clients WHERE email = 'bob.johnson@example.com'), 'Hair Styling', CURRENT_DATE + INTERVAL '9 days' + INTERVAL '16 hours', 120, 'pending', 'Special occasion'),
((SELECT id FROM clients WHERE email = 'alice.brown@example.com'), 'Haircut', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours', 60, 'completed', 'Great service'),
((SELECT id FROM clients WHERE email = 'charlie.wilson@example.com'), 'Hair Color', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours', 150, 'completed', 'Loved the color'),
((SELECT id FROM clients WHERE email = 'john.doe@example.com'), 'Haircut', CURRENT_DATE + INTERVAL '3 days' + INTERVAL '11 hours', 60, 'cancelled', 'Client cancelled due to emergency'),
((SELECT id FROM clients WHERE email = 'jane.smith@example.com'), 'Hair Styling', CURRENT_DATE + INTERVAL '4 days' + INTERVAL '15 hours', 120, 'cancelled', 'Rescheduled for next week'),
((SELECT id FROM clients WHERE email = 'bob.johnson@example.com'), 'Haircut', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '16 hours', 60, 'missed', 'No show'),
((SELECT id FROM clients WHERE email = 'alice.brown@example.com'), 'Hair Color', CURRENT_DATE + INTERVAL '5 days' + INTERVAL '9 hours', 180, 'confirmed', 'Confirmed via email'),
((SELECT id FROM clients WHERE email = 'charlie.wilson@example.com'), 'Haircut', CURRENT_DATE + INTERVAL '6 days' + INTERVAL '13 hours', 45, 'confirmed', 'Confirmed via phone')
ON CONFLICT DO NOTHING;

-- Update timestamps
UPDATE clients SET updated_at = CURRENT_TIMESTAMP - INTERVAL '1 day' WHERE email IN ('john.doe@example.com', 'jane.smith@example.com');
UPDATE appointments SET updated_at = CURRENT_TIMESTAMP - INTERVAL '1 day' WHERE status IN ('completed', 'cancelled', 'missed');
UPDATE appointments SET reminder_sent_at = date - INTERVAL '1 hour' WHERE status = 'completed';

-- Insert additional admin users
INSERT INTO admins (username, email, name, role, password_hash) VALUES
('manager', 'manager@example.com', 'Store Manager', 'manager', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('receptionist', 'receptionist@example.com', 'Front Desk', 'staff', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT DO NOTHING;

-- Notification logs: confirmation (completed appointments)
-- FIX: PostgreSQL does not allow LIMIT directly in INSERT...SELECT.
-- The SELECT must be wrapped in a subquery for LIMIT to be valid.
INSERT INTO notification_logs (appointment_id, client_id, channel, notification_type, status, template_used, sent_at)
SELECT * FROM (
    SELECT
        a.id,
        a.client_id,
        'email'::VARCHAR,
        'confirmation'::VARCHAR,
        'success'::VARCHAR,
        'appointment_confirmation'::VARCHAR,
        a.created_at + INTERVAL '1 minute'
    FROM appointments a
    WHERE a.status = 'completed'
    LIMIT 3
) sub;

-- Notification logs: reminder (completed appointments)
INSERT INTO notification_logs (appointment_id, client_id, channel, notification_type, status, template_used, sent_at)
SELECT * FROM (
    SELECT
        a.id,
        a.client_id,
        'email'::VARCHAR,
        'reminder'::VARCHAR,
        'success'::VARCHAR,
        'appointment_reminder'::VARCHAR,
        a.date - INTERVAL '1 hour'
    FROM appointments a
    WHERE a.status = 'completed'
    LIMIT 3
) sub;

-- Notification logs: failed reminders (booked appointments)
INSERT INTO notification_logs (appointment_id, client_id, channel, notification_type, status, template_used, error_message, sent_at)
SELECT * FROM (
    SELECT
        a.id,
        a.client_id,
        'email'::VARCHAR,
        'reminder'::VARCHAR,
        'failed'::VARCHAR,
        'appointment_reminder'::VARCHAR,
        'Email delivery failed: recipient mailbox full'::TEXT,
        CURRENT_TIMESTAMP - INTERVAL '1 hour'
    FROM appointments a
    WHERE a.status = 'booked'
    LIMIT 2
) sub;

-- Update john.doe phone
UPDATE clients SET phone = '+1234567899', updated_at = CURRENT_TIMESTAMP WHERE email = 'john.doe@example.com';

-- Add organic product note to jane.smith booked appointments
UPDATE appointments SET
    notes = notes || ' - Special request: use organic products'
WHERE client_id = (SELECT id FROM clients WHERE email = 'jane.smith@example.com') AND status = 'booked';

-- Adjust duration for some haircut bookings
-- NOTE: LIMIT in UPDATE is also not standard PostgreSQL. Use a subquery to target specific rows.
UPDATE appointments SET duration = 30
WHERE id IN (
    SELECT id FROM appointments WHERE service = 'Haircut' AND status = 'booked' LIMIT 2
);

-- Weekend appointments
INSERT INTO appointments (client_id, service, date, duration, status, notes) VALUES
((SELECT id FROM clients WHERE email = 'bob.johnson@example.com'), 'Haircut', CURRENT_DATE + INTERVAL '10 days' + INTERVAL '10 hours', 60, 'pending', 'Weekend appointment'),
((SELECT id FROM clients WHERE email = 'alice.brown@example.com'), 'Hair Color', CURRENT_DATE + INTERVAL '11 days' + INTERVAL '14 hours', 180, 'pending', 'Weekend full color')
ON CONFLICT DO NOTHING;

-- Seed completion log
INSERT INTO notification_logs (appointment_id, client_id, channel, notification_type, status, template_used, sent_at) VALUES
(NULL, NULL, 'system', 'seed_complete', 'success', 'database_seed', CURRENT_TIMESTAMP);