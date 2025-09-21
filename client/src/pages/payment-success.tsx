import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, User } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [location, navigate] = useLocation();
  
  // Get payment details from URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const planName = urlParams.get('plan') || 'Premium';
  const amount = urlParams.get('amount') || '0';
  const reference = urlParams.get('ref') || 'N/A';

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 w-16 h-16 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Paiement réussi !</CardTitle>
          <CardDescription>
            Votre abonnement a été activé avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Détails de l'abonnement</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Plan :</span>
                <span className="font-medium">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant :</span>
                <span className="font-medium">{parseInt(amount).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Référence :</span>
                <span className="font-medium text-xs">{reference}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Prochaines étapes</h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Votre abonnement est maintenant actif</li>
              <li>• Vous pouvez commencer à profiter de tous les contenus</li>
              <li>• Votre prochain paiement sera dû dans 30 jours</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-2" />
              Mon compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;