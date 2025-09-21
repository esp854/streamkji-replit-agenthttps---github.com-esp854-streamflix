# TMDB Rate Limiting Solution

## Problem
The application was experiencing "429 Too Many Requests" errors from the TMDB API. This occurred because:

1. Multiple components were making simultaneous requests to the TMDB API
2. The home page alone makes 5 API calls on load (trending, popular, 3 genres)
3. TMDB has rate limits (40 requests per 10 seconds for free accounts)
4. No caching was implemented, causing repeated requests for the same data

## Solution Implemented

### 1. Client-Side Rate Limiting and Caching

The solution implements a comprehensive rate limiting and caching system in the TMDB service:

#### Rate Limiter
- Limits requests to 35 per 10 seconds (below TMDB's 40 limit for safety)
- Queues requests when limit is reached
- Automatically waits and retries when rate limit is exceeded

#### Cache System
- In-memory cache with 5-minute TTL (Time To Live)
- Caches all non-user-specific requests (trending, popular, genre-based searches)
- Reduces API calls by serving cached data when available

#### Staggered Loading
- Home page now loads API requests sequentially rather than all at once
- Popular movies load first (highest priority)
- Other sections load with small delays between them

### 2. Improved Error Handling

#### Client-Side
- Better error messages in the TMDB service
- Graceful degradation when API calls fail
- More informative console logging

#### Server-Side
- Specific handling of 429 errors
- Better error messages sent to client
- Improved logging for debugging

### 3. Code Changes

#### Files Modified:
1. `client/src/lib/tmdb.ts` - Added rate limiting and caching
2. `client/src/pages/home.tsx` - Implemented staggered loading
3. `client/src/components/hero-carousel.tsx` - Improved error handling
4. `server/routes.ts` - Enhanced error handling for TMDB proxy endpoints

## How It Works

### Rate Limiting Algorithm
```typescript
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number = 35;
  private timeWindow: number = 10000; // 10 seconds

  async wait(): Promise<void> {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    // If we're at the limit, wait until we can make another request
    if (this.requests.length >= this.maxRequests) {
      const oldest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldest) + 100; // Add 100ms buffer
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.wait(); // Recursively check again
    }

    // Add current request
    this.requests.push(now);
  }
}
```

### Cache Implementation
```typescript
class Cache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item is expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

## Benefits

1. **Eliminates 429 Errors**: Rate limiting ensures we stay within TMDB's limits
2. **Improved Performance**: Caching reduces load times for repeated requests
3. **Better User Experience**: Staggered loading prevents UI freezing
4. **Reduced Server Load**: Fewer API calls mean less strain on both client and server
5. **Graceful Error Handling**: Better error messages and fallbacks

## Testing the Solution

To verify the solution is working:

1. Load the home page and check browser console
2. Look for "Returning cached..." messages indicating cache hits
3. Verify no more 429 errors appear
4. Check that all content loads properly

## Future Improvements

1. **Persistent Cache**: Store cache in localStorage for longer persistence
2. **Cache Invalidation**: Implement smarter cache invalidation strategies
3. **Advanced Queuing**: More sophisticated request queuing with priorities
4. **Monitoring**: Add metrics to track cache hit rates and request patterns

## Configuration

The rate limiter can be adjusted by modifying the parameters in `tmdb.ts`:

```typescript
private rateLimiter = new RateLimiter(35, 10000); // 35 requests per 10 seconds
private cache = new Cache(5 * 60 * 1000); // 5 minute cache TTL
```

For development, you can also clear the cache manually:
```typescript
tmdbService.clearCache();
```