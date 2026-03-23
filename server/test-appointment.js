const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testAppointment() {
  try {
    console.log('Testing appointment creation...');
    
    // Test database connection
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    // Test creating a client
    const clientQuery = `
      INSERT INTO clients (name, email, phone, address, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const clientResult = await client.query(clientQuery, [
      'Test User',
      'test@example.com', 
      '555-1234',
      '123 Test St',
      '$2b$10$test.hash.for.testing'
    ]);
    
    console.log('Client created:', clientResult.rows[0]);
    
    // Test creating an appointment
    const appointmentQuery = `
      INSERT INTO appointments (client_id, date_time, duration, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const appointmentResult = await client.query(appointmentQuery, [
      clientResult.rows[0].id,
      new Date('2026-03-25T10:00:00.000Z'),
      60,
      'booked'
    ]);
    
    console.log('Appointment created:', appointmentResult.rows[0]);
    
    client.release();
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await pool.end();
  }
}

testAppointment();