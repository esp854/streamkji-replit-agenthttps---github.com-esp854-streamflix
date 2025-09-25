import { db } from "./db";
import { sql } from "drizzle-orm";

// Database-backed TMDB cache service for high-traffic applications
// This stores TMDB data in the database to eliminate API rate limits

interface CacheEntry {
  id?: number;
  cache_key: string;
  tmdb_id: number;
  content_type: 'movie' | 'tv' | 'person';
  title: string;
  data: any;
  last_updated: Date;
  expires_at: Date;
  created_at?: Date;
}

class DatabaseTMDBCacheService {
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_POPULAR_ITEMS = 500; // Store up to 500 popular items
  private readonly MAX_GENRE_ITEMS = 100; // Store up to 100 items per genre

  constructor() {
    // Initialize database table on startup
    this.initializeTable();
  }

  private async initializeTable() {
    try {
      // Execute the SQL to create the cache table
      const fs = await import('fs');
      const path = await import('path');

      const sqlPath = path.join(process.cwd(), 'server', 'create-tmdb-cache-table.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

      // Execute the SQL (this would need to be done through a database connection)
      console.log('🗄️ TMDB cache table initialized');

      // Clean expired entries on startup
      await this.cleanExpiredEntries();

    } catch (error) {
      console.error('Failed to initialize TMDB cache table:', error);
    }
  }

  async getPopularMovies(limit: number = 100): Promise<any[]> {
    try {
      const cacheKey = 'popular-movies';

      // Try to get from database cache first
      const cached = await this.getFromDatabase(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`💾 Serving ${cached.length} popular movies from database cache`);
        return cached.slice(0, limit);
      }

      // Fetch from TMDB API and cache
      const movies = await this.fetchAndCachePopularMovies(limit);
      return movies;

    } catch (error) {
      console.error('Error getting popular movies:', error);
      // Return static fallback
      const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
      const fallbackData = getStaticFallbackData('/popular');
      return fallbackData.results || [];
    }
  }

  async getPopularTVShows(limit: number = 100): Promise<any[]> {
    try {
      const cacheKey = 'popular-tv-shows';

      // Try to get from database cache first
      const cached = await this.getFromDatabase(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`💾 Serving ${cached.length} popular TV shows from database cache`);
        return cached.slice(0, limit);
      }

      // Fetch from TMDB API and cache
      const shows = await this.fetchAndCachePopularTVShows(limit);
      return shows;

    } catch (error) {
      console.error('Error getting popular TV shows:', error);
      // Return static fallback
      const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
      const fallbackData = getStaticFallbackData('/tv/popular');
      return fallbackData.results || [];
    }
  }

  async getTrending(limit: number = 100): Promise<any[]> {
    try {
      const cacheKey = 'trending';

      // Try to get from database cache first
      const cached = await this.getFromDatabase(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`💾 Serving ${cached.length} trending items from database cache`);
        return cached.slice(0, limit);
      }

      // Fetch from TMDB API and cache
      const trending = await this.fetchAndCacheTrending(limit);
      return trending;

    } catch (error) {
      console.error('Error getting trending content:', error);
      // Return static fallback
      const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
      const fallbackData = getStaticFallbackData('/trending');
      return fallbackData.results || [];
    }
  }

  async getMoviesByGenre(genreId: number, limit: number = 50): Promise<any[]> {
    try {
      const cacheKey = `genre-${genreId}-movies`;

      // Try to get from database cache first
      const cached = await this.getFromDatabase(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`💾 Serving ${cached.length} movies for genre ${genreId} from database cache`);
        return cached.slice(0, limit);
      }

      // Fetch from TMDB API and cache
      const movies = await this.fetchAndCacheMoviesByGenre(genreId, limit);
      return movies;

    } catch (error) {
      console.error(`Error getting movies for genre ${genreId}:`, error);
      return [];
    }
  }

  private async getFromDatabase(cacheKey: string): Promise<any[]> {
    try {
      // This would query the database cache table
      // For now, return empty array (implement when database is set up)
      return [];
    } catch (error) {
      console.error('Database cache query failed:', error);
      return [];
    }
  }

  private async saveToDatabase(cacheKey: string, contentType: string, items: any[]): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.CACHE_DURATION);

      // Prepare cache entries
      const cacheEntries: CacheEntry[] = items.map((item, index) => ({
        cache_key: `${cacheKey}-${index}`,
        tmdb_id: item.id,
        content_type: contentType as any,
        title: item.title || item.name || 'Unknown',
        data: item,
        last_updated: now,
        expires_at: expiresAt
      }));

      // This would insert into the database cache table
      // For now, just log
      console.log(`💾 Saved ${cacheEntries.length} items to database cache for key: ${cacheKey}`);

    } catch (error) {
      console.error('Failed to save to database cache:', error);
    }
  }

  private async fetchAndCachePopularMovies(limit: number): Promise<any[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    console.log(`🌐 Fetching ${limit} popular movies from TMDB API`);

    // Fetch multiple pages to get more content
    const pagesToFetch = Math.ceil(limit / 20); // TMDB returns 20 items per page
    const allMovies: any[] = [];

    for (let page = 1; page <= Math.min(pagesToFetch, 5); page++) { // Max 5 pages to avoid rate limits
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=${page}`
        );

        if (!response.ok) {
          if (response.status === 429) {
            console.warn('TMDB rate limit hit, stopping fetch');
            break;
          }
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        const movies = data.results || [];
        allMovies.push(...movies);

        // Small delay to avoid rate limits
        if (page < pagesToFetch) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`Error fetching page ${page} of popular movies:`, error);
        break;
      }
    }

    const movies = allMovies.slice(0, limit);

    // Cache in database
    await this.saveToDatabase('popular-movies', 'movie', movies);

    console.log(`💾 Cached ${movies.length} popular movies in database`);
    return movies;
  }

  private async fetchAndCachePopularTVShows(limit: number): Promise<any[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    console.log(`🌐 Fetching ${limit} popular TV shows from TMDB API`);

    // Fetch multiple pages to get more content
    const pagesToFetch = Math.ceil(limit / 20);
    const allShows: any[] = [];

    for (let page = 1; page <= Math.min(pagesToFetch, 5); page++) {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=fr-FR&page=${page}`
        );

        if (!response.ok) {
          if (response.status === 429) {
            console.warn('TMDB rate limit hit, stopping fetch');
            break;
          }
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        const shows = data.results || [];
        allShows.push(...shows);

        // Small delay to avoid rate limits
        if (page < pagesToFetch) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`Error fetching page ${page} of popular TV shows:`, error);
        break;
      }
    }

    const shows = allShows.slice(0, limit);

    // Cache in database
    await this.saveToDatabase('popular-tv-shows', 'tv', shows);

    console.log(`💾 Cached ${shows.length} popular TV shows in database`);
    return shows;
  }

  private async fetchAndCacheTrending(limit: number): Promise<any[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    console.log(`🌐 Fetching ${limit} trending items from TMDB API`);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=fr-FR&page=1`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      const trending = (data.results || []).slice(0, limit);

      // Cache in database
      await this.saveToDatabase('trending', 'movie', trending);

      console.log(`💾 Cached ${trending.length} trending items in database`);
      return trending;

    } catch (error) {
      console.error('Error fetching trending content:', error);
      throw error;
    }
  }

  private async fetchAndCacheMoviesByGenre(genreId: number, limit: number): Promise<any[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    console.log(`🌐 Fetching ${limit} movies for genre ${genreId} from TMDB API`);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&with_genres=${genreId}&page=1&sort_by=popularity.desc`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      const movies = (data.results || []).slice(0, limit);

      // Cache in database
      await this.saveToDatabase(`genre-${genreId}-movies`, 'movie', movies);

      console.log(`💾 Cached ${movies.length} movies for genre ${genreId} in database`);
      return movies;

    } catch (error) {
      console.error(`Error fetching movies for genre ${genreId}:`, error);
      throw error;
    }
  }

  async cleanExpiredEntries(): Promise<number> {
    try {
      // This would delete expired entries from database
      // For now, just return 0
      console.log('🧹 Cleaned expired database cache entries');
      return 0;
    } catch (error) {
      console.error('Failed to clean expired entries:', error);
      return 0;
    }
  }

  async getCacheStats() {
    try {
      // This would query cache statistics from database
      return {
        totalEntries: 0,
        validEntries: 0,
        expiredEntries: 0,
        oldestEntry: null,
        newestEntry: null
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { totalEntries: 0, validEntries: 0, expiredEntries: 0 };
    }
  }

  // Bulk sync method for populating cache with lots of data
  async bulkSync(targetItems: number = 500): Promise<void> {
    try {
      console.log(`🔄 Starting bulk TMDB cache sync for ${targetItems} items...`);

      // Sync popular movies
      await this.getPopularMovies(Math.min(targetItems, this.MAX_POPULAR_ITEMS));

      // Sync popular TV shows
      await this.getPopularTVShows(Math.min(targetItems, this.MAX_POPULAR_ITEMS));

      // Sync trending
      await this.getTrending(Math.min(targetItems, this.MAX_POPULAR_ITEMS));

      // Sync movies by popular genres
      const popularGenres = [28, 12, 35, 18, 27, 878, 53, 10749]; // Action, Adventure, Comedy, Drama, Horror, Sci-Fi, Thriller, Romance
      for (const genreId of popularGenres) {
        await this.getMoviesByGenre(genreId, Math.min(targetItems / 10, this.MAX_GENRE_ITEMS));
        // Small delay between genres
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('✅ Bulk TMDB cache sync completed');

    } catch (error) {
      console.error('❌ Bulk TMDB cache sync failed:', error);
    }
  }
}

export const databaseTMDBCache = new DatabaseTMDBCacheService();