import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Plus, Heart, Share2, Star, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tmdbService } from "@/lib/tmdb";
import { useFavorites } from "@/hooks/use-favorites";
import { useShare } from "@/hooks/use-share";
import { useSEO, generateContentSEO } from "@/hooks/use-seo";
import MovieRow from "@/components/movie-row";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "0");
  const { toggleFavorite, checkFavorite, isAddingToFavorites } = useFavorites();
  const { shareCurrentPage } = useShare();

  const { data: movieDetails, isLoading } = useQuery({
    queryKey: [`/api/tmdb/movie/${movieId}`],
    queryFn: () => tmdbService.getMovieDetails(movieId),
    enabled: !!movieId,
  });

  // Check if movie is favorite
  const { data: favoriteStatus } = checkFavorite(movieId);
  const isFavorite = favoriteStatus?.isFavorite || false;

  const { data: similarMovies } = useQuery({
    queryKey: [`/api/tmdb/similar/${movieId}`],
    queryFn: () => {
      // For now, get movies from the same primary genre
      const primaryGenre = movieDetails?.movie.genres?.[0]?.id;
      return primaryGenre ? tmdbService.getMoviesByGenre(primaryGenre) : [];
    },
    enabled: !!movieDetails?.movie.genres?.[0]?.id,
  });

  const handleToggleFavorite = async () => {
    if (movieDetails?.movie) {
      await toggleFavorite(movieDetails.movie, 'movie');
    }
  };

  const handleAddToList = () => {
    // TODO: Implement watchlist functionality
    console.log('Add to watchlist:', movieDetails?.movie.title);
  };

  const handleShare = async () => {
    if (movieDetails?.movie) {
      await shareCurrentPage(movieDetails.movie.title);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="movie-detail-loading">
        <div className="relative h-96 bg-muted animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="movie-detail-error">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Film non trouvé</h1>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { movie, credits, videos } = movieDetails;
  const cast = credits.cast.slice(0, 8);
  const trailer = videos.results.find(video => video.type === "Trailer" && video.site === "YouTube");

  // SEO optimization
  const seoData = movie ? generateContentSEO(movie, 'movie') : {};
  useSEO(seoData);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="movie-detail-page">
      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[70vh] md:h-screen">
        <img
          src={tmdbService.getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          className="w-full h-full object-cover"
          data-testid="movie-backdrop"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>

        {/* Back button */}
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 sm:top-8 sm:left-8 bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full z-10"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </Link>

        {/* Movie info */}
        <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-8 md:left-16 md:bottom-16 max-w-3xl z-10">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-3 sm:mb-4" data-testid="movie-title">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-white/80 mb-4 sm:mb-6 text-sm sm:text-base" data-testid="movie-metadata">
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </span>
            {movie.runtime && (
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{formatRuntime(movie.runtime)}</span>
              </span>
            )}
            <span className="hidden md:inline">{movie.genres?.map(g => g.name).join(", ")}</span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-current" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>

          {/* Mobile-only genres */}
          <div className="md:hidden mb-4">
            <span className="text-white/80 text-sm">{movie.genres?.map(g => g.name).join(", ")}</span>
          </div>

          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none" data-testid="movie-overview">
            {movie.overview}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" data-testid="movie-actions">
            <Link href={`/watch/movie/${movieId}`} className="w-full sm:w-auto">
              <Button className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto" data-testid="watch-button">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Regarder</span>
              </Button>
            </Link>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Button className="btn-secondary flex items-center space-x-2 flex-1 sm:flex-none" onClick={handleAddToList} data-testid="add-list-button">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Ma Liste</span>
                <span className="sm:hidden">Liste</span>
              </Button>
              <Button
                className={`btn-secondary flex items-center space-x-2 flex-1 sm:flex-none ${isFavorite ? 'bg-primary text-white' : ''}`}
                onClick={handleToggleFavorite}
                disabled={isAddingToFavorites}
                data-testid="favorite-button"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isFavorite ? 'Retirer des favoris' : 'Favoris'}</span>
                <span className="sm:hidden">Favoris</span>
              </Button>
              <Button className="btn-secondary flex items-center space-x-2 flex-1 sm:flex-none" onClick={handleShare} data-testid="share-button">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Partager</span>
                <span className="sm:hidden">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Cast */}
        {cast.length > 0 && (
          <section data-testid="cast-section">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-8 text-foreground">Distribution</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-6" data-testid="cast-grid">
              {cast.map((actor) => (
                <div key={actor.id} className="text-center" data-testid={`cast-member-${actor.id}`}>
                  <img
                    src={tmdbService.getProfileUrl(actor.profile_path)}
                    alt={actor.name}
                    className="w-full aspect-square rounded-lg object-cover mb-2"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-profile.jpg";
                    }}
                  />
                  <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">{actor.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Similar Movies */}
        {similarMovies && similarMovies.length > 0 && (
          <section data-testid="similar-movies-section">
            <MovieRow
              title="Films Similaires"
              movies={similarMovies}
              isLoading={false}
            />
          </section>
        )}
      </div>
    </div>
  );
}