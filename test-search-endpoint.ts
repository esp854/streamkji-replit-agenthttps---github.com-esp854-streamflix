import 'dotenv/config';
import fetch from 'node-fetch';

async function testSearchEndpoint() {
  try {
    console.log('Testing search endpoint...');
    
    const response = await fetch('http://localhost:5000/api/admin/search-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Harry Potter'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Search results:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSearchEndpoint();