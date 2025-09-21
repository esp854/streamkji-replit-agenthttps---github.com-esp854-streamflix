import { lygosService } from '../server/lygos-service';

/**
 * Test the complete Lygos integration flow
 * This demonstrates:
 * 1. Creating a payment invoice
 * 2. Generating a QR code
 * 3. Checking payment status
 * 4. Processing successful payments
 */
async function testLygosIntegration() {
  console.log('🧪 Testing Lygos Integration Flow');
  console.log('================================');
  
  try {
    // Test 1: Create a subscription invoice
    console.log('\n1. Creating subscription invoice...');
    const customerInfo = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+22500000000'
    };
    
    const invoice = await lygosService.createSubscriptionInvoice(
      'test_user_123',
      'standard',
      customerInfo,
      'orange_money'
    );
    
    console.log('✅ Invoice created successfully');
    console.log('   - Token:', invoice.invoice_token);
    console.log('   - Amount:', invoice.amount, 'FCFA');
    console.log('   - Plan:', invoice.plan?.name);
    console.log('   - QR Code available:', !!invoice.qr_code);
    
    // Test 2: Check payment status (should be pending)
    console.log('\n2. Checking payment status...');
    const status = await lygosService.checkPaymentStatus(invoice.invoice_token);
    console.log('✅ Status check completed');
    console.log('   - Status:', status.status);
    
    // Test 3: Display QR code information
    console.log('\n3. QR Code Information:');
    if (invoice.qr_code) {
      console.log('✅ QR code generated successfully');
      console.log('   - Data URL length:', invoice.qr_code.length);
      console.log('   - Preview: (QR code would be displayed in browser)');
    } else {
      console.log('❌ QR code not generated');
    }
    
    console.log('\n🎉 Integration test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Display the QR code to the user');
    console.log('   2. Start polling for payment status every 5 seconds');
    console.log('   3. When status is "completed", activate subscription');
    console.log('   4. Handle webhook notifications for real-time updates');
    
    return invoice;
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  }
}

// Test the payment status polling function
async function testPaymentPolling(invoiceToken: string) {
  console.log('\n🔄 Testing Payment Status Polling');
  console.log('==================================');
  
  // Simulate polling every 5 seconds
  const pollInterval = setInterval(async () => {
    try {
      const status = await lygosService.checkPaymentStatus(invoiceToken);
      console.log(`🕒 Status check at ${new Date().toISOString()}:`, status.status);
      
      if (status.status === 'completed') {
        console.log('✅ Payment completed! Processing subscription...');
        clearInterval(pollInterval);
        
        // Process the successful payment
        const result = await lygosService.processSuccessfulPayment(invoiceToken, {});
        console.log('✅ Subscription activated:', result.message);
      } else if (status.status === 'cancelled' || status.status === 'failed') {
        console.log('❌ Payment failed or cancelled');
        clearInterval(pollInterval);
      }
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
    }
  }, 5000); // Poll every 5 seconds
  
  // Stop polling after 60 seconds for demo purposes
  setTimeout(() => {
    clearInterval(pollInterval);
    console.log('⏹️  Polling stopped after 60 seconds');
  }, 60000);
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testLygosIntegration()
    .then(invoice => {
      if (invoice?.invoice_token) {
        // Uncomment the next line to test polling
        // testPaymentPolling(invoice.invoice_token);
      }
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testLygosIntegration, testPaymentPolling };