import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoAdOverlayProps {
  onClose: () => void;
  onSkip?: () => void;
  youtubeVideoId?: string;
}

const VideoAdOverlay: React.FC<VideoAdOverlayProps> = ({ onClose, onSkip, youtubeVideoId }) => {
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds for initial ad

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close after 15 seconds
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [onClose]);

  const handleSkip = () => {
    if (timeLeft <= 0) {
      onSkip?.();
      onClose();
    }
  };

  // Use provided YouTube video ID or default to a test video
  const adVideoId = youtubeVideoId || "dQw4w9WgXcQ"; // Rick Astley - Never Gonna Give You Up
  
  // Use YouTube nocookie domain to avoid some CSP issues
  // Added parameters to ensure better compatibility
  const youtubeEmbedUrl = `https://www.youtube-nocookie.com/embed/${adVideoId}?autoplay=1&mute=1&controls=1&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30">
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl p-4 max-w-2xl w-full mx-4 h-64">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-gray-400 hover:text-white z-10"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center h-full flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">Publicité</h3>
          <p className="text-gray-300 mb-2 text-sm">Cette publicité soutient notre plateforme</p>

          {/* YouTube Ad Integration */}
          <div className="flex-1 bg-black rounded-lg overflow-hidden">
            <iframe
              src={youtubeEmbedUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube Advertisement"
            />
          </div>

          <div className="flex flex-col items-center mt-2">
            <p className="text-gray-400 text-xs mb-2">
              {timeLeft > 0 
                ? `Vous pourrez fermer cette publicité dans ${timeLeft} secondes` 
                : 'Vous pouvez maintenant fermer cette publicité'}
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleSkip}
                disabled={timeLeft > 0}
                className={timeLeft > 0 
                  ? 'bg-gray-600 cursor-not-allowed text-xs py-1 px-2' 
                  : 'bg-blue-600 hover:bg-blue-700 text-xs py-1 px-2'
                }
              >
                {timeLeft > 0 ? `Fermer (${timeLeft}s)` : 'Fermer la publicité'}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open('/subscription', '_blank')}
                className="border-gray-600 text-white hover:bg-gray-800 text-xs py-1 px-2"
              >
                Supprimer les pubs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAdOverlay;