import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PlanFeatureGuard from '../components/PlanFeatureGuard';
import ContentWithPlanRestrictions from '../components/ContentWithPlanRestrictions';
import DownloadManagerWithRestrictions from '../components/DownloadManagerWithRestrictions';
import DeviceManagerWithRestrictions from '../components/DeviceManagerWithRestrictions';
import PlanFeatureComparison from '../components/PlanFeatureComparison';
import { 
  Play, 
  Download, 
  Monitor, 
  Star,
  Crown,
  Zap
} from 'lucide-react';

const PlanDemoPage: React.FC = () => {
  const sampleContent = {
    id: '1',
    title: 'Film d\'exemple avec restrictions',
    description: 'Un exemple de contenu qui démontre comment les restrictions de plan fonctionnent dans l\'application.',
    thumbnail: 'https://placehold.co/400x225/222/fff?text=Film+Exemple',
    duration: '2h 15m',
    rating: 4.5,
    isExclusive: true,
    quality: '4K' as const
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Démonstration des fonctionnalités par plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez comment les différentes fonctionnalités sont restreintes en fonction de votre plan d'abonnement.
        </p>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Contenu</span>
          </TabsTrigger>
          <TabsTrigger value="downloads" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Téléchargements</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Appareils</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Comparaison</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Contenu avec restrictions</CardTitle>
              <CardDescription>
                Certains contenus sont réservés aux abonnés de plans supérieurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ContentWithPlanRestrictions content={sampleContent} />
                <ContentWithPlanRestrictions 
                  content={{
                    ...sampleContent,
                    id: '2',
                    title: 'Contenu standard',
                    isExclusive: false,
                    quality: 'HD'
                  }} 
                />
                <ContentWithPlanRestrictions 
                  content={{
                    ...sampleContent,
                    id: '3',
                    title: 'Contenu gratuit',
                    isExclusive: false,
                    quality: 'SD'
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des téléchargements</CardTitle>
              <CardDescription>
                La possibilité de télécharger du contenu dépend de votre plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DownloadManagerWithRestrictions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des appareils</CardTitle>
              <CardDescription>
                Le nombre d'appareils simultanés dépend de votre plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeviceManagerWithRestrictions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison des fonctionnalités</CardTitle>
              <CardDescription>
                Comparez les fonctionnalités disponibles dans chaque plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanFeatureComparison />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Comment ça marche ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <div className="text-2xl font-bold text-primary mb-2">1</div>
              <h3 className="font-medium mb-2">Plan d'abonnement</h3>
              <p className="text-sm text-muted-foreground">
                Chaque utilisateur a un plan d'abonnement qui détermine ses privilèges dans l'application.
              </p>
            </div>
            
            <div className="border rounded-lg p-6">
              <div className="text-2xl font-bold text-primary mb-2">2</div>
              <h3 className="font-medium mb-2">Restrictions automatiques</h3>
              <p className="text-sm text-muted-foreground">
                Les composants de l'application vérifient automatiquement le plan de l'utilisateur pour appliquer les restrictions.
              </p>
            </div>
            
            <div className="border rounded-lg p-6">
              <div className="text-2xl font-bold text-primary mb-2">3</div>
              <h3 className="font-medium mb-2">Mise à niveau facile</h3>
              <p className="text-sm text-muted-foreground">
                Les utilisateurs peuvent facilement passer à un plan supérieur pour débloquer plus de fonctionnalités.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanDemoPage;