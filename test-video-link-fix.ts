// @ts-ignore
import fetch from 'node-fetch';

async function testVideoLinkFix() {
  try {
    console.log('Testing video link functionality fix...');
    
    // First, login as admin to get auth token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@streamkji.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('Failed to login:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful');
    
    // Extract auth token from response
    const authToken = loginData.token;
    
    // Now get a CSRF token
    const csrfResponse = await fetch('http://localhost:5000/api/csrf-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      credentials: 'include'
    });
    
    if (!csrfResponse.ok) {
      console.error('Failed to get CSRF token:', csrfResponse.status, await csrfResponse.text());
      return;
    }
    
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token:', csrfData.csrfToken);
    
    // First, check if we have any content
    const contentResponse = await fetch('http://localhost:5000/api/contents/tmdb', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      credentials: 'include'
    });
    
    if (!contentResponse.ok) {
      console.error('Failed to get content:', contentResponse.status, await contentResponse.text());
      return;
    }
    
    const contentData = await contentResponse.json();
    console.log('Available content:', contentData.length > 0 ? `${contentData.length} items` : 'No content found');
    
    if (contentData.length === 0) {
      console.log('No content available to test with. Please add some content first.');
      return;
    }
    
    // Take the first content item for testing
    const testContent = contentData[0];
    console.log('Testing with content:', testContent.title, `(TMDB ID: ${testContent.tmdbId})`);
    
    // Now test the add-link endpoint
    const response = await fetch('http://localhost:5000/api/contents/add-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        'X-CSRF-Token': csrfData.csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        tmdbId: testContent.tmdbId,
        videoUrl: 'https://example.com/test-video.mp4'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
    } else {
      const errorText = await response.text();
      console.error('Error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVideoLinkFix();