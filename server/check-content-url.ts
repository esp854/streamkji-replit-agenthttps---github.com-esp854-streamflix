import { storage } from './storage';
import { config } from 'dotenv';

config();

async function checkContentUrl(tmdbId: string) {
  try {
    const storageInstance = storage;
    
    console.log(`Checking content with TMDB ID: ${tmdbId}`);
    
    // Get content by TMDB ID
    const content = await storageInstance.getContentByTmdbIdAnyStatus(Number(tmdbId));
    
    if (!content) {
      console.log('❌ Content not found in database');
      return;
    }
    
    console.log('✅ Content found:');
    console.log(`  ID: ${content.id}`);
    console.log(`  TMDB ID: ${content.tmdbId}`);
    console.log(`  Title: ${content.title}`);
    console.log(`  Active: ${content.active}`);
    console.log(`  Odysee URL: ${content.odyseeUrl || 'None'}`);
    
    if (!content.active) {
      console.log('⚠️  Content is not active');
    }
    
    if (!content.odyseeUrl) {
      console.log('⚠️  No Odysee URL found for this content');
    } else {
      console.log('✅ Odysee URL found');
      
      // Validate URL format
      try {
        const url = new URL(content.odyseeUrl);
        console.log('✅ URL format is valid');
        
        // Check if it's a YouTube URL and needs conversion
        if (content.odyseeUrl.includes('youtu.be') || content.odyseeUrl.includes('youtube.com')) {
          console.log('🔄 YouTube URL detected, checking conversion...');
          
          // Simulate YouTube URL conversion
          let embedUrl = content.odyseeUrl;
          if (embedUrl.includes('youtu.be')) {
            const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          } else if (embedUrl.includes('youtube.com/watch')) {
            const urlObj = new URL(embedUrl);
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
          }
          
          console.log(`  Converted URL: ${embedUrl}`);
        }
      } catch (error) {
        console.log('❌ Invalid URL format in database');
        console.log(`  Error: ${error}`);
      }
    }
    
    // await storage.close();
  } catch (error) {
    console.error('Error checking content:', error);
  }
}

async function checkContentByUrl(url: string) {
  try {
    const storageInstance = storage;
    
    console.log(`Checking content with URL: ${url}`);
    
    // Get content by URL
    const content = await storageInstance.getContentByOdyseeUrl(url);
    
    if (!content) {
      console.log('❌ Content not found in database with this URL');
      return;
    }
    
    console.log('✅ Content found:');
    console.log(`  ID: ${content.id}`);
    console.log(`  TMDB ID: ${content.tmdbId}`);
    console.log(`  Title: ${content.title}`);
    console.log(`  Active: ${content.active}`);
    console.log(`  Odysee URL: ${content.odyseeUrl || 'None'}`);
    
    if (!content.active) {
      console.log('⚠️  Content is not active');
    }
    
    // Validate URL format
    try {
      const parsedUrl = new URL(content.odyseeUrl!);
      console.log('✅ URL format is valid');
      
      // Check if it's a YouTube URL and needs conversion
      if (content.odyseeUrl!.includes('youtu.be') || content.odyseeUrl!.includes('youtube.com')) {
        console.log('🔄 YouTube URL detected, checking conversion...');
        
        // Simulate YouTube URL conversion
        let embedUrl: string = content.odyseeUrl!;
        if (embedUrl.includes('youtu.be')) {
          const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (embedUrl.includes('youtube.com/watch')) {
          const urlObj = new URL(embedUrl);
          const videoId = urlObj.searchParams.get('v');
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        }
        
        console.log(`  Converted URL: ${embedUrl}`);
      }
    } catch (error) {
      console.log('❌ Invalid URL format in database');
      console.log(`  Error: ${error}`);
    }
    
    // await storage.close();
  } catch (error) {
    console.error('Error checking content:', error);
  }
}

// Get arguments from command line
const arg1 = process.argv[2];
const arg2 = process.argv[3];

if (!arg1) {
  console.log('Usage:');
  console.log('  npx tsx check-content-url.ts <tmdb-id>');
  console.log('  npx tsx check-content-url.ts url <url>');
  console.log('Examples:');
  console.log('  npx tsx check-content-url.ts 673');
  console.log('  npx tsx check-content-url.ts url "https://youtu.be/FR8KuG3g2rg?si=fUHA4gtk6zTdlPl_"');
  process.exit(1);
}

if (arg1 === 'url' && arg2) {
  checkContentByUrl(arg2);
} else {
  checkContentUrl(arg1);
}