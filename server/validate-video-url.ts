#!/usr/bin/env tsx

/**
 * Simple tool to validate a video URL
 */

function validateVideoUrl(url: string): { isValid: boolean; error?: string } {
  console.log(`Validating URL: "${url}"\n`);
  
  // Handle empty or invalid URLs
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { isValid: false, error: "URL is empty or not provided" };
  }

  // Validate URL format more strictly
  try {
    const parsedUrl = new URL(url);
    console.log(`Protocol: ${parsedUrl.protocol}`);
    console.log(`Hostname: ${parsedUrl.hostname}`);
    console.log(`Pathname: ${parsedUrl.pathname}`);
    
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
      'zupload.cc',
      'zupload.io',
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
      console.log('⚠️  Warning: URL is not from a recognized video platform');
      console.log('   Supported platforms: Odysee, YouTube, Vimeo, Mux, Zupload, and direct video files');
    }
    
    return { isValid: true };
  } catch (e) {
    return { isValid: false, error: `Invalid URL format: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// Get URL from command line arguments
const url = process.argv[2];

if (!url) {
  console.log('Usage: npx tsx server/validate-video-url.ts "video-url"');
  console.log('Example: npx tsx server/validate-video-url.ts "https://odysee.com/@username:channel/video-title:video-id"');
  process.exit(1);
}

const result = validateVideoUrl(url);

if (result.isValid) {
  console.log('\n✅ URL is valid');
} else {
  console.log(`\n❌ URL is invalid: ${result.error}`);
}