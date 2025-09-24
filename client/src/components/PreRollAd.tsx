import React, { useState, useEffect } from 'react';
import AdService from '@/services/adService';

interface PreRollAdProps {
  onAdComplete: () => void;
  onAdError?: (error: string) => void;
}

const PreRollAd: React.FC<PreRollAdProps> = ({ onAdComplete, onAdError }) => {
  const [currentAdId, setCurrentAdId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(15); // 15 seconds
  const adService = AdService.getInstance();

  useEffect(() => {
    // Get the first ad
    const allAds = adService.getAllYouTubeAds();
    if (allAds.length > 0) {
      setCurrentAdId(allAds[0]);
    }

    // Set up countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onAdComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-complete after 15 seconds
    const autoTimer = setTimeout(() => {
      onAdComplete();
    }, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoTimer);
    };
  }, [onAdComplete]);

  const handleAdError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('Pre-roll ad error:', e);
    onAdError?.('Failed to load pre-roll advertisement');
    onAdComplete(); // Skip ad on error
  };

  if (!currentAdId) {
    // If no ad is available, skip immediately
    useEffect(() => {
      onAdComplete();
    }, [onAdComplete]);
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
      <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl p-4 max-w-2xl w-full mx-4 h-64">
        <div className="text-center h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-white">Publicité</h3>
            <button 
              onClick={onAdComplete}
              className="text-gray-400 hover:text-white"
              title="Skip ad"
            >
              ×
            </button>
          </div>
          <p className="text-gray-300 mb-2 text-sm">Cette publicité soutient notre plateforme</p>

          {/* YouTube Ad Integration */}
          <div className="flex-1 bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${currentAdId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Pre-roll YouTube Advertisement"
              onError={handleAdError}
            />
          </div>

          <div className="flex flex-col items-center mt-2">
            <p className="text-gray-400 text-xs mb-2">
              {timeLeft > 0 
                ? `La vidéo commencera dans ${timeLeft} secondes` 
                : 'La vidéo va commencer...'}
            </p>

            <button
              onClick={onAdComplete}
              disabled={timeLeft > 0}
              className={timeLeft > 0 
                ? 'bg-gray-600 cursor-not-allowed text-xs py-1 px-3 rounded' 
                : 'bg-blue-600 hover:bg-blue-700 text-xs py-1 px-3 rounded text-white'
              }
            >
              {timeLeft > 0 ? `Passer (${timeLeft}s)` : 'Passer la publicité'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreRollAd;