-- Initialize database schema for Salon Appointment System

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    service VARCHAR(255) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reminder_sent_at TIMESTAMP
);

-- Create admin table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) DEFAULT 'Admin',
    role VARCHAR(20) DEFAULT 'admin',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Insert default admin user (username: admin, password: admin123, email: admin@example.com)
INSERT INTO admins (username, email, name, role, password_hash) 
VALUES ('admin', 'admin@example.com', 'Admin', 'admin', '$2b$10$iIItzgbc71wx2lTzG6pjmuEX0i.DyUrN.UOUsqOPZXx2mOMjMRP3S') 
ON CONFLICT (username) DO NOTHING;
