import { storage } from './storage';
import { config } from 'dotenv';
import { db } from './db';
import { content } from '@shared/schema';
import { sql } from 'drizzle-orm';

config();

async function searchContentByPartialUrl(partialUrl: string) {
  try {
    console.log(`Searching for content with partial URL: ${partialUrl}`);
    
    // Search for content where odyseeUrl contains the partial URL
    const results = await db
      .select()
      .from(content)
      .where(sql`odysee_url ILIKE ${`%${partialUrl}%`}`);
    
    if (results.length === 0) {
      console.log('❌ No content found with partial URL match');
      
      // Try another approach - search for content with YouTube URLs
      console.log('Searching for all YouTube content...');
      const youtubeResults = await db
        .select()
        .from(content)
        .where(sql`odysee_url ILIKE '%youtube%' OR odysee_url ILIKE '%youtu.be%'`);
      
      if (youtubeResults.length === 0) {
        console.log('❌ No YouTube content found in database');
      } else {
        console.log(`✅ Found ${youtubeResults.length} YouTube content items:`);
        youtubeResults.forEach((item, index) => {
          console.log(`  ${index + 1}. TMDB ID: ${item.tmdbId}, Title: ${item.title}`);
          console.log(`     URL: ${item.odyseeUrl}`);
          console.log(`     Active: ${item.active}`);
          console.log('');
        });
      }
    } else {
      console.log(`✅ Found ${results.length} content items with partial URL match:`);
      results.forEach((item, index) => {
        console.log(`  ${index + 1}. TMDB ID: ${item.tmdbId}, Title: ${item.title}`);
        console.log(`     URL: ${item.odyseeUrl}`);
        console.log(`     Active: ${item.active}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error searching content:', error);
  }
}

// Get partial URL from command line arguments
const partialUrl = process.argv[2];

if (!partialUrl) {
  console.log('Usage: npx tsx search-content-by-partial-url.ts <partial-url>');
  console.log('Example: npx tsx search-content-by-partial-url.ts "FR8KuG3g2rg"');
  process.exit(1);
}

searchContentByPartialUrl(partialUrl);