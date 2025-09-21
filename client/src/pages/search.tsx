import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Film, Tv } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tmdbService } from "@/lib/tmdb";
import MovieCard from "@/components/movie-card";
import TVCard from "@/components/tv-card";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import { useAuthCheck } from "@/hooks/useAuthCheck";

export default function Search() {
  const { shouldShowAds } = useAuthCheck();
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const initialQuery = urlParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: [`/api/tmdb/search`, debouncedQuery],
    queryFn: () => tmdbService.searchMovies(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const { data: tvSearchResults, isLoading: tvLoading } = useQuery({
    queryKey: [`/api/tmdb/tv/search`, debouncedQuery],
    queryFn: () => tmdbService.searchTVShows(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query is already being debounced, no need to do anything here
  };

  return (
    <div className="min-h-screen bg-background py-8" data-testid="search-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {shouldShowAds && <AdvertisementBanner />}
        
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6" data-testid="search-title">
            Rechercher des films et séries
          </h1>
          
          <form onSubmit={handleSearch} className="relative max-w-xl" data-testid="search-form">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher des films et séries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
              data-testid="search-input"
            />
          </form>
        </div>

        {/* Search Results */}
        {(isLoading || tvLoading) && debouncedQuery && (
          <div className="text-center py-12" data-testid="search-loading">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Recherche en cours...</p>
          </div>
        )}

        {!isLoading && !tvLoading && debouncedQuery && (searchResults || tvSearchResults) && (
          <Tabs defaultValue="movies" className="w-full" data-testid="search-results">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="movies" className="flex items-center space-x-2">
                <Film className="h-4 w-4" />
                <span>Films ({searchResults?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center space-x-2">
                <Tv className="h-4 w-4" />
                <span>Séries ({tvSearchResults?.length || 0})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movies">
              {searchResults && searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" data-testid="search-results-grid">
                  {searchResults.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} size="small" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" data-testid="search-no-results">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Aucun film trouvé</h3>
                  <p className="text-muted-foreground">
                    Essayez avec d'autres mots-clés ou vérifiez l'orthographe.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tv">
              {tvSearchResults && tvSearchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" data-testid="search-tv-results-grid">
                  {tvSearchResults.map((series) => (
                    <TVCard key={series.id} series={series} size="small" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" data-testid="search-tv-no-results">
                  <div className="text-6xl mb-4">📺</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Aucune série trouvée</h3>
                  <p className="text-muted-foreground">
                    Essayez avec d'autres mots-clés ou vérifiez l'orthographe.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!debouncedQuery && (
          <div className="text-center py-12" data-testid="search-empty-state">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Découvrez des films et séries</h3>
            <p className="text-muted-foreground">
              Utilisez la barre de recherche pour trouver vos contenus préférés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
