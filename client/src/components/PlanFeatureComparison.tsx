import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { PLAN_FEATURES } from '../hooks/usePlanFeatures';
import { Button } from './ui/button';
import { useLocation } from 'wouter';

interface PlanFeatureComparisonProps {
  currentPlanId?: string;
  onPlanSelect?: (planId: string) => void;
}

const PlanFeatureComparison: React.FC<PlanFeatureComparisonProps> = ({ 
  currentPlanId = 'free',
  onPlanSelect
}) => {
  const [, setLocation] = useLocation();
  const planIds = Object.keys(PLAN_FEATURES) as (keyof typeof PLAN_FEATURES)[];
  
  // Feature descriptions
  const featureDescriptions = {
    maxDevices: "Nombre maximum d'appareils pouvant être utilisés simultanément",
    maxVideoQuality: "Qualité vidéo maximale disponible",
    canDownload: "Possibilité de télécharger le contenu pour le visionner hors ligne",
    hasExclusive: "Accès à du contenu exclusif réservé aux abonnés",
    supportLevel: "Niveau de support client disponible",
    earlyAccessAllowed: "Accès anticipé aux nouvelles sorties",
    ads: "Présence de publicités pendant la lecture"
  };

  // Feature labels
  const featureLabels = {
    maxDevices: "Appareils simultanés",
    maxVideoQuality: "Qualité vidéo",
    canDownload: "Téléchargements",
    hasExclusive: "Contenu exclusif",
    supportLevel: "Support client",
    earlyAccessAllowed: "Accès anticipé",
    ads: "Publicités"
  };

  // Get feature value for display
  const getFeatureValue = (planId: keyof typeof PLAN_FEATURES, feature: string) => {
    const plan = PLAN_FEATURES[planId];
    const value = plan[feature as keyof typeof plan];
    
    if (feature === 'maxDevices') {
      return value === Infinity ? 'Illimité' : value;
    }
    
    if (feature === 'supportLevel') {
      switch (value) {
        case 'vip': return 'VIP 24/7';
        case 'priority': return 'Prioritaire';
        default: return 'Standard';
      }
    }
    
    if (feature === 'ads') {
      return value ? 'Avec pubs' : 'Sans pubs';
    }
    
    return value;
  };

  // Check if feature is available (true/green or false/red)
  const isFeatureAvailable = (planId: keyof typeof PLAN_FEATURES, feature: string) => {
    const plan = PLAN_FEATURES[planId];
    const value = plan[feature as keyof typeof plan];
    
    if (feature === 'ads') {
      return !value; // No ads is good
    }
    
    if (feature === 'supportLevel') {
      return value !== 'basic';
    }
    
    return !!value || value === 0 || value === Infinity;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-4 bg-muted">Fonctionnalités</th>
            {planIds.map(planId => (
              <th key={planId} className="p-4 bg-muted text-center">
                <div className="flex flex-col items-center">
                  <span className="font-bold">{PLAN_FEATURES[planId].name}</span>
                  {currentPlanId === planId && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full mt-1">
                      Votre plan
                    </span>
                  )}
                  {onPlanSelect && currentPlanId !== planId && (
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setLocation('/subscription')}
                    >
                      Choisir
                    </Button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(featureLabels).map(feature => (
            <tr key={feature} className="border-b">
              <td className="p-4 font-medium">
                <div className="flex items-center gap-2">
                  <span>{featureLabels[feature as keyof typeof featureLabels]}</span>
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <div className="absolute hidden group-hover:block bg-background border p-2 rounded shadow-lg">
                    {featureDescriptions[feature as keyof typeof featureDescriptions]}
                  </div>
                </div>
              </td>
              {planIds.map(planId => (
                <td key={`${planId}-${feature}`} className="p-4 text-center">
                  {isFeatureAvailable(planId, feature) ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      <span className="text-xs mt-1">
                        {getFeatureValue(planId, feature)}
                      </span>
                    </div>
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanFeatureComparison;