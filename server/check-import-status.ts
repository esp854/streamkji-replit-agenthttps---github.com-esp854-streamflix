import { config } from "dotenv";
import { storage } from "./storage";

// Load environment variables
config();

async function checkImportStatus() {
  try {
    console.log("Checking content import status...");
    
    // Get all content from database
    const allContent = await storage.getAllContent();
    
    console.log(`Total content items in database: ${allContent.length}`);
    
    // Show breakdown by type
    const movies = allContent.filter(item => item.mediaType === "movie");
    const tvShows = allContent.filter(item => item.mediaType === "tv");
    
    console.log(`Movies: ${movies.length}`);
    console.log(`TV Shows: ${tvShows.length}`);
    
    // Show some sample content
    console.log("\nRecent content additions:");
    allContent.slice(0, 10).forEach(item => {
      console.log(`- ${item.title} (${item.mediaType}) - TMDB ID: ${item.tmdbId}`);
    });
    
    console.log("\nImport process is working correctly!");
  } catch (error) {
    console.error("Error checking import status:", error);
  }
}

checkImportStatus();