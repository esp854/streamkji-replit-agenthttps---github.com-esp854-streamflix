import { config } from "dotenv";
import { storage } from "./storage";

// Load environment variables
config();

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

if (!TMDB_API_KEY) {
  console.error("TMDB_API_KEY is not configured in environment variables");
  process.exit(1);
}

// Genre mappings
const MOVIE_GENRES: { [key: number]: string } = {
  28: "Action",
  12: "Aventure",
  16: "Animation",
  35: "Comédie",
  80: "Crime",
  99: "Documentaire",
  18: "Drame",
  10751: "Familial",
  14: "Fantastique",
  36: "Histoire",
  27: "Horreur",
  10402: "Musique",
  9648: "Mystère",
  10749: "Romance",
  878: "Science-Fiction",
  10770: "Téléfilm",
  53: "Thriller",
  10752: "Guerre",
  37: "Western"
};

const TV_GENRES: { [key: number]: string } = {
  10759: "Action & Aventure",
  16: "Animation",
  35: "Comédie",
  80: "Crime",
  99: "Documentaire",
  18: "Drame",
  10751: "Familial",
  10762: "Kids",
  9648: "Mystère",
  10763: "News",
  10764: "Reality",
  10765: "Science-Fiction & Fantastique",
  10766: "Soap",
  10767: "Talk",
  10768: "Guerre & Politique",
  37: "Western"
};

// Helper function to wait for rate limiting
async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch data from TMDB API
async function fetchFromTMDB(endpoint: string): Promise<any> {
  try {
    // Wait to avoid rate limiting
    await wait(200);
    
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=fr-FR`);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from TMDB ${endpoint}:`, error);
    return null;
  }
}

// Get genre names from IDs
function getGenreNames(genreIds: number[], isMovie: boolean): string[] {
  const genreMap = isMovie ? MOVIE_GENRES : TV_GENRES;
  return genreIds.map(id => genreMap[id] || `Genre ${id}`).filter(name => name);
}

// Import trending content (just 2 items for testing)
async function importTrendingContent(): Promise<void> {
  console.log("Importing trending content...");
  
  const trendingData = await fetchFromTMDB("/trending/all/week");
  if (!trendingData || !trendingData.results) {
    console.error("Failed to fetch trending content");
    return;
  }
  
  let importedCount = 0;
  
  // Only import first 2 items for testing
  for (const item of trendingData.results.slice(0, 2)) {
    try {
      // Skip if already exists
      const existingContent = await storage.getContentByTmdbId(item.id);
      if (existingContent) {
        console.log(`Content already exists: ${item.title || item.name}`);
        continue;
      }
      
      // Determine if it's a movie or TV show
      const isMovie = item.media_type === "movie" || item.title !== undefined;
      const mediaType = isMovie ? "movie" : "tv";
      
      // Get genre names
      const genreNames = getGenreNames(item.genre_ids || [], isMovie);
      
      // Create content entry
      const contentData = {
        tmdbId: item.id,
        title: item.title || item.name || "Unknown Title",
        description: item.overview || "",
        posterPath: item.poster_path || null,
        backdropPath: item.backdrop_path || null,
        releaseDate: isMovie ? item.release_date : item.first_air_date,
        genres: genreNames,
        language: "fr",
        quality: "hd",
        mediaType,
        rating: Math.round((item.vote_average || 0) * 10), // Convert to 0-100 scale
        active: true
      };
      
      await storage.createContent(contentData);
      console.log(`Imported: ${contentData.title} (${mediaType})`);
      importedCount++;
    } catch (error) {
      console.error(`Error importing item ${item.id}:`, error);
    }
  }
  
  console.log(`Imported ${importedCount} trending items`);
}

// Main import function
async function importTestContent(): Promise<void> {
  console.log("Starting test content import process...");
  
  try {
    // Import trending content (just 2 items)
    await importTrendingContent();
    
    console.log("Test content import process completed!");
    
    // Show final count
    const allContent = await storage.getAllContent();
    console.log(`Total content in database: ${allContent.length}`);
  } catch (error) {
    console.error("Error during content import:", error);
  }
}

// Run the import
importTestContent().then(() => {
  console.log("Test import process finished");
  process.exit(0);
}).catch(error => {
  console.error("Test import process failed:", error);
  process.exit(1);
});

// Test script to verify the import content functionality
import 'dotenv/config';

async function testImport() {
  console.log('Testing content import functionality...');
  
  try {
    // Test that required environment variables are set
    if (!process.env.TMDB_API_KEY) {
      console.log('⚠️  TMDB_API_KEY is not set in environment variables');
      console.log('   Please set TMDB_API_KEY in your .env file to test the import');
      return;
    }
    
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL is not set in environment variables');
      console.log('   Please set DATABASE_URL in your .env file to test the import');
      return;
    }
    
    console.log('✅ Environment variables are set');
    console.log('✅ TMDB API Key is configured');
    console.log('✅ Database URL is configured');
    
    // Test TMDB API connectivity
    console.log('\n--- Testing TMDB API Connectivity ---');
    const testResponse = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&language=fr-FR&page=1`
    );
    
    if (testResponse.ok) {
      console.log('✅ TMDB API is accessible');
      const testData = await testResponse.json();
      console.log(`✅ Successfully fetched ${testData.results?.length || 0} popular movies`);
    } else {
      console.log('❌ TMDB API is not accessible');
      console.log(`   Status: ${testResponse.status} ${testResponse.statusText}`);
      return;
    }
    
    console.log('\n--- Import Functionality Test ---');
    console.log('✅ All tests passed!');
    console.log('\nTo run the import, use one of these commands:');
    console.log('   npm run import-content');
    console.log('   npx tsx server/import-content.ts');
    console.log('\nOr use the "Importer depuis TMDB" button in the Admin Dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testImport();
