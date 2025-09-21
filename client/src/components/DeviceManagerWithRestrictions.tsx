import React from 'react';
import PlanFeatureGuard from './PlanFeatureGuard';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  Tv,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useDeviceLimit } from '../hooks/usePlanFeatures';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'tv';
  lastActive: string;
  location: string;
  isCurrent: boolean;
}

const DeviceManagerWithRestrictions: React.FC = () => {
  const { maxDevices, currentDevices, canAddDevice } = useDeviceLimit();
  
  const devices: Device[] = [
    {
      id: '1',
      name: 'iPhone 12',
      type: 'mobile',
      lastActive: 'Il y a 2 heures',
      location: 'Dakar, Sénégal',
      isCurrent: true
    },
    {
      id: '2',
      name: 'MacBook Pro',
      type: 'desktop',
      lastActive: 'Il y a 1 jour',
      location: 'Dakar, Sénégal',
      isCurrent: false
    }
  ];

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'tv': return <Tv className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Appareils connectés
        </CardTitle>
        <CardDescription>
          Gérez les appareils connectés à votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PlanFeatureGuard 
          feature="multipleDevices"
          fallback={
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Fonctionnalité limitée</h3>
              <p className="text-muted-foreground mb-4">
                Votre plan Gratuit ne permet d'utiliser qu'un seul appareil à la fois.
                Passez à un plan supérieur pour utiliser plusieurs appareils simultanément.
              </p>
              <Button>Voir les plans</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Appareils actifs</h4>
                <p className="text-sm text-muted-foreground">
                  {currentDevices} sur {maxDevices === Infinity ? 'Illimité' : maxDevices} appareils utilisés
                </p>
              </div>
              <Button 
                disabled={!canAddDevice}
                variant={canAddDevice ? "default" : "secondary"}
              >
                Ajouter un appareil
              </Button>
            </div>
            
            <div className="space-y-3">
              {devices.map(device => (
                <div 
                  key={device.id} 
                  className={`border rounded-lg p-4 ${device.isCurrent ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <h5 className="font-medium">{device.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {device.location} • {device.lastActive}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {device.isCurrent ? (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Actuel
                        </span>
                      ) : (
                        <Button variant="outline" size="sm">
                          Déconnecter
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {!canAddDevice && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Limite d'appareils atteinte</h4>
                    <p className="text-sm text-yellow-700">
                      Vous utilisez actuellement {currentDevices} appareils sur {maxDevices} autorisés.
                      Déconnectez un appareil pour en ajouter un nouveau ou passez à un plan supérieur.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PlanFeatureGuard>
      </CardContent>
    </Card>
  );
};

export default DeviceManagerWithRestrictions;