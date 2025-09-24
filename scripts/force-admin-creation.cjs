#!/usr/bin/env node

/**
 * Script d'urgence pour créer l'admin sur Render
 * À exécuter manuellement si l'initialisation automatique échoue
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createAdminForce() {
  console.log('🚨 FORCE ADMIN CREATION - Starting...');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ No DATABASE_URL found');
    process.exit(1);
  }

  console.log('📍 Found DATABASE_URL');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected');

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    console.log('👤 Creating admin user...');
    const query = `
      INSERT INTO users (username, email, password, role, "createdAt", "updatedAt")
      VALUES ('admin', 'admin@streamkji.com', $1, 'admin', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        "updatedAt" = NOW()
    `;

    await client.query(query, [hashedPassword]);
    console.log('✅ Admin user created/updated');

    await client.end();
    console.log('🎯 SUCCESS: Admin created!');
    console.log('📧 Email: admin@streamkji.com');
    console.log('🔒 Password: admin123');
    console.log('⚠️  IMPORTANT: Change password after login!');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createAdminForce();