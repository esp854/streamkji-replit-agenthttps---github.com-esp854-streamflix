import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import VideoAdOverlay from '@/components/VideoAdOverlay';
import AdService from '@/services/adService';

interface ZuploadVideoPlayerProps {
  videoUrl: string;
  title: string;
  onVideoEnd?: () => void;
  onVideoError?: (error: string) => void;
  adSlotId?: string;
  youtubeAdVideoId?: string; // YouTube video ID for specific ad
}

const ZuploadVideoPlayer: React.FC<ZuploadVideoPlayerProps> = ({ 
  videoUrl, 
  title,
  onVideoEnd,
  onVideoError,
  adSlotId,
  youtubeAdVideoId
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const [showAd, setShowAd] = useState(false);
  const [initialAdShown, setInitialAdShown] = useState(false);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Handle iframe error
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    setIsLoading(false);
    setError('Failed to load video content');
    console.error('Video error:', e);
    onVideoError?.('Failed to load video content');
  };

  // Reset loading state when videoUrl changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Show ad to unauthenticated users
    if (!isAuthenticated) {
      setShowAd(true);
      setInitialAdShown(true);
    }
  }, [videoUrl, isAuthenticated]);

  // Modified video URL to include branding removal parameters and disable download
  const modifiedVideoUrl = videoUrl.includes('?') 
    ? `${videoUrl}&branding=0&show_title=0&show_info=0&disable_download=1&no_download=1` 
    : `${videoUrl}?branding=0&show_title=0&show_info=0&disable_download=1&no_download=1`;

  const handleCloseAd = () => {
    setShowAd(false);
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Chargement de la vidéo...</p>
          </div>
        </div>
      )}

      {/* Ad overlay for unauthenticated users */}
      {showAd && (
        <VideoAdOverlay 
          onClose={handleCloseAd} 
          onSkip={handleCloseAd}
          youtubeVideoId={youtubeAdVideoId}
        />
      )}

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center p-6 bg-black/80 rounded-lg max-w-md">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Overlay to block clicks in the top-right area (likely download button region) */}
      <div
        className="absolute z-20 top-0 right-0"
        style={{ width: '12rem', height: '3rem', cursor: 'default' }}
        onClick={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        onPointerDown={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
      />
      {/* Direct Zupload iframe integration without custom controls */}
      <iframe
        ref={iframeRef}
        src={modifiedVideoUrl}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title={`Lecture de ${title}`}
        // More restrictive sandbox to prevent downloads
        sandbox="allow-scripts allow-same-origin allow-presentation"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        loading="lazy"
        // Additional attributes to prevent downloads
        referrerPolicy="no-referrer"
        // Styling to blend seamlessly
        style={{
          backgroundColor: 'black',
          border: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
};

export default ZuploadVideoPlayer;