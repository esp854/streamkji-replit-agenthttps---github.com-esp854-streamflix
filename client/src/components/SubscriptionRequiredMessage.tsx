import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const SubscriptionRequiredMessage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">Abonnement Requis</h1>
        <p className="text-lg mb-6">
          Pour regarder ce contenu, vous devez avoir un abonnement actif.
        </p>
        <p className="text-gray-300 mb-8">
          Les administrateurs peuvent accéder à tout le contenu gratuitement. 
          Les utilisateurs doivent souscrire à un plan pour continuer.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/subscription">
              Voir les Plans d'Abonnement
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              Retour à l'Accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequiredMessage;