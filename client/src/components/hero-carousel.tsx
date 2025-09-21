import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Info, Pause, PlayIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tmdbService } from "@/lib/tmdb";
import { TMDBMovie } from "@/types/movie";
import { Link } from "wouter";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const { data: trendingMovies, isLoading, isError } = useQuery({
    queryKey: ['/api/tmdb/trending'],
    queryFn: () => tmdbService.getTrending(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Increased from 5 to 10 movies in the carousel
  const heroMovies = trendingMovies?.slice(0, 10) || [];

  useEffect(() => {
    if (!isPlaying || heroMovies.length === 0) return;

    // Adjust interval based on number of movies - 6 seconds per movie
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPlaying, heroMovies.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <section className="relative h-screen overflow-hidden bg-muted animate-pulse" data-testid="hero-carousel-loading">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des films...</p>
          </div>
        </div>
      </section>
    );
  }

  if (isError || !heroMovies || heroMovies.length === 0) {
    // Return a fallback hero section with static content
    return (
      <section className="relative h-screen overflow-hidden bg-gradient-to-r from-gray-900 to-black" data-testid="hero-carousel-error">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-2xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">Bienvenue sur StreamFlix</h1>
            <p className="text-xl text-gray-300 mb-8">Votre plateforme de streaming préférée</p>
            <div className="flex justify-center space-x-4">
              <Link href="/trending">
                <Button className="btn-primary flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Découvrir</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentMovie = heroMovies[currentSlide];

  return (
    <section className="relative h-screen overflow-hidden" data-testid="hero-carousel">
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            data-testid={`hero-slide-${index}`}
          >
            <img
              src={tmdbService.getBackdropUrl(movie.backdrop_path)}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-backdrop.jpg";
              }}
            />
            <div className="absolute inset-0 gradient-overlay"></div>
            <div className="absolute inset-0 gradient-bottom"></div>
          </div>
        ))}
      </div>
      
      {/* Content */}
      <div className="absolute bottom-1/4 left-8 md:left-16 max-w-lg z-10" data-testid="hero-content">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-white" data-testid="hero-title">
          {currentMovie.title}
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-6 leading-relaxed line-clamp-3" data-testid="hero-overview">
          {currentMovie.overview}
        </p>
        <div className="flex space-x-4" data-testid="hero-actions">
          <Link href={`/movie/${currentMovie.id}`}>
            <Button className="btn-primary flex items-center space-x-2" data-testid="button-watch">
              <Play className="w-5 h-5" />
              <span>Regarder</span>
            </Button>
          </Link>
          <Link href={`/movie/${currentMovie.id}`}>
            <Button className="btn-secondary flex items-center space-x-2" data-testid="button-info">
              <Info className="w-5 h-5" />
              <span>Plus d'infos</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-8 right-8 flex space-x-2 z-20" data-testid="carousel-controls">
        <Button
          variant="secondary"
          size="icon"
          onClick={togglePlayPause}
          className="w-12 h-12 rounded-full bg-secondary/50 hover:bg-secondary/70"
          data-testid="carousel-play-pause"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20" data-testid="carousel-indicators">
        {heroMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentSlide ? "bg-primary" : "bg-white/50"
            }`}
            data-testid={`carousel-indicator-${index}`}
          />
        ))}
      </div>
    </section>
  );
}