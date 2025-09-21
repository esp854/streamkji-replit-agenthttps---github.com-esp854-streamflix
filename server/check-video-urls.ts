import { config } from "dotenv";
import { storage } from "./storage";

// Load environment variables
config();

async function checkVideoUrls() {
  try {
    console.log("Checking video URLs in database...");
    
    // Get all content from the database
    const contents = await storage.getAllContent();
    
    console.log(`Found ${contents.length} content items in database`);
    
    // Check for HTML-encoded URLs
    const contentWithEncodedUrls = contents.filter(item => 
      item.odyseeUrl && (item.odyseeUrl.includes('&amp;#x2F;') || item.odyseeUrl.includes('&amp;'))
    );
    
    console.log(`Found ${contentWithEncodedUrls.length} items with HTML-encoded URLs`);
    
    if (contentWithEncodedUrls.length > 0) {
      console.log("\nContent with HTML-encoded URLs:");
      contentWithEncodedUrls.forEach(item => {
        console.log(`- ${item.title} (${item.mediaType})`);
        console.log(`  TMDB ID: ${item.tmdbId}`);
        console.log(`  Encoded URL: ${item.odyseeUrl}`);
        
        // Show what the decoded URL would look like
        const decodedUrl = item.odyseeUrl!
          .replace(/&amp;#x2F;/g, '/')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        console.log(`  Decoded URL: ${decodedUrl}`);
        console.log('');
      });
    } else {
      console.log("No HTML-encoded URLs found in the database.");
    }
    
    // Show all content with video URLs (first 10)
    const contentWithVideos = contents.filter(item => item.odyseeUrl);
    console.log(`\nContent with video URLs (${contentWithVideos.length} items):`);
    
    contentWithVideos.slice(0, 10).forEach(item => {
      console.log(`- ${item.title} (${item.mediaType})`);
      console.log(`  TMDB ID: ${item.tmdbId}`);
      console.log(`  Video URL: ${item.odyseeUrl}`);
      console.log('');
    });
    
  } catch (error) {
    console.error("Error checking video URLs:", error);
  }
}

// Run the check
checkVideoUrls();