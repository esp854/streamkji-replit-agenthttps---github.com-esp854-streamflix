import React, { useState, useEffect, useRef } from 'react';

interface HilltopAdsProps {
  onAdLoaded?: () => void;
  onAdError?: (error: string) => void;
  adType: 'video' | 'banner';
  adSlotId?: string; // Optional ad slot ID for specific ad placement
}

const HilltopAds: React.FC<HilltopAdsProps> = ({ 
  onAdLoaded,
  onAdError,
  adType,
  adSlotId
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the HilltopAds script is already loaded
    if (window.hilltopads) {
      setIsScriptLoaded(true);
      initializeAd();
      return;
    }

    // Create script element - REPLACE THIS WITH YOUR ACTUAL HILLTOPADS SCRIPT URL
    const script = document.createElement('script');
    script.src = '//s.hilltopads.com/header_bidding.js'; // Replace with your actual HilltopAds script URL
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      initializeAd();
    };
    script.onerror = () => {
      setAdError('Failed to load HilltopAds script');
      onAdError?.('Failed to load HilltopAds script');
    };

    // Add script to document
    document.head.appendChild(script);

    // Clean up function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onAdLoaded, onAdError]);

  const initializeAd = () => {
    if (window.hilltopads && adContainerRef.current) {
      try {
        // Configure HilltopAds
        window.hilltopads.config = window.hilltopads.config || {};
        
        // Initialize ad based on type
        if (adType === 'video') {
          // For video ads, we might need to create a specific container
          if (adSlotId) {
            window.hilltopads.displayVideoAd?.(adSlotId, adContainerRef.current);
          } else {
            window.hilltopads.displayVideoAd?.(adContainerRef.current);
          }
        } else {
          // For banner ads
          if (adSlotId) {
            window.hilltopads.displayBannerAd?.(adSlotId, adContainerRef.current);
          } else {
            window.hilltopads.displayBannerAd?.(adContainerRef.current);
          }
        }
        
        onAdLoaded?.();
      } catch (error) {
        console.error('Error initializing HilltopAds:', error);
        setAdError('Failed to initialize HilltopAds');
        onAdError?.('Failed to initialize HilltopAds');
      }
    }
  };

  useEffect(() => {
    if (isScriptLoaded) {
      initializeAd();
    }
  }, [isScriptLoaded, adType, adSlotId]);

  if (adError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <p>{adError}</p>
          <button 
            onClick={() => onAdLoaded?.()}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Skip Ad
          </button>
        </div>
      </div>
    );
  }

  if (!isScriptLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading advertisement...</p>
        </div>
      </div>
    );
  }

  // Render HilltopAds container
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div 
        ref={adContainerRef}
        id={adSlotId || "hilltopads-container"}
        className="w-full h-full flex items-center justify-center"
        style={{ minHeight: '250px', minWidth: '300px' }}
      >
        {/* HilltopAds will render here */}
        <div className="text-center text-white">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 max-w-lg">
            <h3 className="text-2xl font-bold mb-4">Advertisement</h3>
            <p className="mb-6">Advertisement from HilltopAds</p>
            <div className="bg-black rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📺</div>
                <p>Ad will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extend window interface to include hilltopads
declare global {
  interface Window {
    hilltopads: any;
  }
}

export default HilltopAds;