#!/usr/bin/env tsx

/**
 * Test script to validate URLs and understand why they might be failing
 */

function validateUrl(url: string): { isValid: boolean; error?: string } {
  // Handle empty or invalid URLs
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { isValid: false, error: "URL is empty or not provided" };
  }

  // Validate URL format more strictly
  try {
    const parsedUrl = new URL(url);
    // Check for obviously invalid URLs
    if (!parsedUrl.protocol || !parsedUrl.hostname) {
      return { isValid: false, error: "URL missing protocol or hostname" };
    }
    
    // Additional check for malformed URLs
    if (parsedUrl.hostname.includes('&')) {
      return { isValid: false, error: "URL hostname contains invalid characters" };
    }
    
    // Check if it's a supported video platform
    const supportedPlatforms = [
      'odysee.com',
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'mux.com',
      'player.mux.com',
      '.mp4',
      '.webm',
      '.ogg',
      '.mov',
      '.avi',
      '.wmv',
      '.flv',
      '.mkv',
      '.m3u8',
      '.ts'
    ];
    
    const isSupported = supportedPlatforms.some(platform => 
      url.includes(platform)
    );
    
    if (!isSupported) {
      return { isValid: false, error: "URL is not from a recognized video platform" };
    }
    
    return { isValid: true };
  } catch (e) {
    return { isValid: false, error: `Invalid URL format: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// Test URLs - add your actual URL here to test
const sampleTestUrls = [
  '', // Empty URL
  '   ', // Whitespace only
  'not-a-url', // Missing protocol
  'http://', // Missing hostname
  'https://&/', // Invalid hostname
  'https://example.com', // Valid URL
  'https://odysee.com/@username:channel/video-title:video-id', // Valid Odysee URL
  'https://www.youtube.com/watch?v=video-id', // Valid YouTube URL
  'https://player.mux.com/nxJGpRqIjgXGrfiYf3X01jWUVTpn02yKNfZtFsApwHLXs', // Valid Mux URL
];

console.log('Testing URL validation...\n');

sampleTestUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}: "${url}"`);
  
  const result = validateUrl(url);
  if (result.isValid) {
    console.log(`  ✓ Valid URL`);
  } else {
    console.log(`  ✗ Invalid URL: ${result.error}`);
  }
  
  console.log('');
});

console.log('Test completed.');

// If you have a specific URL that's failing, add it here:
console.log('=== Testing your specific URL ===');
const yourUrl = process.argv[2] || ''; // Pass URL as command line argument
if (yourUrl) {
  console.log(`Testing URL: "${yourUrl}"`);
  const result = validateUrl(yourUrl);
  if (result.isValid) {
    console.log(`  ✓ Valid URL`);
  } else {
    console.log(`  ✗ Invalid URL: ${result.error}`);
  }
} else {
  console.log('No specific URL provided. Run with: npx tsx server/test-url-validation.ts "your-url-here"');
}