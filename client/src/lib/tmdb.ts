// Re-export the robust TMDB service as the main service
// This provides backward compatibility while using the improved rate limiting
export { robustTMDBService as tmdbService } from './tmdb-robust';

// Keep types available for backward compatibility
export type {
  TMDBMovie,
  TMDBResponse,
  MovieDetails,
  TMDBTVSeries,
  TVResponse,
  TVDetails
} from "@/types/movie";

export {
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_BACKDROP_SIZE,
  TMDB_PROFILE_SIZE
} from "@/types/movie";