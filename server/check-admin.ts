import { config } from "dotenv";
import { Client } from 'pg';

// Charger les variables d'environnement
config();

async function checkAdmin() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Checking for admin user...');
    await client.connect();
    console.log('✅ Database connection successful!');
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    
    if (tableCheck.rowCount === 0) {
      console.log('❌ Users table does not exist');
      return;
    }
    
    // Check for admin users (using the correct column name)
    // First, let's see what columns exist in the users table
    const columnCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    console.log('📋 Users table columns:');
    columnCheck.rows.forEach(column => {
      console.log(`  - ${column.column_name} (${column.data_type})`);
    });
    
    // Check for admin users using the 'role' column if it exists, otherwise check for 'admin' column
    let adminQuery = '';
    const columnNames = columnCheck.rows.map(row => row.column_name);
    
    if (columnNames.includes('role')) {
      adminQuery = `
        SELECT id, username, email, role 
        FROM users 
        WHERE role = 'admin'
      `;
    } else if (columnNames.includes('is_admin')) {
      adminQuery = `
        SELECT id, username, email, is_admin 
        FROM users 
        WHERE is_admin = true
      `;
    } else if (columnNames.includes('admin')) {
      adminQuery = `
        SELECT id, username, email, admin 
        FROM users 
        WHERE admin = true
      `;
    } else {
      // If no obvious admin column, just show all users
      adminQuery = `
        SELECT id, username, email 
        FROM users
      `;
      console.log('⚠️  No obvious admin column found, showing all users:');
    }
    
    const adminUsers = await client.query(adminQuery);
    
    if (adminUsers.rowCount === 0) {
      console.log('❌ No admin users found');
    } else {
      console.log(`✅ Found ${adminUsers.rowCount} user(s):`);
      adminUsers.rows.forEach(user => {
        if ('role' in user) {
          console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
        } else if ('is_admin' in user) {
          console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Is Admin: ${user.is_admin}`);
        } else if ('admin' in user) {
          console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Admin: ${user.admin}`);
        } else {
          console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
        }
      });
    }
    
    await client.end();
  } catch (error: any) {
    console.error('❌ Error checking admin users:', error.message);
    process.exit(1);
  }
}

checkAdmin();