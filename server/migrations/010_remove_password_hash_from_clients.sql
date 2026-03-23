-- Remove password_hash column from clients table since clients don't need passwords

-- Remove the password_hash column from clients table if it exists
ALTER TABLE clients DROP COLUMN IF EXISTS password_hash;