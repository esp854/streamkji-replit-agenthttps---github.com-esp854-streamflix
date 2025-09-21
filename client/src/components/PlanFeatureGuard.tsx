import { useState } from 'react';
import { usePlanFeatures, useHasFeature } from '../hooks/usePlanFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useLocation } from 'wouter';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface PlanFeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradeMessage?: boolean;
}

const PlanFeatureGuard: React.FC<PlanFeatureGuardProps> = ({ 
  feature, 
  children, 
  fallback,
  showUpgradeMessage = true
}) => {
  const { hasFeature, isLoading, error } = useHasFeature(feature);
  const { features, planId } = usePlanFeatures();
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de vérifier votre abonnement. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }
  
  // If user has the feature, render children
  if (hasFeature) {
    return <>{children}</>;
  }
  
  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // If we shouldn't show upgrade message, render nothing
  if (!showUpgradeMessage) {
    return null;
  }
  
  // Default fallback - show upgrade message
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Fonctionnalité non disponible
        </CardTitle>
        <CardDescription>
          Cette fonctionnalité n'est pas incluse dans votre plan actuel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Votre plan actuel ({features?.name}) ne permet pas d'accéder à cette fonctionnalité.
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Fonctionnalités de votre plan :</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                {features?.maxDevices === Infinity ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span>
                  {features?.maxDevices === Infinity ? 'Appareils illimités' : `${features?.maxDevices} appareil(s) simultané(s)`}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Qualité vidéo : {features?.maxVideoQuality}</span>
              </li>
              <li className="flex items-center gap-2">
                {features?.canDownload ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {features?.canDownload ? 'Téléchargements autorisés' : 'Téléchargements non autorisés'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {features?.hasExclusive ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {features?.hasExclusive ? 'Contenu exclusif inclus' : 'Contenu exclusif non inclus'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {features?.supportLevel !== 'basic' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {features?.supportLevel !== 'basic' ? 'Support prioritaire' : 'Support standard'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {features?.earlyAccessAllowed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {features?.earlyAccessAllowed ? 'Accès anticipé' : 'Accès standard'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {!features?.ads ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>
                  {!features?.ads ? 'Sans publicités' : 'Avec publicités'}
                </span>
              </li>
            </ul>
          </div>
          
          <Button 
            onClick={() => setLocation('/subscription')}
            className="w-full"
          >
            Mettre à niveau mon abonnement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanFeatureGuard;