import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '@/lib/tmdb';
import MovieCard from '@/components/movie-card';
import MovieRow from '@/components/movie-row';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Clock } from 'lucide-react';

export default function TrendingPage() {
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');

  const { data: trendingMovies, isLoading: moviesLoading, error: moviesError } = useQuery({
    queryKey: ['trending', 'movie', timeWindow],
    queryFn: () => tmdbService.getTrending(),
  });

  const { data: trendingShows, isLoading: showsLoading, error: showsError } = useQuery({
    queryKey: ['trending', 'tv', timeWindow],
    queryFn: () => tmdbService.getTrending(),
  });

  if (moviesLoading || showsLoading) {
    return (
      <div className="min-h-screen bg-background py-8" data-testid="trending-loading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-10 bg-muted rounded animate-pulse mb-4 w-64"></div>
            <div className="h-6 bg-muted rounded animate-pulse w-96"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 18 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="bg-muted rounded-md h-72 md:h-80 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="bg-muted h-4 rounded animate-pulse"></div>
                  <div className="bg-muted h-3 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (moviesError || showsError) {
    return (
      <div className="min-h-screen bg-background py-8" data-testid="trending-error">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground">
              Impossible de charger les films tendances. Veuillez réessayer plus tard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!trendingMovies || trendingMovies.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8" data-testid="trending-empty">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="trending-title">
                Films Tendances
              </h1>
            </div>
            <p className="text-muted-foreground" data-testid="trending-description">
              Découvrez les films les plus populaires cette semaine.
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun film trouvé</h3>
            <p className="text-muted-foreground">
              Aucun film tendance n'est disponible pour le moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8" data-testid="trending-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="trending-title">
              Films Tendances
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            <p data-testid="trending-description">
              Les films les plus populaires cette semaine - Mis à jour quotidiennement
            </p>
          </div>
          <div className="bg-primary/10 border-l-4 border-primary p-4 rounded">
            <p className="text-sm text-foreground">
              <strong>🔥 Hot cette semaine :</strong> Découvrez les films qui font le buzz actuellement !
            </p>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" data-testid="trending-movies-grid">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} size="small" />
          ))}
        </div>

        {/* Stats Footer */}
        <div className="text-center mt-12 p-6 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Affichage de {trendingMovies.length} films tendances</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border"></div>
            <div className="hidden sm:flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Mis à jour quotidiennement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}