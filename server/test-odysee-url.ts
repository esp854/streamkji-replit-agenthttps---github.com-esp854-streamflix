#!/usr/bin/env tsx

/**
 * Test script to verify Odysee URL conversion logic
 */

// Test Odysee URLs
const testUrls = [
  'https://odysee.com/@username:channel/video-title:video-id',
  'https://odysee.com/$/embed/video-title:video-id',
  'https://odysee.com/@username:channel/video-title:video-id?param=value',
  'https://odysee.com/$/embed/video-title:video-id?param=value',
];

console.log('Testing Odysee URL conversion...\n');

testUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}: ${url}`);
  
  // Current conversion logic from video-player.tsx
  let embedUrl = url;
  if (!url.includes("/$/embed/")) {
    try {
      embedUrl = url.replace(/odysee\.com\//, "odysee.com/$/embed/");
      console.log(`  Converted to embed: ${embedUrl}`);
    } catch (e) {
      console.log(`  Conversion failed: ${e}`);
    }
  } else {
    console.log(`  Already embed URL: ${embedUrl}`);
  }
  
  console.log('');
});

console.log('Test completed.');