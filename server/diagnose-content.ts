#!/usr/bin/env tsx

/**
 * Diagnostic tool to check content status and video URLs
 */

import { storage } from './storage';

async function diagnoseContent(tmdbId: string) {
  console.log(`Diagnosing content with TMDB ID: ${tmdbId}\n`);
  
  try {
    const tmdbIdNum = parseInt(tmdbId);
    if (isNaN(tmdbIdNum)) {
      console.error('Invalid TMDB ID format');
      return;
    }
    
    // Check content with any status
    console.log('1. Checking content with any status...');
    const contentAnyStatus = await storage.getContentByTmdbIdAnyStatus(tmdbIdNum);
    
    if (!contentAnyStatus) {
      console.log('❌ Content not found in database');
      return;
    }
    
    console.log('✅ Content found in database');
    console.log(`   ID: ${contentAnyStatus.id}`);
    console.log(`   Title: ${contentAnyStatus.title}`);
    console.log(`   Active: ${contentAnyStatus.active}`);
    console.log(`   Odysee URL: ${contentAnyStatus.odyseeUrl || 'None'}`);
    console.log(`   Media Type: ${contentAnyStatus.mediaType}`);
    console.log(`   Created: ${contentAnyStatus.createdAt}`);
    console.log(`   Updated: ${contentAnyStatus.updatedAt}`);
    
    // Check if content is active
    console.log('\n2. Checking if content is active...');
    if (!contentAnyStatus.active) {
      console.log('❌ Content is not active. It needs to be activated to be playable.');
      console.log('   Solution: Activate the content in the admin panel or update it via API.');
      return;
    }
    
    console.log('✅ Content is active');
    
    // Check if content has a video URL
    console.log('\n3. Checking if content has a video URL...');
    if (!contentAnyStatus.odyseeUrl) {
      console.log('❌ Content does not have a video URL');
      console.log('   Solution: Add a video URL in the admin panel or via the /api/contents/add-link endpoint.');
      return;
    }
    
    console.log('✅ Content has a video URL');
    
    // Validate the video URL
    console.log('\n4. Validating video URL format...');
    const videoUrl = contentAnyStatus.odyseeUrl;
    
    if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
      console.log('❌ Video URL is empty or invalid');
      console.log('   Solution: Update the video URL with a valid one.');
      return;
    }
    
    try {
      const parsedUrl = new URL(videoUrl);
      if (!parsedUrl.protocol || !parsedUrl.hostname) {
        console.log('❌ Video URL is malformed (missing protocol or hostname)');
        console.log(`   URL: ${videoUrl}`);
        console.log('   Solution: Update the video URL with a properly formatted one.');
        return;
      }
      
      if (parsedUrl.hostname.includes('&')) {
        console.log('❌ Video URL hostname contains invalid characters');
        console.log(`   URL: ${videoUrl}`);
        console.log('   Solution: Update the video URL with a valid one.');
        return;
      }
      
      console.log('✅ Video URL is valid');
      console.log(`   URL: ${videoUrl}`);
      
      // Check content with active status
      console.log('\n5. Checking content with active status...');
      const contentActive = await storage.getContentByTmdbId(tmdbIdNum);
      
      if (!contentActive) {
        console.log('❌ Content is not returned by active query (unexpected)');
        console.log('   This suggests there might be an issue with the database query.');
        return;
      }
      
      console.log('✅ Content is correctly returned by active query');
      console.log('\n🎉 All checks passed! The content should be playable.');
      console.log('   If you\'re still having issues, check the browser console for errors.');
      
    } catch (urlError) {
      console.log('❌ Video URL is invalid format');
      console.log(`   URL: ${videoUrl}`);
      console.log(`   Error: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
      console.log('   Solution: Update the video URL with a properly formatted one.');
      return;
    }
    
  } catch (error) {
    console.error('Error during diagnosis:', error);
  }
}

// Get TMDB ID from command line arguments
const tmdbId = process.argv[2];

if (!tmdbId) {
  console.log('Usage: npx tsx server/diagnose-content.ts <tmdb-id>');
  console.log('Example: npx tsx server/diagnose-content.ts 12345');
  process.exit(1);
}

diagnoseContent(tmdbId);