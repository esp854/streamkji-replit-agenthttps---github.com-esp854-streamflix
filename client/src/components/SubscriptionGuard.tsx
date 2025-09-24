import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { useAuth } from "@/contexts/auth-context";
import SubscriptionRequiredMessage from "@/components/SubscriptionRequiredMessage";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { shouldRedirectToSubscription, subscriptionLoading } = useSubscriptionCheck();

  useEffect(() => {
    // Redirect to subscription page if user should have a subscription but doesn't
    if (!subscriptionLoading && shouldRedirectToSubscription) {
      setLocation("/subscription");
    }
  }, [shouldRedirectToSubscription, subscriptionLoading, setLocation]);

  // If user is not authenticated, let them view content (but they'll see ads)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If still loading subscription status, show nothing
  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Vérification de l'abonnement...</div>
      </div>
    );
  }

  // If user should be redirected to subscription page
  if (shouldRedirectToSubscription) {
    return <SubscriptionRequiredMessage />;
  }

  // User has access, render children
  return <>{children}</>;
};

export default SubscriptionGuard;