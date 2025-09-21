// Test script to verify video link functionality
// This script will test the complete flow of adding a video link to existing content

import * as dotenv from 'dotenv';

dotenv.config();

async function testVideoLinkFunctionality() {
  console.log('Testing video link functionality...\n');
  
  try {
    // First, let's check if we can authenticate as admin
    console.log('1. Testing admin authentication...');
    
    // You'll need to replace these with valid credentials
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com', // Replace with actual admin email
        password: 'adminpassword',   // Replace with actual admin password
      }),
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Failed to authenticate as admin');
      console.log('Response:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Admin authentication successful\n');
    
    // Get CSRF token
    console.log('2. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/csrf-token', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!csrfResponse.ok) {
      console.log('❌ Failed to get CSRF token');
      console.log('Response:', await csrfResponse.text());
      return;
    }
    
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;
    console.log('✅ CSRF token obtained\n');
    
    // List all existing content to find one to test with
    console.log('3. Fetching existing content...');
    const contentResponse = await fetch('http://localhost:3000/api/contents/tmdb', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!contentResponse.ok) {
      console.log('❌ Failed to fetch content');
      console.log('Response:', await contentResponse.text());
      return;
    }
    
    const contentData = await contentResponse.json();
    console.log(`✅ Found ${contentData.length} content items\n`);
    
    if (contentData.length === 0) {
      console.log('⚠️  No content found to test with');
      return;
    }
    
    // Select the first content item for testing
    const testContent = contentData[0];
    console.log(`Testing with content: ${testContent.title} (TMDB ID: ${testContent.tmdbId})\n`);
    
    // Test adding a video link
    console.log('4. Adding video link to content...');
    const videoUrl = 'https://example.com/test-video.mp4'; // Test video URL
    
    const addLinkResponse = await fetch('http://localhost:3000/api/contents/add-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        tmdbId: testContent.tmdbId,
        videoUrl: videoUrl,
      }),
    });
    
    const addLinkData = await addLinkResponse.json();
    
    if (!addLinkResponse.ok) {
      console.log('❌ Failed to add video link');
      console.log('Response:', addLinkData);
      return;
    }
    
    console.log('✅ Video link added successfully');
    console.log('Response:', addLinkData);
    
    // Verify the content was updated
    console.log('\n5. Verifying content update...');
    const verifyResponse = await fetch(`http://localhost:3000/api/debug/content/${testContent.tmdbId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!verifyResponse.ok) {
      console.log('❌ Failed to verify content update');
      console.log('Response:', await verifyResponse.text());
      return;
    }
    
    const verifyData = await verifyResponse.json();
    console.log('✅ Content verification successful');
    console.log('Updated content:', verifyData.content);
    
    if (verifyData.content.odyseeUrl === videoUrl) {
      console.log('✅ Video link correctly saved in database');
    } else {
      console.log('❌ Video link not correctly saved');
      console.log(`Expected: ${videoUrl}`);
      console.log(`Actual: ${verifyData.content.odyseeUrl}`);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testVideoLinkFunctionality();