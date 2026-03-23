-- Add address column to existing clients table

-- Add address column to clients table if it doesn't exist
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;

-- Update existing clients with default addresses for seed data compatibility
UPDATE clients SET address = '123 Main St, Austin, TX 78701' WHERE address IS NULL AND email = 'john.doe@example.com';
UPDATE clients SET address = '456 Oak Ave, Austin, TX 78702' WHERE address IS NULL AND email = 'jane.smith@example.com';
UPDATE clients SET address = '789 Pine St, Austin, TX 78703' WHERE address IS NULL AND email = 'bob.johnson@example.com';
UPDATE clients SET address = '321 Elm St, Austin, TX 78704' WHERE address IS NULL AND email = 'alice.brown@example.com';
UPDATE clients SET address = '654 Maple Ave, Austin, TX 78705' WHERE address IS NULL AND email = 'charlie.wilson@example.com';