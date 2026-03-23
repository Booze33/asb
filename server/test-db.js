const { Pool } = require('pg');

async function testDB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/salon_appointment_db'
  });

  try {
    console.log('Testing database connection...');
    
    // Check if appointments table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'appointments'
    `);
    
    console.log('Appointments table exists:', tableCheck.rows.length > 0);
    
    if (tableCheck.rows.length > 0) {
      // Check columns in appointments table
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        ORDER BY column_name
      `);
      
      console.log('Columns in appointments table:');
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testDB();