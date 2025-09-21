#!/usr/bin/env tsx

/**
 * Test database storage of video URLs
 */

import { storage } from './storage';

async function testDatabaseStorage() {
  console.log("Testing database storage of video URLs...\n");
  
  try {
    // Test creating content with your YouTube URL
    const testContent = {
      tmdbId: 999999, // Test TMDB ID
      title: "Test Video",
      description: "Test video for URL validation",
      odyseeUrl: "https://youtu.be/FR8KuG3g2rg?si=fUHA4gtk6zTdlPl_",
      language: "vf",
      quality: "hd",
      mediaType: "movie",
      active: true,
    };
    
    console.log("1. Creating test content with YouTube URL...");
    const createdContent = await storage.createContent(testContent);
    console.log("✅ Content created successfully");
    console.log(`   ID: ${createdContent.id}`);
    console.log(`   Odysee URL: ${createdContent.odyseeUrl}`);
    
    // Test retrieving content by TMDB ID
    console.log("\n2. Retrieving content by TMDB ID...");
    const retrievedContent = await storage.getContentByTmdbId(999999);
    if (retrievedContent) {
      console.log("✅ Content retrieved successfully");
      console.log(`   ID: ${retrievedContent.id}`);
      console.log(`   Odysee URL: ${retrievedContent.odyseeUrl}`);
    } else {
      console.log("❌ Content not found or not active");
    }
    
    // Test retrieving content by TMDB ID (any status)
    console.log("\n3. Retrieving content by TMDB ID (any status)...");
    const retrievedContentAny = await storage.getContentByTmdbIdAnyStatus(999999);
    if (retrievedContentAny) {
      console.log("✅ Content retrieved successfully");
      console.log(`   ID: ${retrievedContentAny.id}`);
      console.log(`   Odysee URL: ${retrievedContentAny.odyseeUrl}`);
      console.log(`   Active: ${retrievedContentAny.active}`);
    } else {
      console.log("❌ Content not found");
    }
    
    // Clean up test content
    console.log("\n4. Cleaning up test content...");
    await storage.deleteContent(createdContent.id);
    console.log("✅ Test content cleaned up");
    
  } catch (error) {
    console.error("Error during database test:", error);
  }
}

// Run the test
testDatabaseStorage();