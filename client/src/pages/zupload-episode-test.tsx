import React from 'react';
import ZuploadVideoPlayer from '@/components/zupload-video-player';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useLocation } from 'wouter';

const ZuploadEpisodeTest: React.FC = () => {
  const [, setLocation] = useLocation();
  
  const handleGoHome = () => {
    setLocation('/');
  };

  // The video URL for testing
  const videoUrl = "https://zupload.cc/embed/kXHdlQd2HPGFyGT";
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Test de Lecture Vidéo</h1>
          <Button onClick={handleGoHome} variant="default">
            <Home className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Épisode de Test</h2>
          <p className="text-gray-400 mb-4">
            Test de lecture d'un épisode avec le lecteur vidéo intégré.
          </p>
        </div>
        
        <div className="rounded-lg overflow-hidden shadow-lg mb-8">
          <ZuploadVideoPlayer 
            videoUrl={videoUrl}
            title="Épisode de Test"
          />
        </div>
        
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Informations sur le lecteur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Caractéristiques techniques</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                <li>Lecteur vidéo intégré</li>
                <li>Contrôles personnalisés</li>
                <li>Plein écran supporté</li>
                <li>Design responsive</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Contrôles disponibles</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                <li>Play/Pause (clic sur la vidéo ou bouton)</li>
                <li>Volume (bouton mute)</li>
                <li>Plein écran (bouton en bas à droite)</li>
                <li>Avance/Retour 15s (boutons centraux)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZuploadEpisodeTest;