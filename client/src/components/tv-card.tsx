import { Link } from "wouter";
import { Play, Star, Plus, Heart, Share2 } from "lucide-react";
import { TMDBTVSeries, TV_GENRE_MAP } from "@/types/movie";
import { tmdbService } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { useShare } from "@/hooks/use-share";

interface TVCardProps {
  series: TMDBTVSeries;
  size?: "small" | "medium" | "large";
  showOverlay?: boolean;
}

export default function TVCard({ series, size = "medium", showOverlay = true }: TVCardProps) {
  const [imageError, setImageError] = useState(false);
  const { toggleFavorite, checkFavorite, isAddingToFavorites } = useFavorites();
  const { shareContent } = useShare();
  
  // Check if series is favorite
  const { data: favoriteStatus } = checkFavorite(series.id);
  const isFavorite = favoriteStatus?.isFavorite || false;

  const handleImageError = () => {
    setImageError(true);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/watch/tv/${series.id}/1/1`;
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(series, 'tv');
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement watchlist functionality (separate from favorites)
    console.log('Add to watchlist:', series.name);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await shareContent(series, 'tv');
  };

  const sizeClasses = {
    small: "w-40 md:w-48",
    medium: "w-48 md:w-56",
    large: "w-56 md:w-64",
  };

  const heightClasses = {
    small: "h-60 md:h-72",
    medium: "h-72 md:h-80",
    large: "h-80 md:h-96",
  };

  const genres = series.genre_ids?.slice(0, 2).map(id => TV_GENRE_MAP[id]).filter(Boolean) || [];

  return (
    <Link href={`/tv/${series.id}`} className={`flex-shrink-0 ${sizeClasses[size]} group cursor-pointer tv-card block`} data-testid={`tv-card-${series.id}`}>
        <div className="relative overflow-hidden rounded-md transition-transform duration-300 group-hover:scale-105">
          <img
            src={imageError ? "/placeholder-movie.jpg" : tmdbService.getPosterUrl(series.poster_path)}
            alt={series.name}
            className={`w-full ${heightClasses[size]} object-cover`}
            onError={handleImageError}
            data-testid={`tv-poster-${series.id}`}
          />
          
          {showOverlay && (
            <>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={handlePlayClick}
                  className="bg-primary/80 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Play className="w-5 h-5 ml-1" />
                </button>
              </div>
              
              {/* Rating badge */}
              {series.vote_average > 0 && (
                <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded text-sm font-semibold flex items-center space-x-1" data-testid={`tv-rating-${series.id}`}>
                  <Star className="w-3 h-3 fill-current" />
                  <span>{series.vote_average.toFixed(1)}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleToggleFavorite}
                  disabled={isAddingToFavorites}
                  className={`w-8 h-8 rounded-full ${isFavorite ? "bg-primary text-white" : "bg-black/50 text-white"}`}
                  data-testid={`button-favorite-${series.id}`}
                  title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleAddToList}
                  className="w-8 h-8 rounded-full bg-black/50 text-white"
                  data-testid={`button-add-list-${series.id}`}
                  title="Ajouter à ma liste"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-black/50 text-white"
                  data-testid={`button-share-${series.id}`}
                  title="Partager"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-3" data-testid={`tv-info-${series.id}`}>
          <h3 className="text-foreground font-medium group-hover:text-primary transition-colors duration-200 line-clamp-1" data-testid={`tv-title-${series.id}`}>
            {series.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-muted-foreground" data-testid={`tv-year-${series.id}`}>
              {series.first_air_date ? new Date(series.first_air_date).getFullYear() : "Date inconnue"} • {genres.join(", ")}
            </p>
          </div>
        </div>
    </Link>
  );
}