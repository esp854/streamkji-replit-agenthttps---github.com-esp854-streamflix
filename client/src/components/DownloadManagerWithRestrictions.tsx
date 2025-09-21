import React, { useState } from 'react';
import PlanFeatureGuard from './PlanFeatureGuard';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Download, 
  HardDrive, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DownloadItem {
  id: string;
  title: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  size: string;
}

const DownloadManagerWithRestrictions: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: '1',
      title: 'Film d\'action',
      progress: 65,
      status: 'downloading',
      size: '1.2 GB'
    },
    {
      id: '2',
      title: 'Série dramatique - Épisode 3',
      progress: 100,
      status: 'completed',
      size: '850 MB'
    }
  ]);

  const handleDownload = (itemId: string) => {
    // In a real app, this would start the download process
    setDownloads(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: 'downloading', progress: Math.min(item.progress + 10, 100) } 
        : item
    ));
  };

  const getDownloadStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'downloading': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDownloadStatusText = (status: DownloadItem['status']) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'failed': return 'Échoué';
      case 'downloading': return 'En cours';
      default: return 'En attente';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Gestion des téléchargements
        </CardTitle>
        <CardDescription>
          Gérez vos téléchargements hors ligne
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PlanFeatureGuard 
          feature="download"
          fallback={
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Fonctionnalité non disponible</h3>
              <p className="text-muted-foreground mb-4">
                Votre plan actuel ne permet pas les téléchargements. 
                Passez à un plan supérieur pour télécharger du contenu.
              </p>
              <Button>Voir les plans</Button>
            </div>
          }
        >
          <div className="space-y-4">
            {downloads.map(download => (
              <div key={download.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{download.title}</h4>
                  <div className="flex items-center gap-2">
                    {getDownloadStatusIcon(download.status)}
                    <span className="text-sm text-muted-foreground">
                      {getDownloadStatusText(download.status)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={download.progress} className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {download.progress}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {download.size}
                  </span>
                  {download.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleDownload(download.id)}
                      disabled={download.status === 'downloading'}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {download.status === 'downloading' ? 'En cours...' : 'Télécharger'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Télécharger un nouveau contenu</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Rechercher un film ou une série" 
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </PlanFeatureGuard>
      </CardContent>
    </Card>
  );
};

export default DownloadManagerWithRestrictions;