#!/usr/bin/env tsx

/**
 * Diagnostic tool to check why a video is not displaying
 */

import { storage } from './server/storage';

async function diagnoseVideoIssue(tmdbId: string) {
  console.log(`Diagnosing video issue for TMDB ID: ${tmdbId}\n`);
  
  try {
    const tmdbIdNum = parseInt(tmdbId);
    if (isNaN(tmdbIdNum)) {
      console.error('❌ Invalid TMDB ID format');
      return;
    }
    
    // Check content with any status
    console.log('1. Checking if content exists in database...');
    const contentAnyStatus = await storage.getContentByTmdbIdAnyStatus(tmdbIdNum);
    
    if (!contentAnyStatus) {
      console.log('❌ Content not found in database');
      console.log('   Solution: Import the content first using the admin panel or import scripts');
      return;
    }
    
    console.log('✅ Content found in database');
    console.log(`   ID: ${contentAnyStatus.id}`);
    console.log(`   Title: ${contentAnyStatus.title}`);
    console.log(`   Active: ${contentAnyStatus.active}`);
    console.log(`   Video URL: ${contentAnyStatus.odyseeUrl || 'None'}`);
    console.log(`   Media Type: ${contentAnyStatus.mediaType}`);
    
    // Check if content is active
    console.log('\n2. Checking if content is active...');
    if (!contentAnyStatus.active) {
      console.log('❌ Content is not active');
      console.log('   Solution: Activate the content in the admin panel');
      return;
    }
    
    console.log('✅ Content is active');
    
    // Check if content has a video URL
    console.log('\n3. Checking if content has a video URL...');
    if (!contentAnyStatus.odyseeUrl) {
      console.log('❌ Content does not have a video URL');
      console.log('   Solution: Add a video URL in the admin panel');
      return;
    }
    
    console.log('✅ Content has a video URL');
    
    // Validate the video URL
    console.log('\n4. Validating video URL format...');
    const videoUrl = contentAnyStatus.odyseeUrl;
    
    if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
      console.log('❌ Video URL is empty or invalid');
      console.log('   Solution: Update the video URL with a valid one');
      return;
    }
    
    try {
      const parsedUrl = new URL(videoUrl);
      if (!parsedUrl.protocol || !parsedUrl.hostname) {
        console.log('❌ Video URL is malformed (missing protocol or hostname)');
        console.log(`   URL: ${videoUrl}`);
        console.log('   Solution: Update the video URL with a properly formatted one');
        return;
      }
      
      if (parsedUrl.hostname.includes('&')) {
        console.log('❌ Video URL hostname contains invalid characters');
        console.log(`   URL: ${videoUrl}`);
        console.log('   Solution: Update the video URL with a valid one');
        return;
      }
      
      console.log('✅ Video URL is valid');
      console.log(`   URL: ${videoUrl}`);
      
      // Check supported platforms
      console.log('\n5. Checking if video platform is supported...');
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
        videoUrl.includes(platform)
      );
      
      if (!isSupported) {
        console.log('❌ Video URL is from an unsupported platform');
        console.log(`   URL: ${videoUrl}`);
        console.log('   Supported platforms: Odysee, YouTube, Vimeo, Mux, and direct video files');
        return;
      }
      
      console.log('✅ Video platform is supported');
      
      // Special check for Mux URLs
      if (videoUrl.includes('mux.com')) {
        console.log('\n7. Special Mux URL checks...');
        
        // Check if it's a stream URL that should be converted
        if (videoUrl.includes('stream.mux.com') && videoUrl.endsWith('.m3u8')) {
          console.log('ℹ️  Detected Mux stream URL (.m3u8)');
          console.log('   Note: This will be automatically converted to a player URL');
        }
        
        // Check if it's a player URL
        if (videoUrl.includes('player.mux.com')) {
          console.log('✅ Detected Mux player URL');
        }
        
        // Check for playback ID
        try {
          const urlObj = new URL(videoUrl);
          const pathParts = urlObj.pathname.split('/');
          const playbackId = pathParts.find(part => part.length > 5 && !part.includes('.')) || 
                            pathParts.find(part => part.endsWith('.m3u8'))?.replace('.m3u8', '');
          
          if (playbackId) {
            console.log(`✅ Found playback ID: ${playbackId}`);
          } else {
            console.log('⚠️  Could not identify playback ID in URL');
          }
        } catch (e) {
          console.log('⚠️  Could not parse URL to check for playback ID');
        }
      }
      
      // Final check with active query
      console.log('\n8. Final verification...');
      const contentActive = await storage.getContentByTmdbId(tmdbIdNum);
      
      if (!contentActive) {
        console.log('❌ Content is not returned by active query (unexpected)');
        console.log('   This suggests there might be an issue with the database query');
        return;
      }
      
      if (contentActive.odyseeUrl !== videoUrl) {
        console.log('❌ Content URL mismatch between queries');
        console.log(`   Active query URL: ${contentActive.odyseeUrl}`);
        console.log(`   Any status query URL: ${videoUrl}`);
        return;
      }
      
      console.log('✅ Final verification passed');
      console.log('\n🎉 All checks passed! The video should be playable.');
      console.log('   If you\'re still having issues, check the browser console for errors.');
      
    } catch (urlError) {
      console.log('❌ Video URL is invalid format');
      console.log(`   URL: ${videoUrl}`);
      console.log(`   Error: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
      console.log('   Solution: Update the video URL with a properly formatted one');
      return;
    }
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

// Get TMDB ID from command line arguments
const tmdbId = process.argv[2];

if (!tmdbId) {
  console.log('Usage: npx tsx diagnose-video-issue.ts <tmdb-id>');
  console.log('Example: npx tsx diagnose-video-issue.ts 12345');
  process.exit(1);
}

diagnoseVideoIssue(tmdbId);