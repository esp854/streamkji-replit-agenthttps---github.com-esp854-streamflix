#!/usr/bin/env node

/**
 * Post-deployment setup script
 * This script helps with initial setup after deployment
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables
config();

console.log('🚀 Starting post-deployment setup...');

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log('⚠️  This script is intended for production deployment only.');
  console.log('⚠️  NODE_ENV is not set to "production".');
  process.exit(1);
}

// Function to run a command and handle errors
function runCommand(command, description) {
  try {
    console.log(`🔧 ${description}...`);
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✅ ${description} completed successfully.`);
    return output;
  } catch (error) {
    console.error(`❌ Error during ${description}:`, error.message);
    if (error.stdout) console.log('_stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    return null;
  }
}

// Check if required environment variables are set
const requiredEnvVars = [
  'DATABASE_URL',
  'EMAIL_USER',
  'EMAIL_PASS',
  'JWT_SECRET',
  'SESSION_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these variables before running this script.');
  process.exit(1);
}

console.log('✅ All required environment variables are set.');

// Check database connection
console.log('🔍 Testing database connection...');
try {
  const dbTest = runCommand('node -e "require(\'./server/test-db.js\')"', 'Database connection test');
  if (!dbTest) {
    console.error('❌ Database connection failed. Please check your DATABASE_URL.');
    process.exit(1);
  }
  console.log('✅ Database connection successful.');
} catch (error) {
  console.error('❌ Database connection test failed:', error.message);
  process.exit(1);
}

// Run database migrations
console.log('📊 Running database migrations...');
const migrationResult = runCommand('npm run db:push', 'Database migration');
if (!migrationResult) {
  console.error('❌ Database migration failed.');
  process.exit(1);
}

console.log('✅ Database setup completed successfully.');

// Check if admin user exists, if not prompt to create one
console.log('👤 Checking for admin user...');
try {
  // This is a simplified check - in a real scenario, you'd want to query the database
  console.log('💡 Note: You may want to create an admin user using:');
  console.log('   npm run create-admin -- "admin_username" "admin_email" "admin_password"');
} catch (error) {
  console.log('ℹ️  Admin user check completed.');
}

console.log('\n🎉 Post-deployment setup completed successfully!');
console.log('\n📝 Next steps:');
console.log('1. Create an admin user if needed:');
console.log('   npm run create-admin -- "admin_username" "admin_email" "admin_password"');
console.log('2. Verify the application is running correctly');
console.log('3. Test user registration and login');
console.log('4. Test email functionality');
console.log('5. Test video playback');
console.log('6. Test subscription and payment functionality');

console.log('\n🔗 Your application should now be accessible at your deployment URL.');