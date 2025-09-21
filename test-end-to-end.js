// End-to-end test of the complete payment flow
import dotenv from 'dotenv';
dotenv.config();

async function testEndToEnd() {
  console.log('Testing end-to-end payment flow...');
  
  try {
    // First, let's verify our environment is set up correctly
    console.log('LYGOS_API_KEY configured:', !!process.env.LYGOS_API_KEY);
    
    // Test the subscription plans endpoint
    console.log('Testing subscription plans endpoint...');
    const plansResponse = await fetch('http://localhost:5000/api/subscription/plans');
    console.log('Plans response status:', plansResponse.status);
    
    if (plansResponse.ok) {
      const plans = await plansResponse.json();
      console.log('Available plans:', plans);
    }
    
    // Test creating a payment through our API
    console.log('Testing payment creation...');
    const paymentResponse = await fetch('http://localhost:5000/api/subscription/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'basic',
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+221123456789'
        }
      })
    });
    
    console.log('Payment creation response status:', paymentResponse.status);
    
    // Get headers
    const headersArray = [];
    paymentResponse.headers.forEach((value, key) => {
      headersArray.push([key, value]);
    });
    console.log('Payment creation response headers:', headersArray);
    
    const responseText = await paymentResponse.text();
    console.log('Payment creation response body:', responseText);
    
    if (paymentResponse.ok) {
      const paymentData = JSON.parse(responseText);
      console.log('Payment data:', paymentData);
    }
    
    // Also test without authentication to see if that's the issue
    console.log('Testing payment creation without authentication...');
    const paymentResponseNoAuth = await fetch('http://localhost:5000/api/subscription/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'basic',
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+221123456789'
        }
      })
    });
    
    console.log('Payment creation (no auth) response status:', paymentResponseNoAuth.status);
    const responseTextNoAuth = await paymentResponseNoAuth.text();
    console.log('Payment creation (no auth) response body:', responseTextNoAuth);
  } catch (error) {
    console.error('Error in end-to-end test:', error);
  }
}

testEndToEnd();