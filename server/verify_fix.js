const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyFix() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name LIKE '%reminder%' 
      ORDER BY column_name
    `);
    
    console.log('Reminder-related columns in appointments table:');
    if (result.rows.length === 0) {
      console.log('No reminder-related columns found');
    } else {
      result.rows.forEach(row => {
        console.log(`${row.column_name}: ${row.data_type}`);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('Error verifying fix:', error);
  } finally {
    await pool.end();
  }
}

verifyFix();