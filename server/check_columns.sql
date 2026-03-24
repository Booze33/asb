-- Check what columns exist in the appointments table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY column_name;