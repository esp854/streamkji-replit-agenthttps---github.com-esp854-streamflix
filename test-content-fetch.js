const fetch = require('node-fetch');

async function testContentFetch() {
  try {
    // Try to fetch content from the API
    const response = await fetch('http://localhost:3000/api/admin/content', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (response.ok) {
      const content = await response.json();
      console.log('Content fetched successfully:', JSON.stringify(content, null, 2));
    } else {
      console.log('Failed to fetch content. Status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error fetching content:', error.message);
  }
}

testContentFetch();