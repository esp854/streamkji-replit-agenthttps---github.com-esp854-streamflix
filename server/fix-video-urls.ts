import { config } from "dotenv";
import { storage } from "./storage";

// Load environment variables
config();

async function fixVideoUrls() {
  try {
    console.log("Fixing HTML-encoded video URLs...");
    
    // Get all content from the database
    const contents = await storage.getAllContent();
    
    console.log(`Found ${contents.length} content items in database`);
    
    // Filter content with HTML-encoded URLs
    const contentToFix = contents.filter(item => 
      item.odyseeUrl && (item.odyseeUrl.includes('&amp;#x2F;') || item.odyseeUrl.includes('&amp;'))
    );
    
    console.log(`Found ${contentToFix.length} items with HTML-encoded URLs`);
    
    // Fix each URL
    for (const content of contentToFix) {
      let fixedUrl = content.odyseeUrl || '';
      
      // Decode HTML entities
      fixedUrl = fixedUrl
        .replace(/&amp;#x2F;/g, '/')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      
      console.log(`Fixing: ${content.title}`);
      console.log(`  Old: ${content.odyseeUrl}`);
      console.log(`  New: ${fixedUrl}`);
      
      // Update the content with the fixed URL
      await storage.updateContent(content.id, { odyseeUrl: fixedUrl });
      console.log(`  ✓ Updated successfully\n`);
    }
    
    console.log("URL fixing process completed!");
    
    // Verify the fixes
    const updatedContents = await storage.getAllContent();
    const contentWithVideos = updatedContents.filter(item => item.odyseeUrl);
    
    console.log(`\nContent with video URLs (${contentWithVideos.length} items):`);
    
    contentWithVideos.slice(0, 5).forEach(item => {
      console.log(`- ${item.title} (${item.mediaType})`);
      console.log(`  TMDB ID: ${item.tmdbId}`);
      console.log(`  Video URL: ${item.odyseeUrl}`);
      console.log('');
    });
    
  } catch (error) {
    console.error("Error fixing video URLs:", error);
  }
}

// Run the fix
fixVideoUrls();