import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
config();

// Use the DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Configure SSL based on environment
const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';
const sslConfig = isRender ? {
  rejectUnauthorized: false // nécessaire sur Render
} : false;

const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: sslConfig
});

// Test the database connection
async function testConnection() {
  let client;
  try {
    console.log('🔍 Testing database connection...');
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('🕐 Database time:', result.rows[0].now);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testConnection().then(success => {
  if (!success) {
    process.exit(1);
  }
});