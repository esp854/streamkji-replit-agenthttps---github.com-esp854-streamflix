#!/usr/bin/env tsx

/**
 * Test script to verify video URL support in our video player component
 * This script tests various video URL formats to ensure they are properly handled
 */

import { URL } from 'url';

// Test URLs
const testUrls = [
  // Valid URLs
  'https://odysee.com/@username:channel/video-title:video-id',
  'https://www.youtube.com/watch?v=video-id',
  'https://youtu.be/video-id',
  'https://vimeo.com/123456789',
  'https://player.mux.com/nxJGpRqIjgXGrfiYf3X01jWUVTpn02yKNfZtFsApwHLXs',
  'https://mux.com/watch/nxJGpRqIjgXGrfiYf3X01jWUVTpn02yKNfZtFsApwHLXs',
  'https://example.com/video.mp4',
  'https://example.com/video.webm',
  'https://example.com/video.m3u8',
  
  // Invalid URLs
  '',
  '   ',
  'https://&/',
  'not-a-url',
  'http://',
];

// Function to validate URL format
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    // Check for obviously invalid URLs
    if (!parsedUrl.protocol || !parsedUrl.hostname || parsedUrl.hostname.includes('&')) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Function to determine video type
function getVideoType(url: string): string {
  if (!isValidUrl(url)) {
    return 'invalid';
  }

  if (url.includes("mux.com") || url.includes("player.mux.com")) {
    return 'mux';
  }
  
  if (url.includes("odysee.com")) {
    return 'odysee';
  }
  
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return 'youtube';
  }
  
  if (url.includes("vimeo.com")) {
    return 'vimeo';
  }
  
  if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m3u8|ts)(\?.*)?$/i) || 
      url.includes(".m3u8") || 
      url.includes(".ts")) {
    return 'direct';
  }
  
  if (url.includes("embed") || url.includes("player")) {
    return 'embed';
  }
  
  return 'unknown';
}

console.log('Testing video URL support...\n');

testUrls.forEach((url, index) => {
  const isValid = isValidUrl(url);
  const type = getVideoType(url);
  
  console.log(`Test ${index + 1}: ${url || '(empty)'}`);
  console.log(`  Valid: ${isValid}`);
  console.log(`  Type: ${type}`);
  console.log('');
});

console.log('Test completed.');