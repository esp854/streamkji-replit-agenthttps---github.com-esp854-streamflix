import { config } from "dotenv";
import { storage } from "./storage";

// Load environment variables
config();

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error("TMDB_API_KEY is not configured in environment variables");
  process.exit(1);
}

console.log("TMDB API Key is configured");

// Simple test to verify import functionality
console.log('Import functionality is ready to use!');
console.log('Run "npm run import-content" to import popular movies and TV shows from TMDB.');

// Test database connection by getting content count
async function testDatabase() {
  try {
    const content = await storage.getAllContent();
    console.log(`Database connection successful. Current content count: ${content.length}`);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

// Test TMDB API
async function testTMDB() {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/550?api_key=${TMDB_API_KEY}`);
    if (response.ok) {
      console.log("TMDB API connection successful");
    } else {
      console.error(`TMDB API connection failed: ${response.status} ${response.statusText}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("TMDB API connection failed:", error);
    process.exit(1);
  }
}

async function runTests() {
  await testDatabase();
  await testTMDB();
  console.log("All tests passed!");
  process.exit(0);
}

runTests();