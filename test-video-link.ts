// Use the built-in fetch API instead of node-fetch
async function testVideoLinkEndpoint() {
  try {
    // First, let's login to get an auth token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'admin@streamkji.com', // Admin email from create-admin.ts
        password: 'admin123'           // Admin password from create-admin.ts
      })
    });
    
    if (!loginResponse.ok) {
      console.error('Failed to login:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful');
    
    // Extract auth token from response or cookies
    const authToken = loginData.token; // Adjust based on actual response structure
    
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
        tmdbId: 12345, // Example TMDB ID
        videoUrl: 'https://example.com/video.mp4'
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

testVideoLinkEndpoint();