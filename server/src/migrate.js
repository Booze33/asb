const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  let retries = 30; // Wait up to 5 minutes (30 * 10 seconds)
  
  while (retries > 0) {
    try {
      console.log('Starting database migrations...');
      
      const client = await pool.connect();
      
      // Read and execute migration files
      const migrationsDir = path.join(__dirname, '../migrations');
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      
      for (const file of files) {
        console.log(`Executing migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
        console.log(`Migration ${file} completed successfully`);
      }
      
      client.release();
      console.log('All migrations completed successfully');
      return;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('connection')) {
        console.log(`Database not ready, waiting... (${retries} retries left)`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      } else {
        console.error('Migration failed:', error);
        process.exit(1);
      }
    }
  }
  
  console.error('Database connection timeout - could not connect after 5 minutes');
  process.exit(1);
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
