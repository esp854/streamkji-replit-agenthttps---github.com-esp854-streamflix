import React, { useState, useEffect, useRef } from 'react';
import YouTubeAd from '@/components/YouTubeAd';

interface AdManagerProps {
  adInterval?: number; // Interval in minutes (default: 10)
  adDuration?: number; // Duration in seconds (default: 15)
  youtubeVideoIds: string[]; // Array of YouTube video IDs for ads
  onAdStart?: () => void;
  onAdEnd?: () => void;
}

const AdManager: React.FC<AdManagerProps> = ({ 
  adInterval = 10, 
  adDuration = 15,
  youtubeVideoIds,
  onAdStart,
  onAdEnd 
}) => {
  const [showAd, setShowAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start the ad interval timer
  useEffect(() => {
    // Set up the interval to show ads every X minutes
    adIntervalRef.current = setInterval(() => {
      setShowAd(true);
      onAdStart?.();
    }, adInterval * 60 * 1000); // Convert minutes to milliseconds

    return () => {
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
      }
      if (adTimerRef.current) {
        clearTimeout(adTimerRef.current);
      }
    };
  }, [adInterval, onAdStart]);

  // Handle ad display and timing
  useEffect(() => {
    if (showAd) {
      // Set up the timer to hide the ad after X seconds
      adTimerRef.current = setTimeout(() => {
        setShowAd(false);
        onAdEnd?.();
        // Move to next ad in rotation
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % youtubeVideoIds.length);
      }, adDuration * 1000); // Convert seconds to milliseconds
    }

    return () => {
      if (adTimerRef.current) {
        clearTimeout(adTimerRef.current);
      }
    };
  }, [showAd, adDuration, youtubeVideoIds.length, onAdEnd]);

  const handleAdComplete = () => {
    setShowAd(false);
    onAdEnd?.();
    // Move to next ad in rotation
    setCurrentAdIndex((prevIndex) => (prevIndex + 1) % youtubeVideoIds.length);
    
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }
  };

  const handleAdError = (error: string) => {
    console.error('Ad error:', error);
    setShowAd(false);
    onAdEnd?.();
    
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }
  };

  if (showAd && youtubeVideoIds.length > 0) {
    const currentVideoId = youtubeVideoIds[currentAdIndex];
    
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="relative bg-black border border-gray-700 rounded-lg w-full max-w-2xl h-64">
          <YouTubeAd 
            videoId={currentVideoId}
            onAdComplete={handleAdComplete}
            onAdError={handleAdError}
          />
          <div className="absolute top-2 right-2">
            <button 
              onClick={handleAdComplete}
              className="text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
              title="Close ad"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdManager;