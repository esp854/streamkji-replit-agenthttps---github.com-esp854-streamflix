// Direct test of Lygos API integration
import dotenv from 'dotenv';
dotenv.config();

async function testLygosDirect() {
  // Try the gateway endpoint that worked in our earlier test
  const url = "https://api.lygosapp.com/v1/gateway";
  const body = {
    amount: 1000,
    shop_name: "StreamFlix Test",
    message: "Test payment",
    success_url: "http://localhost:5173/subscription?payment=success",
    failure_url: "http://localhost:5173/subscription?payment=error",
    order_id: `TEST_ORDER_${Date.now()}`,
    customer: {
      name: "Test User",
      email: "test@example.com",
      phone: "+221123456789"
    }
  };

  try {
    console.log('Sending request to Lygos API:', {
      url,
      headers: {
        "api-key": process.env.LYGOS_API_KEY ? "[REDACTED]" : "MISSING",
        "Content-Type": "application/json"
      },
      body
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": process.env.LYGOS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Create payment response status:", res.status);
    
    // Get headers
    const headersArray = [];
    res.headers.forEach((value, key) => {
      headersArray.push([key, value]);
    });
    console.log("Create payment response headers:", headersArray);
    
    const data = await res.json();
    console.log("Create payment response body:", data);
  } catch (error) {
    console.error("Create payment error:", error);
  }
}

testLygosDirect();