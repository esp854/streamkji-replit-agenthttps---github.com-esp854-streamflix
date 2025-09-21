import { storage } from './storage';
import { config } from 'dotenv';
import { db } from './db';
import { content } from '@shared/schema';
import { sql } from 'drizzle-orm';

config();

async function fixContentUrlEncoding() {
  try {
    console.log('Searching for content with encoded URLs...');
    
    // Search for content where odyseeUrl contains HTML entities
    const results = await db
      .select()
      .from(content)
      .where(sql`odysee_url ILIKE '%&amp;#x2F;%'`);
    
    if (results.length === 0) {
      console.log('✅ No content found with encoded URLs');
      return;
    }
    
    console.log(`Found ${results.length} content items with encoded URLs:`);
    
    for (const item of results) {
      console.log(`\nProcessing item:`);
      console.log(`  TMDB ID: ${item.tmdbId}`);
      console.log(`  Title: ${item.title}`);
      console.log(`  Current URL: ${item.odyseeUrl}`);
      
      // Fix the encoding
      const fixedUrl = item.odyseeUrl!.replace(/&amp;#x2F;/g, '/');
      
      console.log(`  Fixed URL: ${fixedUrl}`);
      
      // Update the content with the fixed URL
      await db
        .update(content)
        .set({ 
          odyseeUrl: fixedUrl,
          updatedAt: new Date()
        })
        .where(sql`id = ${item.id}`);
      
      console.log(`  ✅ Updated content ID: ${item.id}`);
    }
    
  } catch (error) {
    console.error('Error fixing content URLs:', error);
  }
}

fixContentUrlEncoding();