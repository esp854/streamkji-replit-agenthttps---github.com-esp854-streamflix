import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Home, Maximize, Minimize, Volume2, VolumeX, Play, Pause, Settings, SkipBack, SkipForward, RotateCcw, RotateCw, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { tmdbService } from "@/lib/tmdb";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import ZuploadVideoPlayer from "@/components/zupload-video-player";
import InPlayerAdManager from "@/components/InPlayerAdManager";
import { adConfig } from "@/config/adConfig";
import SubscriptionGuard from "@/components/SubscriptionGuard";

export default function WatchTV() {
  const { shouldShowAds } = useAuthCheck();
  const { id, season, episode } = useParams<{ id: string; season: string; episode: string }>();
  const tvId = parseInt(id || "0");
  const seasonNumber = parseInt(season || "1");
  const episodeNumber = parseInt(episode || "1");
  const [, navigate] = useLocation();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMountedRef = useRef(true);
  // Add YouTube player ref
  const youtubePlayerRef = useRef<any>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("1080p");
  const [isBuffering, setIsBuffering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Add YouTube and Zupload video detection states
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [isZuploadVideo, setIsZuploadVideo] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clean up YouTube player if it exists
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (isMountedRef.current) {
        setIsFullscreen(!!document.fullscreenElement);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const { data: tvDetails, isLoading: tmdbLoading } = useQuery({
    queryKey: [`/api/tmdb/tv/${tvId}`],
    queryFn: () => tmdbService.getTVShowDetails(tvId),
    enabled: !!tvId,
  });

  // Fetch content with video link
  const { data: contentWithVideo, isLoading: contentLoading } = useQuery({
    queryKey: [`/api/contents/tmdb/${tvId}`],
    queryFn: async () => {
      const response = await fetch(`/api/contents/tmdb/${tvId}`);
      if (!response.ok) {
        // Instead of throwing an error, return a default content object
        return {
          id: `tmdb-${tvId}`,
          tmdbId: tvId,
          odyseeUrl: "",
          active: false,
          createdAt: new Date().toISOString()
        };
      }
      return response.json();
    },
    enabled: !!tvId,
    retry: false, // Don't retry on 404
  });

  const isLoading = tmdbLoading || contentLoading;

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (showControls && isPlaying) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setShowControls(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMountedRef.current || e.target !== document.body || isTransitioning) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange([Math.min(100, volume[0] + 10)]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange([Math.max(0, volume[0] - 10)]);
          break;
        case 'm':
          e.preventDefault();
          handleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'n':
          e.preventDefault();
          goToNextEpisode();
          break;
        case 'p':
          e.preventDefault();
          goToPreviousEpisode();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, isTransitioning]);

  // Check if video is YouTube or Zupload
  useEffect(() => {
    if (contentWithVideo?.odyseeUrl) {
      const url = contentWithVideo.odyseeUrl;
      setIsYouTubeVideo(url.includes("youtube.com") || url.includes("youtu.be"));
      setIsZuploadVideo(url.includes("zupload"));
    }
  }, [contentWithVideo]);

  // Check if video is Odysee
  const isOdyseeVideo = useMemo(() => {
    return contentWithVideo?.odyseeUrl && contentWithVideo.odyseeUrl.includes("odysee.com");
  }, [contentWithVideo?.odyseeUrl]);

  // Initialize YouTube player API when iframe is loaded
  useEffect(() => {
    if (!isYouTubeVideo || !contentWithVideo?.odyseeUrl) return;

    // Load YouTube iframe API if not already loaded
    if (!window.YT) {
      const scriptTag = document.createElement('script');
      scriptTag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(scriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializeYouTubePlayer();
      };
    } else {
      // YouTube API already loaded
      initializeYouTubePlayer();
    }

    return () => {
      // Clean up YouTube player
      if (youtubePlayerRef.current) {
        // Clean up time interval if it exists
        const timeInterval = (youtubePlayerRef.current as any)._timeInterval;
        if (timeInterval) {
          clearInterval(timeInterval);
        }
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, [isYouTubeVideo, contentWithVideo?.odyseeUrl]);

  const initializeYouTubePlayer = () => {
    if (youtubePlayerRef.current) return;

    const interval = setInterval(() => {
      const iframe = document.getElementById('youtube-player');
      if (iframe && window.YT) {
        clearInterval(interval);
        
        youtubePlayerRef.current = new window.YT.Player('youtube-player', {
          events: {
            'onReady': (event: any) => {
              console.log('YouTube player ready');
              // Get duration
              const dur = event.target.getDuration();
              setDuration(dur || 0);
              setIsPlaying(event.target.getPlayerState() === 1);
            },
            'onStateChange': (event: any) => {
              switch (event.data) {
                case 1: // Playing
                  setIsPlaying(true);
                  break;
                case 2: // Paused
                  setIsPlaying(false);
                  break;
                case 0: // Ended
                  setIsPlaying(false);
                  break;
              }
            }
          }
        });

        // Start time update interval
        const timeInterval = setInterval(() => {
          if (youtubePlayerRef.current && isMountedRef.current) {
            const time = youtubePlayerRef.current.getCurrentTime();
            setCurrentTime(time || 0);
            
            const dur = youtubePlayerRef.current.getDuration();
            setDuration(dur || 0);
          }
        }, 1000);

        // Store the interval ID in the player ref for cleanup
        if (youtubePlayerRef.current) {
          (youtubePlayerRef.current as any)._timeInterval = timeInterval;
        }

        return () => clearInterval(timeInterval);
      }
    }, 500);
  };

  // Video event handlers
  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current || isTransitioning || !isMountedRef.current) return;
    
    setIsTransitioning(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (!isMountedRef.current) return;
      
      if (isYouTubeVideo && youtubePlayerRef.current) {
        // YouTube player controls
        if (isPlaying) {
          youtubePlayerRef.current.pauseVideo();
        } else {
          youtubePlayerRef.current.playVideo();
        }
      } else {
        // Regular video element controls
        if (isPlaying) {
          const pausePromise = videoRef.current.pause();
          if (pausePromise !== undefined) {
            await pausePromise;
          }
        } else {
          await videoRef.current.play();
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.log('Playback operation error:', error);
      }
      if (videoRef.current && isMountedRef.current) {
        setIsPlaying(!videoRef.current.paused);
      }
    } finally {
      if (isMountedRef.current) {
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsTransitioning(false);
          }
        }, 100);
      }
    }
  }, [isPlaying, isTransitioning, isYouTubeVideo]);

  const handleVolumeChange = useCallback((newVolume: number[]) => {
    if (!isMountedRef.current) return;
    
    setVolume(newVolume);
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      const volumeValue = newVolume[0];
      youtubePlayerRef.current.setVolume(volumeValue);
      
      if (volumeValue === 0) {
        setIsMuted(true);
        youtubePlayerRef.current.mute();
      } else {
        setIsMuted(false);
        youtubePlayerRef.current.unMute();
      }
    } else if (videoRef.current) {
      videoRef.current.volume = newVolume[0] / 100;
      if (newVolume[0] === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  }, [isYouTubeVideo]);

  const handleMute = useCallback(() => {
    if (!videoRef.current || !isMountedRef.current) return;
    
    const newMutedState = !isMuted;
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      if (newMutedState) {
        youtubePlayerRef.current.mute();
      } else {
        youtubePlayerRef.current.unMute();
      }
    } else if (videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
    
    setIsMuted(newMutedState);
  }, [isMuted, isYouTubeVideo]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !isMountedRef.current) return;
    
    setCurrentTime(videoRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current || !isMountedRef.current) return;
    
    setDuration(videoRef.current.duration);
  }, []);

  const handleSeek = useCallback((newTime: number[]) => {
    if (!videoRef.current || !isMountedRef.current) return;
    
    const time = newTime[0];
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(time, true);
    } else {
      videoRef.current.currentTime = time;
    }
    
    setCurrentTime(time);
  }, [isYouTubeVideo]);

  const skipBackward = useCallback(() => {
    if (!videoRef.current || !isMountedRef.current) return;
    
    const newTime = Math.max(0, currentTime - 10);
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(newTime, true);
    } else {
      videoRef.current.currentTime = newTime;
    }
    
    setCurrentTime(newTime);
  }, [currentTime, isYouTubeVideo]);

  const skipForward = useCallback(() => {
    if (!videoRef.current || !isMountedRef.current) return;
    
    const newTime = Math.min(duration, currentTime + 10);
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(newTime, true);
    } else {
      videoRef.current.currentTime = newTime;
    }
    
    setCurrentTime(newTime);
  }, [currentTime, duration, isYouTubeVideo]);

  const rewind15 = useCallback(() => {
    if (!videoRef.current || !isMountedRef.current) return;
    
    const newTime = Math.max(0, currentTime - 15);
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(newTime, true);
    } else {
      videoRef.current.currentTime = newTime;
    }
    
    setCurrentTime(newTime);
  }, [currentTime, isYouTubeVideo]);

  const forward15 = useCallback(() => {
    if (!videoRef.current || !isMountedRef.current) return;
    
    const newTime = Math.min(duration, currentTime + 15);
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(newTime, true);
    } else {
      videoRef.current.currentTime = newTime;
    }
    
    setCurrentTime(newTime);
  }, [currentTime, duration, isYouTubeVideo]);

  const handlePlaybackSpeedChange = useCallback((speed: string) => {
    if (!isMountedRef.current) return;
    
    const speedValue = parseFloat(speed);
    setPlaybackSpeed(speedValue);
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      youtubePlayerRef.current.setPlaybackRate(speedValue);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = speedValue;
    }
  }, [isYouTubeVideo]);

  const handleQualityChange = useCallback((newQuality: string) => {
    if (!isMountedRef.current) return;
    
    setQuality(newQuality);
    
    if (isYouTubeVideo && youtubePlayerRef.current) {
      // Quality changes are handled automatically by YouTube player
      // based on bandwidth and screen size
    }
    // In a real app, you would switch video sources here for regular videos
    console.log(`Quality changed to: ${newQuality}`);
  }, [isYouTubeVideo]);

  const goToPreviousEpisode = useCallback(() => {
    if (!isMountedRef.current || !tvDetails) return;
    const show: any = (tvDetails as any).show || tvDetails;
    const seasons: any[] = (show?.seasons || [])
      .filter((s: any) => typeof s?.season_number === 'number')
      .sort((a: any, b: any) => (a.season_number || 0) - (b.season_number || 0));

    // If same season and episode > 1, just decrement episode
    if (episodeNumber > 1) {
      navigate(`/watch/tv/${tvId}/${seasonNumber}/${episodeNumber - 1}`);
      return;
    }

    // Otherwise, find previous season with episodes (skip specials season 0)
    const prevSeason = [...seasons]
      .filter((s: any) => (s.season_number || 0) < seasonNumber && (s.episode_count || 0) > 0 && s.season_number !== 0)
      .sort((a: any, b: any) => (b.season_number || 0) - (a.season_number || 0))[0];

    if (prevSeason) {
      const lastEp = Math.max(1, prevSeason.episode_count || 1);
      navigate(`/watch/tv/${tvId}/${prevSeason.season_number}/${lastEp}`);
    }
  }, [episodeNumber, seasonNumber, tvDetails, tvId, navigate]);

  const goToNextEpisode = useCallback(() => {
    if (!isMountedRef.current || !tvDetails) return;
    const show: any = (tvDetails as any).show || tvDetails;
    const seasons: any[] = (show?.seasons || [])
      .filter((s: any) => typeof s?.season_number === 'number')
      .sort((a: any, b: any) => (a.season_number || 0) - (b.season_number || 0));

    const currentSeasonObj = seasons.find((s: any) => s.season_number === seasonNumber);
    const currentSeasonEpCount = currentSeasonObj?.episode_count || 0;

    // If we have more episodes in current season, increment episode
    if (currentSeasonEpCount > 0 && episodeNumber < currentSeasonEpCount) {
      navigate(`/watch/tv/${tvId}/${seasonNumber}/${episodeNumber + 1}`);
      return;
    }

    // Otherwise, move to the first episode of the next season (skip specials season 0)
    const nextSeason = seasons.find((s: any) => s.season_number > seasonNumber && (s.episode_count || 0) > 0 && s.season_number !== 0);
    if (nextSeason) {
      navigate(`/watch/tv/${tvId}/${nextSeason.season_number}/1`);
    }
  }, [episodeNumber, seasonNumber, tvDetails, tvId, navigate]);

  const handleGoHome = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isMountedRef.current) return;
    
    // Exit fullscreen if we're in it
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        if (isMountedRef.current) {
          window.location.href = '/';
        }
      }).catch(() => {
        if (isMountedRef.current) {
          window.location.href = '/';
        }
      });
    } else {
      window.location.href = '/';
    }
  }, []);

  const downloadEpisode = useCallback(() => {
    if (!isMountedRef.current) return;
    
    // In a real app, this would trigger a download
    console.log('Download requested for episode');
  }, []);

  const shareEpisode = useCallback(() => {
    if (!isMountedRef.current) return;
    
    // In a real app, this would open share options
    if (navigator.share) {
      navigator.share({
        title: tvDetails?.name,
        url: window.location.href,
      }).catch(err => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => console.log('Link copied to clipboard'))
        .catch(err => console.log('Copy failed:', err));
    }
  }, [tvDetails?.name]);

  const handleVideoError = useCallback((error: string) => {
    console.error('Video error:', error);
    // Handle video error as needed
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isMountedRef.current) return;
    
    if (!document.fullscreenElement) {
      if (videoRef.current) {
        videoRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement de la série...</p>
        </div>
      </div>
    );
  }

  // Show message if content exists but no video link is available
  if (tvDetails && !contentWithVideo && !contentLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md p-4">
          <h1 className="text-2xl font-bold mb-4">Lien vidéo non disponible</h1>
          <p className="mb-6 text-muted-foreground">
            Cette vidéo n'est pas encore disponible. Veuillez revenir plus tard.
          </p>
          <Link href="/series">
            <Button variant="secondary">Retour aux séries</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!tvDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Série non trouvée</h1>
          <Link href="/series">
            <Button variant="secondary">Retour aux séries</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <SubscriptionGuard>
      <div className="relative w-full h-screen bg-black overflow-hidden">
        {/* Video container */}
        <div className="relative w-full h-screen">
          {/* Zupload Video Player - Direct integration */}
          {isZuploadVideo && contentWithVideo?.odyseeUrl ? (
            <div className="w-full h-full">
              <ZuploadVideoPlayer 
                videoUrl={contentWithVideo.odyseeUrl}
                title={tvDetails?.show?.name || 'Série TV'}
                onVideoError={handleVideoError}
                adSlotId="tv-video-ad"
                youtubeAdVideoId="dQw4w9WgXcQ" // Example YouTube video ID
              />
            </div>
          ) : (
            // Other video types (YouTube, Odysee, etc.) or fallback message
            <>
              {/* Video player has been removed for non-Zupload videos */}
              <div className="w-full h-screen flex items-center justify-center bg-black">
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">🎬</div>
                  <h2 className="text-2xl font-bold mb-2">Lecteur de série non disponible</h2>
                  <p className="text-gray-400 mb-4">Cette vidéo n'est pas disponible pour le moment.</p>
                  <p className="text-gray-500 text-sm mb-6">Seules les vidéos Zupload sont actuellement supportées.</p>
                  <Button onClick={handleGoHome} variant="default">
                    <Home className="w-4 h-4 mr-2" />
                    Retour à l'accueil
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="bg-black/80 text-white px-4 py-2 rounded-lg">
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Chargement...</div>
              </div>
            </div>
          )}

          {/* Home Button - Fixed at top-left edge */}
          <Button 
            onClick={handleGoHome}
            variant="ghost" 
            size="sm" 
            className="absolute top-2 left-2 z-50 bg-black/70 text-white hover:bg-black/90 transition-all duration-200 border border-white/20 backdrop-blur-sm"
            title="Retour à l'accueil"
          >
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Button>

          {/* Controls Overlay - only show for non-Odysee and non-Zupload videos */}
          {!isOdyseeVideo && !isZuploadVideo && (
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
              onMouseMove={() => {
                if (!isTransitioning) {
                  setShowControls(true);
                }
              }}
            >
              {/* Top Bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Empty space where home button was */}
                </div>
                <div className="text-white text-xl font-semibold text-center flex-1">
                  {tvDetails?.show?.name} - S{seasonNumber} E{episodeNumber}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={shareEpisode}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {/* Removed download button for Zupload videos */}
                  {!isZuploadVideo && (
                    <Button
                      onClick={downloadEpisode}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Center Controls */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center space-x-8">
                  <Button
                    onClick={rewind15}
                    variant="ghost"
                    size="lg"
                    className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    onClick={handlePlayPause}
                    variant="ghost"
                    size="lg"
                    className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </Button>
                  
                  <Button
                    onClick={forward15}
                    variant="ghost"
                    size="lg"
                    className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    <RotateCw className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4 space-y-4">
                {/* Progress Bar */}
                <div className="flex items-center space-x-4">
                  <span className="text-white text-sm min-w-[60px]">
                    {formatTime(currentTime)}
                  </span>
                  <Slider
                    value={[currentTime]}
                    onValueChange={handleSeek}
                    max={duration}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-white text-sm min-w-[60px]">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={handlePlayPause}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    
                    <Button
                      onClick={skipBackward}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      onClick={skipForward}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={handleMute}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <Slider
                        value={volume}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Settings className="w-5 h-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 bg-black/90 border-white/20" side="top">
                        <div className="space-y-4">
                          <div>
                            <label className="text-white text-sm font-medium">Vitesse de lecture</label>
                            <Select value={playbackSpeed.toString()} onValueChange={handlePlaybackSpeedChange}>
                              <SelectTrigger className="w-full bg-black/50 text-white border-white/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0.25">0.25x</SelectItem>
                                <SelectItem value="0.5">0.5x</SelectItem>
                                <SelectItem value="0.75">0.75x</SelectItem>
                                <SelectItem value="1">Normal</SelectItem>
                                <SelectItem value="1.25">1.25x</SelectItem>
                                <SelectItem value="1.5">1.5x</SelectItem>
                                <SelectItem value="1.75">1.75x</SelectItem>
                                <SelectItem value="2">2x</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-white text-sm font-medium">Qualité</label>
                            <Select value={quality} onValueChange={handleQualityChange}>
                              <SelectTrigger className="w-full bg-black/50 text-white border-white/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="240p">240p</SelectItem>
                                <SelectItem value="360p">360p</SelectItem>
                                <SelectItem value="480p">480p</SelectItem>
                                <SelectItem value="720p">720p HD</SelectItem>
                                <SelectItem value="1080p">1080p Full HD</SelectItem>
                                <SelectItem value="4k">4K Ultra HD</SelectItem>
                                <SelectItem value="auto">Auto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Button
                      onClick={toggleFullscreen}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Help - only show for non-Odysee and non-Zupload videos */}
          {!isOdyseeVideo && !isZuploadVideo && (
            <div className="absolute bottom-20 left-4 text-white text-xs opacity-50">
              <p>Raccourcis: Espace/K (Play/Pause) • ← → (Navigation) • ↑ ↓ (Volume) • M (Muet) • F (Plein écran)</p>
            </div>
          )}

          {/* Episode Navigation - only show for non-Odysee and non-Zupload videos */}
          {!isOdyseeVideo && !isZuploadVideo && (
            <div className="absolute bottom-24 left-4 right-4 flex justify-between">
              <Button
                onClick={goToPreviousEpisode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                disabled={episodeNumber <= 1 && seasonNumber <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Épisode précédent
              </Button>
              
              <Button
                onClick={goToNextEpisode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                Épisode suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

        </div>
        
        {/* In-player ad manager - show ads only for unauthenticated users */}
        {shouldShowAds && (
          <InPlayerAdManager 
            isAuthenticated={false} // Force to false since we're checking shouldShowAds
            adInterval={adConfig.adInterval}
            adDuration={adConfig.adDuration}
            youtubeVideoIds={adConfig.youtubeAdVideoIds}
            onAdStart={() => {
              console.log("TV page: Ad started");
            }}
            onAdEnd={() => {
              console.log("TV page: Ad ended");
            }}
          />
        )}
      </div>
    </SubscriptionGuard>
  );
}
