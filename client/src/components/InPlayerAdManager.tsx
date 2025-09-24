import React, { useState, useEffect, useRef } from 'react';
import AdService from '@/services/adService';

interface InPlayerAdManagerProps {
  isAuthenticated: boolean;
  adInterval?: number; // Interval in minutes (default: 10)
  adDuration?: number; // Duration in seconds (default: 15)
  youtubeVideoIds?: string[]; // Array of YouTube video IDs for ads
  onAdStart?: () => void;
  onAdEnd?: () => void;
}

const InPlayerAdManager: React.FC<InPlayerAdManagerProps> = ({ 
  isAuthenticated,
  adInterval = 1, // Changed default to 1 minute for more frequent testing
  adDuration = 15,
  youtubeVideoIds,
  onAdStart,
  onAdEnd 
}) => {
  const [showAd, setShowAd] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<string>("");
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const adService = AdService.getInstance();

  // Initialize with ads from service if not provided
  useEffect(() => {
    console.log("InPlayerAdManager: Initializing with props", { 
      isAuthenticated, 
      adInterval, 
      adDuration, 
      youtubeVideoIds 
    });
    
    if (youtubeVideoIds && youtubeVideoIds.length > 0) {
      console.log("InPlayerAdManager: Using provided YouTube video IDs", youtubeVideoIds);
      setCurrentAdId(youtubeVideoIds[0]);
    } else {
      const allAds = adService.getAllYouTubeAds();
      console.log("InPlayerAdManager: Using ads from service", allAds);
      if (allAds.length > 0) {
        setCurrentAdId(allAds[0]);
      }
    }
  }, [youtubeVideoIds]);

  // Start the ad interval timer
  useEffect(() => {
    console.log("InPlayerAdManager: Setting up ad interval timer");
    
    // Don't show ads to authenticated users
    if (isAuthenticated) {
      console.log("InPlayerAdManager: User is authenticated, not showing ads");
      return;
    }
    
    // Check if we have any ads to show
    const hasAds = (youtubeVideoIds && youtubeVideoIds.length > 0) || 
                  (adService.getAllYouTubeAds().length > 0);
    
    if (!hasAds) {
      console.log("InPlayerAdManager: No ads available to show");
      return;
    }

    console.log("InPlayerAdManager: Setting up ad interval for", adInterval, "minutes");
    
    // Show first ad immediately for testing
    const firstAdTimer = setTimeout(() => {
      console.log("InPlayerAdManager: Showing first ad immediately");
      if (currentAdId) {
        setShowAd(true);
        onAdStart?.();
      }
    }, 5000); // Show first ad after 5 seconds

    // Set up the interval to show ads every X minutes
    adIntervalRef.current = setInterval(() => {
      console.log("InPlayerAdManager: Interval triggered, showing ad");
      
      // Get next ad from service or rotate through provided IDs
      let nextAdId: string;
      if (youtubeVideoIds && youtubeVideoIds.length > 0) {
        // Simple rotation through provided IDs
        const currentIndex = currentAdId ? youtubeVideoIds.indexOf(currentAdId) : -1;
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % youtubeVideoIds.length : 0;
        nextAdId = youtubeVideoIds[nextIndex];
        console.log("InPlayerAdManager: Rotating to next ad from provided list", nextAdId);
      } else {
        nextAdId = adService.getNextYouTubeAd();
        console.log("InPlayerAdManager: Getting next ad from service", nextAdId);
      }
      
      setCurrentAdId(nextAdId);
      setShowAd(true);
      onAdStart?.();
    }, adInterval * 60 * 1000); // Convert minutes to milliseconds

    return () => {
      console.log("InPlayerAdManager: Cleaning up timers");
      if (firstAdTimer) {
        clearTimeout(firstAdTimer);
      }
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
      }
      if (adTimerRef.current) {
        clearTimeout(adTimerRef.current);
      }
    };
  }, [adInterval, isAuthenticated, youtubeVideoIds, currentAdId, onAdStart]);

  // Handle ad display and timing
  useEffect(() => {
    if (showAd) {
      console.log("InPlayerAdManager: Ad is showing, setting timer for", adDuration, "seconds");
      
      // Set up the timer to hide the ad after X seconds
      adTimerRef.current = setTimeout(() => {
        console.log("InPlayerAdManager: Ad duration timer expired, hiding ad");
        setShowAd(false);
        onAdEnd?.();
      }, adDuration * 1000); // Convert seconds to milliseconds
    }

    return () => {
      if (adTimerRef.current) {
        clearTimeout(adTimerRef.current);
      }
    };
  }, [showAd, adDuration, onAdEnd]);

  const handleAdComplete = () => {
    console.log("InPlayerAdManager: Ad manually closed");
    setShowAd(false);
    onAdEnd?.();
    
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }
  };

  const handleAdError = (error: string) => {
    console.error('InPlayerAdManager: Ad error:', error);
    setShowAd(false);
    onAdEnd?.();
    
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }
  };

  if (showAd && currentAdId && !isAuthenticated) {
    console.log("InPlayerAdManager: Rendering ad with video ID", currentAdId);
    
    // Different approach for YouTube embedding to avoid CSP issues
    // Added playlist parameter to ensure videos play even if embedding is restricted
    const youtubeEmbedUrl = `https://www.youtube-nocookie.com/embed/${currentAdId}?autoplay=1&mute=1&controls=1&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="relative bg-black border border-gray-700 rounded-lg w-full max-w-3xl h-80">
          <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center p-2 bg-gray-900">
              <div className="text-white text-sm font-bold">Advertisement</div>
              <button 
                onClick={handleAdComplete}
                className="text-white bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-600 text-xs"
                title="Close ad"
              >
                ×
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={youtubeEmbedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Advertisement"
                onLoad={() => console.log("InPlayerAdManager: YouTube iframe loaded")}
                onError={(e) => console.error("InPlayerAdManager: YouTube iframe error", e)}
              />
            </div>
            <div className="p-2 bg-gray-900 text-center">
              <div className="text-white text-xs">
                Ad will close automatically in {adDuration} seconds
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Video ID: {currentAdId}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("InPlayerAdManager: Not showing ad", { showAd, currentAdId, isAuthenticated });
  return null;
};

export default InPlayerAdManager;