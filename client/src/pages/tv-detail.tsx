import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play, Plus, Heart, Share2, Star, Calendar, Clock, Tv, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";
import { tmdbService } from "@/lib/tmdb";
import { useFavorites } from "@/hooks/use-favorites";
import { useShare } from "@/hooks/use-share";
import { useSEO, generateContentSEO } from "@/hooks/use-seo";
import TVRow from "@/components/tv-row";

export default function TVDetail() {
  const { id } = useParams<{ id: string }>();
  const tvId = parseInt(id || "0");
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([1])); // First season expanded by default
  // Cache of episodes per season
  const [seasonEpisodes, setSeasonEpisodes] = useState<Record<number, any[]>>({});
  const { toggleFavorite, checkFavorite, isAddingToFavorites } = useFavorites();
  const { shareCurrentPage } = useShare();

  const { data: tvDetails, isLoading, error } = useQuery({
    queryKey: [`/api/tmdb/tv/${tvId}`],
    queryFn: () => tmdbService.getTVShowDetails(tvId),
    enabled: !!tvId,
  });

  // Load episodes for initially expanded seasons
  useEffect(() => {
    const loadInitialEpisodes = async () => {
      if (tvDetails && tvId && !seasonEpisodes[1]) {
        // Extract the actual TV show data from the response
        const tv = (tvDetails as any).show || tvDetails;
        
        // Only try to load episodes if we have season data
        if (tv.seasons && tv.seasons.length > 0) {
          try {
            const season = await tmdbService.getTVSeasonDetails(tvId, 1);
            const episodes = Array.isArray(season?.episodes) ? season.episodes : [];
            setSeasonEpisodes(prev => ({ ...prev, [1]: episodes }));
          } catch (e) {
            console.error("Failed to load initial season episodes", e);
            // Set empty array on error to prevent infinite loading state
            setSeasonEpisodes(prev => ({ ...prev, [1]: [] }));
          }
        }
      }
    };

    loadInitialEpisodes();
  }, [tvDetails, tvId, seasonEpisodes]);

  // Check if series is favorite
  const { data: favoriteStatus } = checkFavorite(tvId);
  const isFavorite = favoriteStatus?.isFavorite || false;

  const primaryGenreId = (tvDetails as any)?.show?.genres?.[0]?.id ?? (tvDetails as any)?.genres?.[0]?.id;
  const { data: similarShows } = useQuery({
    queryKey: [`/api/tmdb/tv/similar/${tvId}`, primaryGenreId],
    queryFn: () => tmdbService.getTVShowsByGenre(primaryGenreId),
    enabled: !!primaryGenreId,
  });

  const handleToggleFavorite = async () => {
    if (tvDetails) {
      // Create a simplified series object for the favorites system
      const seriesForFavorites = {
        id: tvDetails.id,
        name: tvDetails.name,
        poster_path: tvDetails.poster_path,
        first_air_date: tvDetails.first_air_date,
        genre_ids: tvDetails.genres?.map((g: any) => g.id) || [],
        vote_average: tvDetails.vote_average,
        vote_count: tvDetails.vote_count,
        popularity: tvDetails.popularity,
        overview: tvDetails.overview,
        backdrop_path: tvDetails.backdrop_path,
        original_language: tvDetails.original_language,
        original_name: tvDetails.original_name,
        adult: false,
      };
      await toggleFavorite(seriesForFavorites, 'tv');
    }
  };

  const handleAddToList = () => {
    // TODO: Implement watchlist functionality
    console.log('Add to watchlist:', tvDetails?.name);
  };

  const handleShare = async () => {
    if (tvDetails) {
      await shareCurrentPage(tvDetails.name);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="tv-detail-loading">
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

  if (error) {
    console.error("Error loading TV show:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="tv-detail-error">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-4">Impossible de charger les détails de la série</p>
          <Link href="/series">
            <Button>Retour aux séries</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!tvDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="tv-detail-error">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Série non trouvée</h1>
          <Link href="/series">
            <Button>Retour aux séries</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Extract the actual TV show data from the response
  // The backend returns { show, credits, videos } but sometimes it might return the data directly
  const tv = (tvDetails as any).show || tvDetails;
  const { credits, videos } = tvDetails as any;
  const cast = credits?.cast?.slice(0, 8) || [];
  const trailer = videos?.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube");

  // SEO optimization
  const seoData = tv ? generateContentSEO(tv, 'tv') : {};
  useSEO(seoData);

  const formatEpisodeRuntime = (runtimes: number[] | undefined) => {
    if (!runtimes || runtimes.length === 0) return null;
    const avgRuntime = Math.round(runtimes.reduce((a, b) => a + b, 0) / runtimes.length);
    return `~${avgRuntime}min/épisode`;
  };

  const getAirYears = () => {
    if (!tv.first_air_date) return "Date inconnue";
    const startYear = new Date(tv.first_air_date).getFullYear();
    if (tv.status === "Ended" && tv.last_air_date) {
      const endYear = new Date(tv.last_air_date).getFullYear();
      return startYear === endYear ? startYear.toString() : `${startYear}-${endYear}`;
    }
    return `${startYear}-en cours`;
  };

  const toggleSeason = async (seasonNumber: number) => {
    setExpandedSeasons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seasonNumber)) {
        newSet.delete(seasonNumber);
      } else {
        newSet.add(seasonNumber);
      }
      return newSet;
    });

    // Lazy-load episodes when expanding a season the first time
    if (!seasonEpisodes[seasonNumber] && tvId) {
      try {
        const season = await tmdbService.getTVSeasonDetails(tvId, seasonNumber);
        const episodes = Array.isArray(season?.episodes) ? season.episodes : [];
        setSeasonEpisodes(prev => ({ ...prev, [seasonNumber]: episodes }));
      } catch (e) {
        console.error("Failed to load season episodes", e);
        // Set empty array on error to prevent infinite loading state
        setSeasonEpisodes(prev => ({ ...prev, [seasonNumber]: [] }));
      }
    }
  };

  const generateEpisodes = (seasonNumber: number, episodeCount: number) => {
    return Array.from({ length: episodeCount }, (_, i) => ({
      episode_number: i + 1,
      name: `Épisode ${i + 1}`,
      overview: "Résumé de l'épisode à venir...",
      runtime: tv.episode_run_time?.[0] || 45,
      air_date: tv.first_air_date // Placeholder
    }));
  };

  return (
    <div className="min-h-screen bg-background" data-testid="tv-detail-page">
      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[70vh] md:h-screen">
        <img
          src={tmdbService.getBackdropUrl(tv.backdrop_path)}
          alt={tv.name}
          className="w-full h-full object-cover"
          data-testid="tv-backdrop"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-backdrop.jpg";
          }}
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>

        {/* Back button */}
        <Link href="/series">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 sm:top-8 sm:left-8 bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full z-10"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </Link>

        {/* TV Show info */}
        <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-8 md:left-16 md:bottom-16 max-w-3xl z-10">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-3 sm:mb-4" data-testid="tv-title">
            {tv.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-white/80 mb-4 sm:mb-6 text-sm sm:text-base" data-testid="tv-metadata">
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{getAirYears()}</span>
            </span>
            {tv.number_of_seasons && (
              <span className="flex items-center space-x-1">
                <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tv.number_of_seasons} saison{tv.number_of_seasons > 1 ? 's' : ''}</span>
              </span>
            )}
            {tv.number_of_episodes && (
              <span className="hidden sm:inline">{tv.number_of_episodes} épisodes</span>
            )}
            {formatEpisodeRuntime(tv.episode_run_time) && (
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{formatEpisodeRuntime(tv.episode_run_time)}</span>
              </span>
            )}
            <span className="hidden md:inline">{tv.genres?.map((g: any) => g.name).join(", ")}</span>

            {tv.vote_average > 0 && (
              <span className="flex items-center space-x-1">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>{tv.vote_average.toFixed(1)}</span>
              </span>
            )}
          </div>

          {/* Mobile-only genres */}
          <div className="md:hidden mb-4">
            <span className="text-white/80 text-sm">{tv.genres?.map((g: any) => g.name).join(", ")}</span>
          </div>

          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none" data-testid="tv-overview">
            {tv.overview}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" data-testid="tv-actions">
            <Link href={`/watch/tv/${tv.id}/1/1`} className="w-full sm:w-auto">
              <Button className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto" data-testid="button-watch">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Regarder</span>
              </Button>
            </Link>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Button
                variant="secondary"
                onClick={handleToggleFavorite}
                disabled={isAddingToFavorites}
                className="flex items-center space-x-2 flex-1 sm:flex-none"
                data-testid="button-favorite"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{isFavorite ? "Dans les favoris" : "Ajouter aux favoris"}</span>
                <span className="sm:hidden">Favoris</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleAddToList}
                className="flex items-center space-x-2 flex-1 sm:flex-none"
                data-testid="button-add-list"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Ajouter à ma liste</span>
                <span className="sm:hidden">Liste</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleShare}
                className="flex items-center space-x-2 flex-1 sm:flex-none"
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Partager</span>
                <span className="sm:hidden">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Advertisement Banner for unauthenticated users */}
        {/* Removed as per user request - ads should only appear in video players */}

        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="mb-8 sm:mb-12" data-testid="tv-cast">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Acteurs</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
              {cast.map((person: any) => (
                <div key={person.id} className="text-center" data-testid={`cast-member-${person.id}`}>
                  <div className="relative pb-[125%] sm:pb-[150%] mb-2 sm:mb-3 rounded-md overflow-hidden">
                    <img
                      src={tmdbService.getProfileUrl(person.profile_path)}
                      alt={person.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-profile.jpg";
                      }}
                    />
                  </div>
                  <h3 className="font-medium text-foreground text-xs sm:text-sm line-clamp-1" data-testid={`cast-name-${person.id}`}>
                    {person.name}
                  </h3>
                  <p className="text-muted-foreground text-xs line-clamp-1" data-testid={`cast-character-${person.id}`}>
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Seasons Section */}
        {tv.seasons && tv.seasons.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Saisons</h3>
            <div className="space-y-3 sm:space-y-4">
              {tv.seasons.map((season: any) => (
                <div key={season.id} className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => toggleSeason(season.season_number)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {season.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${season.poster_path}`}
                          alt={season.name}
                          className="w-12 h-18 sm:w-16 sm:h-24 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-poster.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-18 sm:w-16 sm:h-24 bg-gray-700 rounded flex items-center justify-center">
                          <Tv className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base line-clamp-1">{season.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-400">{season.episode_count} épisodes</p>
                            {season.air_date && (
                              <p className="text-xs text-gray-500">
                                {new Date(season.air_date).getFullYear()}
                              </p>
                            )}
                          </div>
                          <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0 ml-2 ${expandedSeasons.has(season.season_number) ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Episode list */}
                  {expandedSeasons.has(season.season_number) && (
                    <div className="mt-3 sm:mt-4 border-t border-gray-700 pt-3 sm:pt-4">
                      {(() => {
                        const episodes = seasonEpisodes[season.season_number];
                        if (typeof episodes === "undefined") {
                          return <div className="text-xs sm:text-sm text-gray-400">Chargement des épisodes...</div>;
                        }
                        if (episodes.length === 0) {
                          return <div className="text-xs sm:text-sm text-gray-400">Aucun épisode disponible pour cette saison.</div>;
                        }
                        return (
                          <div className="grid grid-cols-1 gap-2 sm:gap-3">
                            {episodes.map((ep: any) => (
                              <Link
                                key={`${season.season_number}-${ep.episode_number}`}
                                href={`/watch/tv/${tv.id}/${season.season_number}/${ep.episode_number}`}
                                className="group bg-gray-900/40 hover:bg-gray-900 rounded p-2 sm:p-3 transition-colors block"
                              >
                                <div className="flex items-start gap-2 sm:gap-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-200 flex-shrink-0">
                                    {ep.episode_number}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium group-hover:text-white line-clamp-1 text-sm sm:text-base">{ep.name || `Épisode ${ep.episode_number}`}</div>
                                    {ep.air_date && (
                                      <div className="text-xs text-gray-400">{new Date(ep.air_date).toLocaleDateString()}</div>
                                    )}
                                    {ep.overview && (
                                      <div className="text-xs text-gray-400 line-clamp-2 mt-1">{ep.overview}</div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Similar Shows */}
        {similarShows && similarShows.length > 0 && (
          <section data-testid="similar-shows">
            <TVRow
              title="Séries Similaires"
              series={similarShows}
              isLoading={false}
            />
          </section>
        )}
      </div>
    </div>
  );
}