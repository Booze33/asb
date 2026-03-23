const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testDBStructure() {
  try {
    console.log('Testing database structure...');
    
    const client = await pool.connect();
    
    // Check if appointments table exists and has date_time column
    const tableCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name IN ('date_time', 'date')
      ORDER BY column_name
    `);
    
    console.log('Appointments table columns:');
    tableCheck.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if indexes exist
    const indexCheck = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'appointments'
      AND indexname LIKE '%date%'
    `);
    
    console.log('\nAppointments table indexes:');
    indexCheck.rows.forEach(row => {
      console.log(`  ${row.indexname}: ${row.indexdef}`);
    });
    
    // Test inserting a record
    console.log('\nTesting appointment insertion...');
    const insertTest = await client.query(`
      INSERT INTO appointments (client_id, service, date_time, duration, status)
      VALUES (1, 'Test Service', NOW() + INTERVAL '1 day', 60, 'booked')
      RETURNING *
    `);
    
    console.log('Test appointment created successfully:', insertTest.rows[0]);
    
    // Clean up test record
    await client.query('DELETE FROM appointments WHERE id = $1', [insertTest.rows[0].id]);
    
    client.release();
    console.log('\nDatabase structure test completed successfully!');
    
  } catch (error) {
    console.error('Database structure test failed:', error);
  } finally {
    await pool.end();
  }
}

testDBStructure();