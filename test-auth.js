import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "EcaR9YIwP+1msKt9HsuBxJcf1KOh0WiLNHm9At2cNrVP7rLCQ+82/Q80+FtwGazICef68c5QuJfgeg6Qi+WLpw==";

// Test token
const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlMWIxZjA5Yi1lZjM1LTRkMjItYmU0Yy04NWQ3MWUzODQxZDgiLCJlbWFpbCI6ImFkbWluQHN0cmVhbWtqaS5jb20iLCJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzU4MTY0MDQ2LCJleHAiOjE3NTg3Njg4NDZ9.GBRmTOuMvjDaQ9xJNJY8sbHBORPkyHTF0trv-3fJ_6o";

console.log('Testing token verification...');

jwt.verify(testToken, JWT_SECRET, (err, user) => {
  if (err) {
    console.error('Token verification failed:', err.message);
  } else {
    console.log('Token verified successfully:', user);
  }
});

// Test fetching content with the token
import fetch from 'node-fetch';

async function testApiCall() {
  try {
    console.log('Testing API call with token...');
    const response = await fetch('http://localhost:5000/api/admin/content', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('API call failed:', error.message);
  }
}

testApiCall();