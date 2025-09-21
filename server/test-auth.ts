// Test script to verify authentication for import content endpoint
import 'dotenv/config';

async function testAuth() {
  console.log('Testing authentication for import content endpoint...');
  
  try {
    // Test 1: Check if required environment variables are set
    console.log('\n--- Environment Variables Check ---');
    if (!process.env.TMDB_API_KEY) {
      console.log('❌ TMDB_API_KEY is not set');
      console.log('   Please set TMDB_API_KEY in your .env file');
    } else {
      console.log('✅ TMDB_API_KEY is set');
    }
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL is not set');
      console.log('   Please set DATABASE_URL in your .env file');
    } else {
      console.log('✅ DATABASE_URL is set');
    }
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET is not set');
      console.log('   Please set JWT_SECRET in your .env file');
    } else {
      console.log('✅ JWT_SECRET is set');
    }
    
    // Test 2: Try to access the import endpoint without authentication
    console.log('\n--- Authentication Test ---');
    const testResponse = await fetch('http://localhost:5000/api/admin/import-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.status === 401) {
      console.log('✅ Import endpoint correctly requires authentication');
    } else {
      console.log(`⚠️  Unexpected response: ${testResponse.status}`);
      console.log('   The endpoint should return 401 Unauthorized when not authenticated');
    }
    
    console.log('\n--- Test Summary ---');
    console.log('To properly test the import functionality:');
    console.log('1. Make sure you are logged in as an admin in the web interface');
    console.log('2. Use the "Importer depuis TMDB" button in the Admin Dashboard');
    console.log('3. Check the browser console for detailed error messages');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuth();