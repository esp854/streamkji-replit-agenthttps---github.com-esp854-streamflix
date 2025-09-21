import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { config } from 'dotenv';
import * as schema from '@shared/schema';

config();

async function addBannedField() {
  console.log('🔧 Adding banned field to users table...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
  }
  
  const client = new Client({
    connectionString: databaseUrl,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const db = drizzle(client, { schema });
    
    // Add banned column to users table
    console.log('🏗️  Adding banned column to users table...');
    
    // Check if column already exists
    const columnsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'banned'
    `);
    
    if (columnsCheck.rowCount === 0) {
      await client.query('ALTER TABLE users ADD COLUMN banned BOOLEAN DEFAULT false NOT NULL');
      console.log('✅ Added banned column');
    } else {
      console.log('ℹ️  banned column already exists');
    }
    
    await client.end();
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

addBannedField().catch(console.error);