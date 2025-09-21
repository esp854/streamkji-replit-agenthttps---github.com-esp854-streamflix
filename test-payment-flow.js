// Test script to verify the complete payment flow
import dotenv from 'dotenv';
dotenv.config();

async function testPaymentFlow() {
  console.log('Testing complete payment flow...');
  
  // Test creating a payment
  try {
    console.log('Sending request to create payment...');
    
    const requestData = {
      planId: 'basic',
      customerInfo: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+221123456789'
      }
    };
    
    console.log('Request data:', requestData);
    
    const createPaymentResponse = await fetch('http://localhost:5000/api/subscription/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('Create payment response status:', createPaymentResponse.status);
    
    // Get headers
    const headersArray = [];
    createPaymentResponse.headers.forEach((value, key) => {
      headersArray.push([key, value]);
    });
    console.log('Create payment response headers:', headersArray);
    
    const responseText = await createPaymentResponse.text();
    console.log('Create payment response body:', responseText);
    
    if (!createPaymentResponse.ok) {
      console.error('Create payment failed with status:', createPaymentResponse.status);
      return;
    }
    
    const paymentData = JSON.parse(responseText);
    console.log('Payment data:', paymentData);
    
    // If we have a payment ID, test checking the status
    if (paymentData.paymentId) {
      console.log('Testing payment status check...');
      
      const statusResponse = await fetch(`http://localhost:5000/api/subscription/check-payment/${paymentData.paymentId}`);
      console.log('Status check response status:', statusResponse.status);
      
      // Get headers
      const statusHeadersArray = [];
      statusResponse.headers.forEach((value, key) => {
        statusHeadersArray.push([key, value]);
      });
      console.log('Status check response headers:', statusHeadersArray);
      
      const statusText = await statusResponse.text();
      console.log('Status check response body:', statusText);
      
      if (!statusResponse.ok) {
        console.error('Status check error:', statusText);
        return;
      }
      
      const statusData = JSON.parse(statusText);
      console.log('Payment status:', statusData);
    }
  } catch (error) {
    console.error('Error in payment flow test:', error);
  }
}

testPaymentFlow();