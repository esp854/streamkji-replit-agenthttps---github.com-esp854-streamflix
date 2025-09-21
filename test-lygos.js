// Test script to verify Lygos API integration
import dotenv from 'dotenv'; // Load environment variables from .env file
dotenv.config();

async function testLygosAPI() {
  const url = 'https://api.lygosapp.com/v1/gateway';
  const apiKey = process.env.LYGOS_API_KEY;
  
  if (!apiKey) {
    console.error('LYGOS_API_KEY is not set in environment variables');
    return;
  }
  
  const options = {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "amount": 1000,
      "shop_name": "StreamFlix Test",
      "message": "Test payment",
      "success_url": "http://localhost:5173/subscription?payment=success",
      "failure_url": "http://localhost:5173/subscription?payment=error",
      "order_id": `TEST_ORDER_${Date.now()}`
    })
  };

  try {
    console.log('Testing Lygos API with options:', {
      url,
      headers: options.headers,
      body: options.body
    });
    
    const response = await fetch(url, options);
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testLygosAPI();