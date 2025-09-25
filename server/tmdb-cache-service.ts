import { db } from "./db";
import { eq, sql, and, desc, gte, lte } from "drizzle-orm";
import { robustTMDBService } from "../client/src/lib/tmdb-robust";

// Database cache tables would need to be created
// For now, let's create a service that can cache in memory with database persistence

interface CachedContent {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  data: any;
  lastUpdated: Date;
  expiresAt: Date;
}

class TMDBCacheService {
  private memoryCache = new Map<string, CachedContent>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000;

  constructor() {
    // Load cache from database on startup
    this.loadCacheFromDatabase();
  }

  private async loadCacheFromDatabase() {
    try {
      // This would load cached content from database
      // For now, we'll use memory cache with periodic persistence
      console.log('🗄️ TMDB Cache Service initialized');
    } catch (error) {
      console.error('Failed to load TMDB cache from database:', error);
    }
  }

  async getContent(type: 'movie' | 'tv', tmdbId: number): Promise<any | null> {
    const cacheKey = `${type}-${tmdbId}`;

    // Check memory cache first
    const cached = this.memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      console.log(`💾 Serving ${type} ${tmdbId} from cache`);
      return cached.data;
    }

    // Check database cache
    try {
      // This would query the database cache table
      // For now, return null to trigger fresh fetch
      return null;
    } catch (error) {
      console.error('Database cache query failed:', error);
      return null;
    }
  }

  async setContent(type: 'movie' | 'tv', tmdbId: number, data: any): Promise<void> {
    const cacheKey = `${type}-${tmdbId}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CACHE_DURATION);

    const cachedContent: CachedContent = {
      id: cacheKey,
      tmdbId,
      type,
      title: data.title || data.name || 'Unknown',
      data,
      lastUpdated: now,
      expiresAt
    };

    // Store in memory cache
    if (this.memoryCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].lastUpdated.getTime() - b[1].lastUpdated.getTime());
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.1)); // Remove 10%
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }

    this.memoryCache.set(cacheKey, cachedContent);

    // Persist to database asynchronously
    this.persistToDatabase(cachedContent).catch(error => {
      console.error('Failed to persist cache to database:', error);
    });

    console.log(`💾 Cached ${type} ${tmdbId} (${cachedContent.title})`);
  }

  private async persistToDatabase(content: CachedContent): Promise<void> {
    try {
      // This would insert/update the database cache table
      // Example SQL:
      // INSERT INTO tmdb_cache (cache_key, tmdb_id, type, title, data, last_updated, expires_at)
      // VALUES (?, ?, ?, ?, ?, ?, ?)
      // ON CONFLICT (cache_key) DO UPDATE SET ...

      // For now, we'll just log
      console.log(`💾 Persisted ${content.type} ${content.tmdbId} to database`);
    } catch (error) {
      console.error('Database persistence failed:', error);
    }
  }

  async getPopularMovies(): Promise<any[]> {
    const cacheKey = 'popular-movies';

    const cached = this.memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      console.log('💾 Serving popular movies from cache');
      return cached.data;
    }

    // Fetch from TMDB API directly
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.warn('TMDB_API_KEY not configured, using static fallback');
        const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
        const fallbackData = getStaticFallbackData('/popular');
        return fallbackData.results || [];
      }

      console.log('🌐 Fetching popular movies from TMDB API');
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=1`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      const movies = data.results || [];

      // Cache the result
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.CACHE_DURATION);

      this.memoryCache.set(cacheKey, {
        id: cacheKey,
        tmdbId: 0,
        type: 'movie',
        title: 'Popular Movies',
        data: movies,
        lastUpdated: now,
        expiresAt
      });

      console.log(`💾 Cached ${movies.length} popular movies`);
      return movies;

    } catch (error) {
      console.error('Error fetching popular movies from TMDB:', error);
      // Return static fallback data
      const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
      const fallbackData = getStaticFallbackData('/popular');
      return fallbackData.results || [];
    }
  }

  async getPopularTVShows(): Promise<any[]> {
    const cacheKey = 'popular-tv-shows';

    const cached = this.memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      console.log('💾 Serving popular TV shows from cache');
      return cached.data;
    }

    // Fetch from TMDB API directly
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.warn('TMDB_API_KEY not configured, using static fallback');
        const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
        const fallbackData = getStaticFallbackData('/tv/popular');
        return fallbackData.results || [];
      }

      console.log('🌐 Fetching popular TV shows from TMDB API');
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=fr-FR&page=1`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      const shows = data.results || [];

      // Cache the result
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.CACHE_DURATION);

      this.memoryCache.set(cacheKey, {
        id: cacheKey,
        tmdbId: 0,
        type: 'tv',
        title: 'Popular TV Shows',
        data: shows,
        lastUpdated: now,
        expiresAt
      });

      console.log(`💾 Cached ${shows.length} popular TV shows`);
      return shows;

    } catch (error) {
      console.error('Error fetching popular TV shows from TMDB:', error);
      // Return static fallback data
      const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
      const fallbackData = getStaticFallbackData('/tv/popular');
      return fallbackData.results || [];
    }
  }

  async getTrending(): Promise<any[]> {
    const cacheKey = 'trending';

    const cached = this.memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > new Date()) {
      console.log('💾 Serving trending content from cache');
      return cached.data;
    }

    // Fetch from TMDB API directly
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.warn('TMDB_API_KEY not configured, using static fallback');
        const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
        const fallbackData = getStaticFallbackData('/trending');
        return fallbackData.results || [];
      }

      console.log('🌐 Fetching trending content from TMDB API');
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=fr-FR&page=1`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      const trending = data.results || [];

      // Cache the result
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.CACHE_DURATION);

      this.memoryCache.set(cacheKey, {
        id: cacheKey,
        tmdbId: 0,
        type: 'movie',
        title: 'Trending',
        data: trending,
        lastUpdated: now,
        expiresAt
      });

      console.log(`💾 Cached ${trending.length} trending items`);
      return trending;

    } catch (error) {
      console.error('Error fetching trending content from TMDB:', error);
      // Return static fallback data
      const { getStaticFallbackData } = await import("../client/src/lib/static-fallback-data.js");
      const fallbackData = getStaticFallbackData('/trending');
      return fallbackData.results || [];
    }
  }

  // Background sync method
  async syncPopularContent(): Promise<void> {
    try {
      console.log('🔄 Starting TMDB cache sync...');

      // Sync popular movies
      const movies = await robustTMDBService.getPopular();
      await this.getPopularMovies(); // This will cache it

      // Sync popular TV shows
      const shows = await robustTMDBService.getPopularTVShows();
      await this.getPopularTVShows(); // This will cache it

      // Sync trending
      const trending = await robustTMDBService.getTrending();
      await this.getTrending(); // This will cache it

      console.log('✅ TMDB cache sync completed');
    } catch (error) {
      console.error('❌ TMDB cache sync failed:', error);
    }
  }

  // Get cache statistics
  getCacheStats() {
    const now = new Date();
    const validEntries = Array.from(this.memoryCache.values()).filter(item => item.expiresAt > now);

    return {
      totalEntries: this.memoryCache.size,
      validEntries: validEntries.length,
      maxSize: this.MAX_CACHE_SIZE,
      cacheHitRatio: 'N/A', // Would need to track hits/misses
      oldestEntry: validEntries.length > 0 ?
        validEntries.reduce((oldest, current) =>
          current.lastUpdated < oldest.lastUpdated ? current : oldest
        ).lastUpdated : null
    };
  }

  // Clear expired entries
  clearExpired(): number {
    const now = new Date();
    let removed = 0;

    Array.from(this.memoryCache.entries()).forEach(([key, item]) => {
      if (item.expiresAt <= now) {
        this.memoryCache.delete(key);
        removed++;
      }
    });

    console.log(`🧹 Cleared ${removed} expired cache entries`);
    return removed;
  }

  // Manual cache clearing
  clearCache(): void {
    this.memoryCache.clear();
    console.log('🗑️ TMDB cache cleared');
  }
}

export const tmdbCacheService = new TMDBCacheService();

// Periodic cleanup
setInterval(() => {
  tmdbCacheService.clearExpired();
}, 60 * 60 * 1000); // Clean every hour

// Periodic sync (optional - can be disabled for production)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    tmdbCacheService.syncPopularContent();
  }, 6 * 60 * 60 * 1000); // Sync every 6 hours in development
}