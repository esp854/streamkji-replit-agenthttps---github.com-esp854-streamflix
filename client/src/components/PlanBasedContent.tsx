import React from 'react';
import PlanFeatureGuard from './PlanFeatureGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Star, 
  Crown, 
  Zap, 
  Play,
  Download,
  Users,
  Award
} from 'lucide-react';

const PlanBasedContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Free content - available to all users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Contenu gratuit
            </CardTitle>
            <CardDescription>
              Accessible à tous les utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ce contenu est disponible pour tous les utilisateurs, quel que soit leur plan d'abonnement.
            </p>
            <Button className="w-full">
              Regarder maintenant
            </Button>
          </CardContent>
        </Card>

        {/* HD content - requires Standard plan or higher */}
        <PlanFeatureGuard 
          feature="hd"
          fallback={
            <Card className="opacity-70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Contenu HD
                </CardTitle>
                <CardDescription>
                  Disponible avec le plan Standard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-8 text-center mb-4">
                  <Award className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Passez au plan Standard pour accéder à ce contenu en haute définition.
                  </p>
                </div>
                <Button className="w-full" disabled>
                  Verrouillé
                </Button>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Contenu HD
              </CardTitle>
              <CardDescription>
                Disponible avec le plan Standard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Profitez de ce contenu en haute définition avec une qualité supérieure.
              </p>
              <Button className="w-full">
                Regarder en HD
              </Button>
            </CardContent>
          </Card>
        </PlanFeatureGuard>

        {/* 4K content - requires Premium or VIP plan */}
        <PlanFeatureGuard 
          feature="4k"
          fallback={
            <Card className="opacity-70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Contenu 4K
                </CardTitle>
                <CardDescription>
                  Disponible avec le plan Premium
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-8 text-center mb-4">
                  <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Passez au plan Premium pour accéder à ce contenu en 4K Ultra HD.
                  </p>
                </div>
                <Button className="w-full" disabled>
                  Verrouillé
                </Button>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Contenu 4K
              </CardTitle>
              <CardDescription>
                Disponible avec le plan Premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Expérience de visionnage ultime avec ce contenu en 4K Ultra HD.
              </p>
              <Button className="w-full">
                Regarder en 4K
              </Button>
            </CardContent>
          </Card>
        </PlanFeatureGuard>
      </div>

      {/* Exclusive content section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Contenu exclusif
          </CardTitle>
          <CardDescription>
            Contenu spécial réservé aux abonnés Premium et VIP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanFeatureGuard 
            feature="exclusive"
            fallback={
              <div className="text-center py-8">
                <div className="bg-muted rounded-lg p-8 mb-6">
                  <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Contenu exclusif verrouillé</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Ce contenu spécial est réservé aux abonnés Premium et VIP. 
                    Passez à un plan supérieur pour y accéder.
                  </p>
                  <Button size="lg">
                    Voir les plans d'abonnement
                  </Button>
                </div>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  src="https://placehold.co/600x338/222/fff?text=Contenu+Exclusif" 
                  alt="Contenu exclusif" 
                  className="rounded-lg w-full"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Film exclusif</h3>
                <p className="text-muted-foreground mb-4">
                  Un film spécial uniquement disponible pour les abonnés Premium et VIP. 
                  Découvrez une histoire captivante avec une qualité d'image exceptionnelle.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    Exclusif
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    4K Ultra HD
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Dolby Atmos
                  </span>
                </div>
                <Button className="w-full">
                  Regarder le contenu exclusif
                </Button>
              </div>
            </div>
          </PlanFeatureGuard>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanBasedContent;