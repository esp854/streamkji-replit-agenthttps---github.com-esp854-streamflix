import React, { useState, useEffect, useRef } from 'react';

interface YouTubeAdProps {
  videoId: string;
  onAdComplete?: () => void;
  onAdError?: (error: string) => void;
}

const YouTubeAd: React.FC<YouTubeAdProps> = ({ 
  videoId, 
  onAdComplete,
  onAdError 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate ad completion after 15 seconds
    const adTimer = setTimeout(() => {
      onAdComplete?.();
    }, 15000);

    return () => {
      clearTimeout(adTimer);
    };
  }, [onAdComplete]);

  const handleIframeLoad = () => {
    console.log('YouTube ad iframe loaded');
    setIsPlaying(true);
  };

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('YouTube ad error:', e);
    setAdError('Failed to load YouTube advertisement');
    onAdError?.('Failed to load YouTube advertisement');
  };

  if (adError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <p>{adError}</p>
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

  // YouTube embed URL with autoplay and muted
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1`;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-white text-center mb-2">
          <h3 className="text-lg font-bold">Advertisement</h3>
          <p className="text-sm">This ad supports our platform</p>
        </div>
        <div className="w-full flex-1">
          <iframe
            ref={iframeRef}
            src={youtubeEmbedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="YouTube Advertisement"
          />
        </div>
        <div className="text-white text-center mt-2">
          <p className="text-xs">Ad will close automatically</p>
        </div>
      </div>
    </div>
  );
};

export default YouTubeAd;