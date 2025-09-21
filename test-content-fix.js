// Test script to verify content fetching fixes
const testContentFix = async () => {
  console.log('Testing content fetching fixes...');
  
  try {
    // Test fetching content for a non-existent TMDB ID
    const response = await fetch('/api/contents/tmdb/999999999');
    const data = await response.json();
    
    console.log('Response for non-existent content:', data);
    
    // Check if we get a default content object instead of an error
    if (data.tmdbId === 999999999 && data.odyseeUrl === '') {
      console.log('✓ Fix working correctly - returning default content object');
    } else {
      console.log('✗ Fix not working - unexpected response');
    }
    
    // Test fetching content for an existing TMDB ID without video URL
    // This would simulate content that exists but doesn't have a video link
    console.log('Testing complete');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testContentFix();