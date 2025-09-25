import { TMDBMovie, TMDBResponse, MovieDetails, TMDBTVSeries, TVResponse, TVDetails, TMDB_IMAGE_BASE_URL, TMDB_POSTER_SIZE, TMDB_BACKDROP_SIZE, TMDB_PROFILE_SIZE } from "@/types/movie";
import { getStaticFallbackData } from "./static-fallback-data";

// Advanced rate limiter with exponential backoff
class AdvancedRateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;
  private backoffMultiplier: number = 1;
  private consecutiveErrors: number = 0;
  private lastErrorTime: number = 0;
  private circuitBreakerOpen: boolean = false;
  private circuitBreakerTimeout: number = 60000; // 1 minute

  constructor(maxRequests: number = 20, timeWindow: number = 15000) { // Reduced to 20 requests per 15 seconds
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  async wait(): Promise<void> {
    const now = Date.now();

    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      if (now - this.lastErrorTime < this.circuitBreakerTimeout) {
        throw new Error('Circuit breaker is open - TMDB API temporarily unavailable');
      } else {
        this.circuitBreakerOpen = false;
        this.consecutiveErrors = 0;
      }
    }

    // Clean old requests
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    // Check if we're at the limit
    if (this.requests.length >= this.maxRequests) {
      const oldest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldest) + (Math.random() * 1000); // Add jitter
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.wait(); // Recursively check again
    }

    // Add current request
    this.requests.push(now);
  }

  recordError(): void {
    this.consecutiveErrors++;
    this.lastErrorTime = Date.now();

    if (this.consecutiveErrors >= 5) {
      this.circuitBreakerOpen = true;
      console.warn('Circuit breaker opened due to consecutive errors');
    }
  }

  recordSuccess(): void {
    this.consecutiveErrors = 0;
    this.circuitBreakerOpen = false;
  }
}

// Request queue for managing concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing: boolean = false;
  private maxConcurrent: number = 2;

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxConcurrent);

      try {
        await Promise.allSettled(batch.map(fn => fn()));
      } catch (error) {
        console.error('Batch processing error:', error);
      }

      // Small delay between batches
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.processing = false;
  }
}

// Enhanced cache with TTL and size limits
class EnhancedCache {
  private cache: Map<string, { data: any; timestamp: number; hits: number }> = new Map();
  private ttl: number;
  private maxSize: number;

  constructor(ttl: number = 30 * 60 * 1000, maxSize: number = 200) { // 30 minutes, 200 items (increased for high traffic)
    this.ttl = ttl;
    this.maxSize = maxSize;
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    item.hits++;
    return item.data;
  }

  set(key: string, data: any): void {
    // Clean up if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastHits = Infinity;

    this.cache.forEach((item, key) => {
      if (item.hits < leastHits) {
        leastHits = item.hits;
        leastUsedKey = key;
      }
    });

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

class RobustTMDBService {
  private baseUrl = "/api/tmdb";
  private cache = new EnhancedCache();
  private rateLimiter = new AdvancedRateLimiter();
  private requestQueue = new RequestQueue();

  async makeRequest<T>(url: string, cacheKey: string): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`Returning cached data for ${cacheKey}`);
      return cached;
    }

    // Queue the request
    return this.requestQueue.add(async () => {
      try {
        // Wait for rate limiter
        await this.rateLimiter.wait();

        console.log(`Making TMDB request: ${url}`);
        const response = await fetch(url);

        // Handle rate limiting
        if (response.status === 429) {
          this.rateLimiter.recordError();
          console.warn('TMDB rate limit hit, using fallback data');

          // Return mock data for rate limited requests
          return this.getMockData<T>(url);
        }

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful response
        this.cache.set(cacheKey, data);
        this.rateLimiter.recordSuccess();

        return data;

      } catch (error) {
        console.error(`Request failed for ${url}:`, error);
        this.rateLimiter.recordError();

        // Return mock data on error
        return this.getMockData<T>(url);
      }
    });
  }

  private getMockData<T>(url: string): T {
    console.warn('🔄 TMDB API rate limited, using static fallback data');

    // Try to use static fallback data first
    try {
      const staticData = getStaticFallbackData(url);
      if (staticData && staticData.results && staticData.results.length > 0) {
        console.log('📦 Using static fallback data for:', url);
        return staticData as T;
      }
    } catch (error) {
      console.error('Error loading static fallback data:', error);
    }

    // Fallback to basic mock data if static data fails
    if (url.includes('/trending')) {
      return {
        results: [
          {
            id: 1,
            title: "Contenu temporaire - API limitée",
            overview: "Contenu chargé depuis le cache local. L'API TMDB est actuellement limitée. Veuillez réessayer dans quelques minutes.",
            release_date: new Date().toISOString().split('T')[0],
            vote_average: 7.5,
            poster_path: "/placeholder-poster.jpg",
            backdrop_path: "/placeholder-backdrop.jpg",
            genre_ids: [28, 12, 878]
          }
        ]
      } as T;
    }

    if (url.includes('/popular') && url.includes('/movie')) {
      return {
        results: [
          {
            id: 1,
            title: "Films populaires - Cache local",
            overview: "Contenu chargé depuis le cache en raison de limitations API TMDB.",
            release_date: "2023-01-01",
            vote_average: 7.0,
            poster_path: "/placeholder-poster.jpg",
            backdrop_path: "/placeholder-backdrop.jpg",
            genre_ids: [28, 12]
          }
        ]
      } as T;
    }

    if (url.includes('/tv/popular')) {
      return {
        results: [
          {
            id: 1,
            name: "Séries populaires - Cache",
            overview: "Contenu TMDB chargé depuis le cache local.",
            first_air_date: "2022-01-01",
            vote_average: 8.0,
            poster_path: "/placeholder-poster.jpg",
            backdrop_path: "/placeholder-backdrop.jpg",
            genre_ids: [18, 9648]
          }
        ]
      } as T;
    }

    // Default empty response
    return { results: [] } as T;
  }

  async getTrending(): Promise<TMDBMovie[]> {
    const cacheKey = "trending";
    const data: TMDBResponse = await this.makeRequest(`${this.baseUrl}/trending`, cacheKey);
    return data.results || [];
  }

  async getPopular(): Promise<TMDBMovie[]> {
    const cacheKey = "popular";
    const data: TMDBResponse = await this.makeRequest(`${this.baseUrl}/popular`, cacheKey);
    return data.results || [];
  }

  async getMoviesByGenre(genreId: number): Promise<TMDBMovie[]> {
    const cacheKey = `genre-${genreId}`;
    const data: TMDBResponse = await this.makeRequest(`${this.baseUrl}/genre/${genreId}`, cacheKey);
    return data.results || [];
  }

  async getMovieDetails(id: number): Promise<MovieDetails> {
    const cacheKey = `movie-${id}`;
    const data = await this.makeRequest(`${this.baseUrl}/movie/${id}`, cacheKey);
    return data as MovieDetails;
  }

  async searchMovies(query: string): Promise<TMDBMovie[]> {
    // Don't cache search results
    try {
      await this.rateLimiter.wait();
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Search rate limited, returning empty results');
          return [];
        }
        throw new Error("Failed to search movies");
      }
      const data: TMDBResponse = await response.json();
      this.rateLimiter.recordSuccess();
      return data.results || [];
    } catch (error) {
      console.error("Error searching movies:", error);
      this.rateLimiter.recordError();
      return [];
    }
  }

  // TV Series methods
  async getPopularTVShows(): Promise<TMDBTVSeries[]> {
    const cacheKey = "tv-popular";
    const data: TVResponse = await this.makeRequest(`${this.baseUrl}/tv/popular`, cacheKey);
    return data.results || [];
  }

  async getTopRatedTVShows(): Promise<TMDBTVSeries[]> {
    const cacheKey = "tv-top-rated";
    const data: TVResponse = await this.makeRequest(`${this.baseUrl}/tv/top_rated`, cacheKey);
    return data.results || [];
  }

  async getOnTheAirTVShows(): Promise<TMDBTVSeries[]> {
    const cacheKey = "tv-on-the-air";
    const data: TVResponse = await this.makeRequest(`${this.baseUrl}/tv/on_the_air`, cacheKey);
    return data.results || [];
  }

  async getAiringTodayTVShows(): Promise<TMDBTVSeries[]> {
    const cacheKey = "tv-airing-today";
    const data: TVResponse = await this.makeRequest(`${this.baseUrl}/tv/airing_today`, cacheKey);
    return data.results || [];
  }

  async getTVShowsByGenre(genreId: number): Promise<TMDBTVSeries[]> {
    const cacheKey = `tv-genre-${genreId}`;
    const data: TVResponse = await this.makeRequest(`${this.baseUrl}/tv/genre/${genreId}`, cacheKey);
    return data.results || [];
  }

  async getTVShowDetails(id: number): Promise<TVDetails | any> {
    const cacheKey = `tv-${id}`;
    const data = await this.makeRequest(`${this.baseUrl}/tv/${id}`, cacheKey);
    return data;
  }

  async getTVSeasonDetails(tvId: number, seasonNumber: number): Promise<any> {
    const cacheKey = `tv-${tvId}-season-${seasonNumber}`;
    const data = await this.makeRequest(`${this.baseUrl}/tv/${tvId}/season/${seasonNumber}`, cacheKey);
    return data;
  }

  async searchTVShows(query: string): Promise<TMDBTVSeries[]> {
    try {
      await this.rateLimiter.wait();
      const response = await fetch(`${this.baseUrl}/tv/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('TV search rate limited, returning empty results');
          return [];
        }
        throw new Error("Failed to search TV shows");
      }
      const data: TVResponse = await response.json();
      this.rateLimiter.recordSuccess();
      return data.results || [];
    } catch (error) {
      console.error("Error searching TV shows:", error);
      this.rateLimiter.recordError();
      return [];
    }
  }

  async multiSearch(query: string): Promise<(TMDBMovie | TMDBTVSeries)[]> {
    try {
      await this.rateLimiter.wait();
      const response = await fetch(`${this.baseUrl}/multi-search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Multi-search rate limited, returning empty results');
          return [];
        }
        throw new Error("Failed to search content");
      }
      const data = await response.json();
      this.rateLimiter.recordSuccess();
      return data.results || [];
    } catch (error) {
      console.error("Error searching content:", error);
      this.rateLimiter.recordError();
      return [];
    }
  }

  // Utility methods
  getImageUrl(path: string | null, size: string = TMDB_POSTER_SIZE): string {
    if (!path) return "/placeholder-movie.jpg";
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getPosterUrl(path: string | null): string {
    return this.getImageUrl(path, TMDB_POSTER_SIZE);
  }

  getBackdropUrl(path: string | null): string {
    return this.getImageUrl(path, TMDB_BACKDROP_SIZE);
  }

  getProfileUrl(path: string | null): string {
    return this.getImageUrl(path, TMDB_PROFILE_SIZE);
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    console.log("TMDB cache cleared");
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size(),
      maxSize: 100
    };
  }
}

export const robustTMDBService = new RobustTMDBService();