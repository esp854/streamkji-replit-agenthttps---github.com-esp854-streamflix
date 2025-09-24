import { useState, useEffect, useRef } from 'react';
import AdService from '@/services/adService';
import { adConfig } from '@/config/adConfig';

interface UseAdManagerProps {
  isAuthenticated: boolean;
  adInterval?: number;
  adDuration?: number;
  youtubeVideoIds?: string[]; // Array of YouTube video IDs for ads
}

interface UseAdManagerReturn {
  showAd: boolean;
  currentAdId: string;
  startAd: () => void;
  stopAd: () => void;
}

export const useAdManager = ({
  isAuthenticated,
  adInterval = adConfig.adInterval,
  adDuration = adConfig.adDuration,
  youtubeVideoIds
}: UseAdManagerProps): UseAdManagerReturn => {
  const [showAd, setShowAd] = useState(false);
  const [currentAdId, setCurrentAdId] = useState<string>("");
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const adService = AdService.getInstance();

  // Initialize with first ad
  useEffect(() => {
    let ads: string[] = [];
    if (youtubeVideoIds && youtubeVideoIds.length > 0) {
      ads = youtubeVideoIds;
    } else {
      ads = adService.getAllYouTubeAds();
    }
    
    if (ads.length > 0) {
      setCurrentAdId(ads[0]);
    }
    console.log("useAdManager: Initialized with ads", ads);
  }, [youtubeVideoIds]);

  // Set up periodic ads
  useEffect(() => {
    // Don't show ads to authenticated users
    let ads: string[] = [];
    if (youtubeVideoIds && youtubeVideoIds.length > 0) {
      ads = youtubeVideoIds;
    } else {
      ads = adService.getAllYouTubeAds();
    }
    
    if (isAuthenticated || ads.length === 0) {
      console.log("useAdManager: Not showing ads - isAuthenticated:", isAuthenticated, "ads length:", ads.length);
      return;
    }

    console.log("useAdManager: Setting up ad interval for", adInterval, "minutes");

    // Set up the interval to show ads every X minutes
    adIntervalRef.current = setInterval(() => {
      console.log("useAdManager: Interval triggered, showing ad");
      // Get next ad from service or rotate through provided IDs
      let nextAdId: string;
      if (youtubeVideoIds && youtubeVideoIds.length > 0) {
        // Simple rotation through provided IDs
        const currentIndex = ads.indexOf(currentAdId);
        const nextIndex = (currentIndex + 1) % ads.length;
        nextAdId = ads[nextIndex];
        console.log("useAdManager: Using provided YouTube ID", nextAdId);
      } else {
        nextAdId = adService.getNextYouTubeAd();
        console.log("useAdManager: Using service YouTube ID", nextAdId);
      }
      setCurrentAdId(nextAdId);
      setShowAd(true);
    }, adInterval * 60 * 1000); // Convert minutes to milliseconds

    return () => {
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
      }
      if (adTimerRef.current) {
        clearTimeout(adTimerRef.current);
      }
    };
  }, [adInterval, isAuthenticated, youtubeVideoIds, currentAdId]);

  // Handle ad timing
  useEffect(() => {
    if (showAd) {
      console.log("useAdManager: Showing ad with ID", currentAdId);
      // Set up the timer to hide the ad after X seconds
      adTimerRef.current = setTimeout(() => {
        console.log("useAdManager: Ad duration ended, hiding ad");
        setShowAd(false);
      }, adDuration * 1000); // Convert seconds to milliseconds
    }

    return () => {
      if (adTimerRef.current) {
        clearTimeout(adTimerRef.current);
      }
    };
  }, [showAd, adDuration, currentAdId]);

  const startAd = () => {
    if (!isAuthenticated) {
      let ads: string[] = [];
      if (youtubeVideoIds && youtubeVideoIds.length > 0) {
        ads = youtubeVideoIds;
      } else {
        ads = adService.getAllYouTubeAds();
      }
      
      if (ads.length > 0) {
        // Get next ad
        let nextAdId: string;
        if (youtubeVideoIds && youtubeVideoIds.length > 0) {
          // Simple rotation through provided IDs
          const currentIndex = ads.indexOf(currentAdId);
          const nextIndex = (currentIndex + 1) % ads.length;
          nextAdId = ads[nextIndex];
        } else {
          nextAdId = adService.getNextYouTubeAd();
        }
        setCurrentAdId(nextAdId);
        setShowAd(true);
      }
    }
  };

  const stopAd = () => {
    setShowAd(false);
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }
  };

  return {
    showAd,
    currentAdId,
    startAd,
    stopAd
  };
};