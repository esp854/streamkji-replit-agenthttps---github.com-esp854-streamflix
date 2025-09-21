#!/usr/bin/env tsx

/**
 * Fix common video URL issues
 */

import { storage } from './server/storage';

async function fixVideoUrl(tmdbId: string, videoUrl: string) {
  console.log(`Fixing video URL for TMDB ID: ${tmdbId}\n`);
  
  try {
    const tmdbIdNum = parseInt(tmdbId);
    if (isNaN(tmdbIdNum)) {
      console.error('❌ Invalid TMDB ID format');
      return;
    }
    
    // Check if content exists
    console.log('1. Checking if content exists...');
    const content = await storage.getContentByTmdbIdAnyStatus(tmdbIdNum);
    
    if (!content) {
      console.log('❌ Content not found in database');
      console.log('   Solution: Import the content first using the admin panel or import scripts');
      return;
    }
    
    console.log('✅ Content found');
    console.log(`   Title: ${content.title}`);
    console.log(`   Current URL: ${content.odyseeUrl || 'None'}`);
    
    // Clean the URL
    console.log('\n2. Cleaning URL...');
    let cleanVideoUrl = videoUrl;
    
    // Decode HTML entities
    try {
      cleanVideoUrl = videoUrl
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x2F;/g, '/')
        .replace(/&#39;/g, "'");
    } catch (e) {
      console.log('   Warning: Could not decode HTML entities');
    }
    
    console.log(`   Cleaned URL: ${cleanVideoUrl}`);
    
    // Validate URL
    console.log('\n3. Validating URL...');
    try {
      const parsedUrl = new URL(cleanVideoUrl);
      if (!parsedUrl.protocol || !parsedUrl.hostname) {
        console.log('❌ Invalid URL format');
        return;
      }
      console.log('✅ URL is valid');
    } catch (error) {
      console.log('❌ Invalid URL format');
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    
    // Update the content
    console.log('\n4. Updating content...');
    const updatedContent = await storage.updateContent(content.id, {
      odyseeUrl: cleanVideoUrl,
      active: true
    });
    
    console.log('✅ Content updated successfully');
    console.log(`   New URL: ${updatedContent.odyseeUrl}`);
    console.log(`   Active: ${updatedContent.active}`);
    
    console.log('\n🎉 Video URL fixed successfully!');
    console.log('   The video should now be playable.');
    
  } catch (error) {
    console.error('❌ Error fixing video URL:', error);
  }
}

// Get arguments from command line
const tmdbId = process.argv[2];
const videoUrl = process.argv[3];

if (!tmdbId || !videoUrl) {
  console.log('Usage: npx tsx fix-video-url.ts <tmdb-id> <video-url>');
  console.log('Example: npx tsx fix-video-url.ts 12345 "https://example.com/video.mp4"');
  process.exit(1);
}

fixVideoUrl(tmdbId, videoUrl);