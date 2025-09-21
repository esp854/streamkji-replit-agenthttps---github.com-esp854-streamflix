// Test the payment service directly
import dotenv from 'dotenv';
dotenv.config();

// Import our payment service
import { paymentService } from './server/payment-service.js';

async function testPaymentService() {
  console.log('Testing payment service directly...');
  
  try {
    // Test if the service is configured
    console.log('Is Lygos configured?', paymentService.isConfigured());
    
    // Test creating a payment
    const result = await paymentService.createLygosPayment('basic', {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+221123456789'
    }, 'test-user-id');
    
    console.log('Payment creation result:', result);
  } catch (error) {
    console.error('Error testing payment service:', error);
  }
}

testPaymentService();