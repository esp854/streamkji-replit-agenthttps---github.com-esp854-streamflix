import React, { useState, useEffect } from 'react';
import HilltopAds from '@/components/HilltopAds';

interface AdIntegrationProps {
  adType: 'video' | 'banner';
  onAdComplete?: () => void;
  onAdError?: (error: string) => void;
  adSlotId?: string;
}

const AdIntegration: React.FC<AdIntegrationProps> = ({ 
  adType, 
  onAdComplete,
  onAdError,
  adSlotId
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  const handleHilltopAdLoaded = () => {
    setAdLoaded(true);
    
    // Simulate ad completion after 10 seconds
    setTimeout(() => {
      onAdComplete?.();
    }, 10000);
  };

  const handleHilltopAdError = (error: string) => {
    setAdError(error);
    onAdError?.(error);
  };

  if (adError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <p>Failed to load advertisement</p>
          <button 
            onClick={() => onAdComplete?.()}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Skip Ad
          </button>
        </div>
      </div>
    );
  }

  if (!adLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <HilltopAds 
          adType={adType}
          adSlotId={adSlotId}
          onAdLoaded={handleHilltopAdLoaded}
          onAdError={handleHilltopAdError}
        />
      </div>
    );
  }

  // Render ad content based on type when loaded
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      {adType === 'video' ? (
        <div className="w-full h-full flex items-center justify-center">
          {/* Video ad placeholder */}
          <div className="text-center text-white">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 max-w-lg">
              <h3 className="text-2xl font-bold mb-4">Video Advertisement</h3>
              <p className="mb-6">Advertisement is now playing</p>
              <div className="bg-black rounded-lg h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📺</div>
                  <p>Video Ad Content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {/* Banner ad placeholder */}
          <div className="text-center text-white">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-8 max-w-lg">
              <h3 className="text-2xl font-bold mb-4">Banner Advertisement</h3>
              <p className="mb-6">Advertisement is now displayed</p>
              <div className="bg-black rounded-lg h-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📢</div>
                  <p>Banner Ad Content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdIntegration;