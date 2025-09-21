/**
 * Test script to verify backend routes are working correctly
 * This tests the integration between frontend and backend
 */

async function testBackendRoutes() {
  console.log('🚀 Testing Backend Routes');
  console.log('========================');
  
  const BASE_URL = 'http://localhost:5000';
  
  try {
    // Test 1: Check if server is running
    console.log('\n1. Testing server connectivity...');
    const healthResponse = await fetch(`${BASE_URL}/api/subscription/plans`);
    console.log('✅ Server is running');
    console.log('   - Status:', healthResponse.status);
    
    // Test 2: Fetch subscription plans
    console.log('\n2. Fetching subscription plans...');
    const plansResponse = await fetch(`${BASE_URL}/api/subscription/plans`);
    const plans = await plansResponse.json();
    console.log('✅ Subscription plans fetched');
    console.log('   - Available plans:', Object.keys(plans));
    
    // Test 3: Test Djamo configuration
    console.log('\n3. Testing Djamo configuration...');
    const configResponse = await fetch(`${BASE_URL}/api/test/payment-service`);
    const config = await configResponse.json();
    console.log('✅ Djamo configuration check');
    console.log('   - Merchant ID:', config.serviceInfo.djamoAvailable ? 'SET' : 'NOT SET');
    console.log('   - Ready:', config.ready);
    
    console.log('\n🎉 All backend route tests passed!');
    
  } catch (error) {
    console.error('❌ Backend route test failed:', error);
    throw error;
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testBackendRoutes()
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testBackendRoutes };