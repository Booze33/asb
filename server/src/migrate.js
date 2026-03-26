import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  let retries = 30; 
  
  while (retries > 0) {
    let client;
    try {
      console.log('Starting database migrations...');
      client = await pool.connect();
      
      console.log('Database connection established successfully');
      
      const migrationsDir = path.join(__dirname, '../migrations');
      
      if (!fs.existsSync(migrationsDir)) {
        throw new Error(`Migrations directory not found at: ${migrationsDir}`);
      }

      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      for (const file of files) {
        console.log(`Executing migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        // Wrap in a transaction so if one fails, it rolls back
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        console.log(`Migration ${file} completed successfully`);
      }
      
      console.log('All migrations completed successfully');
      return;
    } catch (error) {
      if (client) await client.query('ROLLBACK').catch(() => {});
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('connection')) {
        console.log(`Database not ready, waiting... (${retries} retries left)`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else {
        console.error('Migration failed:', error.message);
        process.exit(1);
      }
    } finally {
      if (client) client.release();
    }
  }
  
  console.error('Database connection timeout');
  process.exit(1);
}

// The ES Module equivalent of: if (require.main === module)
if (process.argv[1] === __filename) {
  runMigrations().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { runMigrations };