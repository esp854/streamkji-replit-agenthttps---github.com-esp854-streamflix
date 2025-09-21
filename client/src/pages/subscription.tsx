import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  Check, 
  Crown, 
  Star, 
  Shield, 
  CreditCard, 
  Clock, 
  Users, 
  Smartphone,
  Monitor,
  Tv,
  Loader2,
  Globe,
  Zap,
  Info,
  X,
  QrCode
} from 'lucide-react';

import PlanFeatureComparison from '../components/PlanFeatureComparison';
import { useAuth } from '@/contexts/auth-context';

interface SubscriptionPlan {
  name: string;
  description: string;
  amount: number;
  duration: number;
}

interface PlanFeature {
  text: string;
  available: boolean;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

interface PaymentData {
  paymentLink: string;
  qrCode: string;
  paymentId: string;
}

const SubscriptionPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  
  // Add refs for cleanup
  const isMountedRef = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const createPaymentMutationRef = useRef(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Set isMountedRef to false on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Also clean up any pending mutations
      createPaymentMutationRef.current = true;
    };
  }, []);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login?redirect=/subscription');
    }
  }, [isAuthenticated, setLocation]);

  // Prefill customer info from user data
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.username,
        email: user.email,
        phone: ''
      });
    }
  }, [user]);

  // Start polling for payment status
  const startPaymentPolling = (paymentId: string) => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Start new polling interval
    const interval = setInterval(async () => {
      // Check if component is still mounted before making API call
      if (!isMountedRef.current) {
        clearInterval(interval);
        return;
      }
      
      try {
        const response = await fetch(`/api/subscription/check-payment/${paymentId}`);
        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }
        
        const data = await response.json();
        
        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
          clearInterval(interval);
          return;
        }
        
        // Use functional update to ensure we have the latest state
        setPaymentStatus(prev => {
          if (!isMountedRef.current) {
            clearInterval(interval);
            return prev;
          }
          return data.status;
        });
        
        if (data.status === 'completed') {
          clearInterval(interval);
          pollingIntervalRef.current = null;
          // Refresh subscription data
          queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
          // Check if component is still mounted before showing toast
          if (isMountedRef.current) {
            toast({
              title: "Paiement réussi",
              description: "Votre paiement a été traité avec succès et votre abonnement est maintenant actif.",
            });
          }
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          clearInterval(interval);
          pollingIntervalRef.current = null;
          // Check if component is still mounted before showing toast
          if (isMountedRef.current) {
            toast({
              title: "Paiement échoué",
              description: "Votre paiement n'a pas abouti. Veuillez réessayer.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Payment status check error:', error);
        // Check if component is still mounted before showing toast
        if (!isMountedRef.current) return;
        
        toast({
          title: "Erreur",
          description: "Impossible de vérifier le statut du paiement",
          variant: "destructive",
        });
      }
    }, 5000); // Check every 5 seconds
    
    pollingIntervalRef.current = interval;
  };

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription/plans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription/plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    }
  });

  // Fetch current subscription
  const { data: currentSubscription } = useQuery({
    queryKey: ['/api/subscription/current'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/subscription/current', {
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      });
      if (!response.ok) throw new Error('Failed to fetch current subscription');
      return response.json();
    }
  });

  // Fetch payment history
  const { data: paymentHistory } = useQuery({
    queryKey: ['/api/subscription/payment-history'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/subscription/payment-history', {
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Failed to fetch payment history');
      return response.json();
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async ({ planId, customerInfo }: { planId: string; customerInfo: CustomerInfo }) => {
      // Check if component is still mounted before making API call
      if (!isMountedRef.current) {
        throw new Error('Component unmounted');
      }
      
      // Get CSRF token
      let csrfToken = '';
      try {
        const csrfResponse = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'include'
        });
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.csrfToken;
        }
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
      }
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/subscription/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ planId, customerInfo }),
      });
      
      // Check again if component is still mounted after API call
      if (!isMountedRef.current) {
        throw new Error('Component unmounted');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to create payment');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Check if component is still mounted before updating state
      if (!isMountedRef.current || createPaymentMutationRef.current) return;
      
      // Add a small delay to ensure state updates are properly handled
      setTimeout(() => {
        // Check again if component is still mounted
        if (!isMountedRef.current || createPaymentMutationRef.current) return;
        
        if (data.approval_url) {
          // Redirect to payment provider for payment
          window.location.href = data.approval_url;
        } else if (data.success && data.subscription) {
          // For subscription activation, show success message
          // Check if component is still mounted before showing toast
          if (isMountedRef.current) {
            toast({
              title: "Abonnement activé",
              description: data.message || "Votre abonnement a été activé avec succès.",
            });
          }
          // Refresh the current subscription data
          queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
          // Stop processing state
          setIsProcessing(false);
        } else if (data.paymentLink || data.paymentId) {
          // For Lygos payment, show payment data
          // Note: Lygos doesn't provide a QR code directly, so we'll show the payment link
          // Check if component is still mounted before updating state
          if (isMountedRef.current) {
            setPaymentData({
              paymentLink: data.paymentLink,
              qrCode: '', // We don't have a QR code from Lygos
              paymentId: data.paymentId
            });
            if (data.paymentId) {
              startPaymentPolling(data.paymentId);
            }
          }
          // Stop processing state
          setIsProcessing(false);
        } else if (data.success) {
          // For other successful payments without redirect
          // Check if component is still mounted before showing toast
          if (isMountedRef.current) {
            toast({
              title: "Paiement réussi",
              description: data.message || "Votre paiement a été traité avec succès.",
            });
          }
          // Refresh the current subscription data
          queryClient.invalidateQueries({ queryKey: ['/api/subscription/current'] });
          // Stop processing state
          setIsProcessing(false);
        } else {
          // Check if component is still mounted before showing toast
          if (isMountedRef.current) {
            toast({
              title: "Erreur de paiement",
              description: data.error || "Impossible de créer le paiement",
              variant: "destructive",
            });
          }
          // Stop processing state
          setIsProcessing(false);
        }
      }, 100);
    },
    onError: (error: any) => {
      // Check if component is still mounted before showing toast
      if (!isMountedRef.current || createPaymentMutationRef.current) return;
      
      // Add a small delay to ensure state updates are properly handled
      setTimeout(() => {
        // Check again if component is still mounted
        if (!isMountedRef.current || createPaymentMutationRef.current) return;
        
        // Always set isProcessing to false when we receive an error
        setIsProcessing(false);
        
        console.error('Payment creation error:', error);
        
        // Handle specific error types
        let title = "Erreur";
        let description = error.message || "Erreur lors de la création du paiement";
        
        if (error.message && error.message.includes('DEPLOYMENT_NOT_FOUND')) {
          title = "Service indisponible";
          description = "Le service de paiement est temporairement indisponible. Veuillez réessayer plus tard.";
        } else if (error.message && error.message.includes('fetch')) {
          title = "Erreur de connexion";
          description = "Impossible de se connecter au service de paiement. Veuillez vérifier votre connexion internet.";
        } else if (error.message === 'Component unmounted') {
          // Don't show toast if component is unmounted
          return;
        }
        
        // Check if component is still mounted before showing toast
        if (isMountedRef.current) {
          toast({
            title,
            description,
            variant: "destructive",
          });
        }
      }, 100);
    }
  });

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
  };

  // Handle free plan immediately without any payment processing
  const handlePayment = async () => {
    if (!selectedPlan) {
      toast({
        title: "Plan requis",
        description: "Veuillez sélectionner un plan d'abonnement",
        variant: "destructive",
      });
      return;
    }

    // Handle paid plans with Lygos payment processing
    if (!customerInfo.name || !customerInfo.email) {
      toast({
        title: "Informations manquantes", 
        description: "Veuillez remplir votre nom et email",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await createPaymentMutation.mutateAsync({ planId: selectedPlan, customerInfo });
    } catch (error: any) {
      console.error('Payment error:', error);
      // Error is handled in onError callback
    }
    // Note: We don't need a finally block anymore since we handle isProcessing in the mutation callbacks
  };

  const planFeatures = {
    basic: [
      { text: 'Accès à tout le contenu', available: true },
      { text: 'Qualité Standard (SD)', available: true },
      { text: '1 appareil simultané', available: true },
      { text: 'Support client', available: true },
      { text: 'Téléchargement', available: false },
      { text: 'Contenu exclusif', available: false },
      { text: 'Support prioritaire', available: false },
      { text: 'Accès anticipé', available: false }
    ],
    standard: [
      { text: 'Accès à tout le contenu', available: true },
      { text: 'Qualité HD', available: true },
      { text: '2 appareils simultanés', available: true },
      { text: 'Téléchargement hors ligne', available: true },
      { text: 'Support prioritaire', available: true },
      { text: 'Contenu exclusif', available: false },
      { text: 'Accès anticipé', available: false },
      { text: 'Sans publicités', available: true }
    ],
    premium: [
      { text: 'Accès à tout le contenu', available: true },
      { text: 'Qualité 4K Ultra HD', available: true },
      { text: '4 appareils simultanés', available: true },
      { text: 'Téléchargement illimité', available: true },
      { text: 'Support VIP 24/7', available: true },
      { text: 'Contenu exclusif', available: true },
      { text: 'Accès anticipé', available: false },
      { text: 'Sans publicités', available: true }
    ],
    vip: [
      { text: 'Accès à tout le contenu', available: true },
      { text: 'Qualité 4K Ultra HD', available: true },
      { text: 'Appareils illimités', available: true },
      { text: 'Téléchargement illimité', available: true },
      { text: 'Support VIP 24/7', available: true },
      { text: 'Contenu exclusif', available: true },
      { text: 'Accès anticipé aux nouveautés', available: true },
      { text: 'Sans publicités', available: true }
    ]
  };

  const planIcons = {
    basic: <Shield className="w-6 h-6" />,
    standard: <Star className="w-6 h-6" />,
    premium: <Crown className="w-6 h-6" />,
    vip: <Zap className="w-6 h-6" />
  };

  const planColors = {
    basic: 'border-gray-200',
    standard: 'border-blue-500 ring-2 ring-blue-200',
    premium: 'border-yellow-500 ring-2 ring-yellow-200',
    vip: 'border-purple-500 ring-2 ring-purple-200'
  };

  // Error boundary state
  const [error, setError] = useState<string | null>(null);

  if (plansLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex items-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Chargement des plans...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Recharger la page</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add safety check for plans data and filter out free plan
  if (!plans || Object.keys(plans).length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Aucun plan disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Aucun plan d'abonnement n'est actuellement disponible.</p>
            <Button onClick={() => window.location.reload()}>Recharger la page</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter out free plan since it's only for unauthenticated users
  const availablePlans = plans ? Object.entries(plans).filter(([planId]) => planId !== 'free') : [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Payment QR Code Modal */}
      <Dialog open={!!paymentData} onOpenChange={(open) => {
        if (!open && isMountedRef.current) {
          setPaymentData(null);
        }
      }}>
        <DialogContent className="max-w-md" aria-describedby="payment-dialog-description">
          <DialogHeader>
            <DialogTitle>Paiement Lygos</DialogTitle>
            <DialogDescription>
              Cliquez sur le lien pour procéder au paiement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {paymentData?.qrCode && (
              <div className="flex flex-col items-center">
                <img 
                  src={paymentData.qrCode} 
                  alt="QR Code de paiement" 
                  className="w-48 h-48 mx-auto"
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Scannez ce QR code avec votre application mobile pour payer
                </p>
              </div>
            )}
            
            {paymentData?.paymentLink && (
              <Button asChild className="w-full">
                <a href={paymentData.paymentLink} target="_blank" rel="noopener noreferrer">
                  Ouvrir le lien de paiement
                </a>
              </Button>
            )}
            
            {!paymentData?.qrCode && !paymentData?.paymentLink && (
              <p className="text-center text-muted-foreground">
                Les détails de paiement seront disponibles bientôt...
              </p>
            )}
            
            {paymentStatus && (
              <div className="text-center p-3 rounded-lg bg-gray-100">
                <p className="font-medium">
                  Statut du paiement: {paymentStatus === 'completed' ? 'Réussi' : 
                    paymentStatus === 'failed' ? 'Échoué' : 
                    paymentStatus === 'cancelled' ? 'Annulé' : paymentStatus}
                </p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => {
                if (isMountedRef.current) {
                  setPaymentData(null);
                }
              }}
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {showSuccessMessage && (
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Paiement réussi !
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Votre paiement a été traité avec succès et votre abonnement est maintenant actif.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <Card className="mb-8 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Erreur de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choisissez votre plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Profitez d'un streaming illimité avec nos plans flexibles. 
          Changez ou annulez à tout moment.
        </p>
        
        {/* Account requirement notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
          <p className="text-blue-800">
            <span className="font-medium">Note importante :</span> Vous devez être connecté avec un compte pour vous abonner à un plan. 
            Si vous n'avez pas encore de compte, veuillez vous inscrire d'abord.
          </p>
        </div>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription?.subscription ? (
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Abonnement actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Plan {currentSubscription.subscription.planId.charAt(0).toUpperCase() + 
                       currentSubscription.subscription.planId.slice(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expire le {new Date(currentSubscription.subscription.endDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Actif
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Subscription Plans (excluding free plan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {availablePlans.map(([planId, plan]: [string, any]) => {
          // Safety check for plan data
          if (!plan || !plan.name || plan.amount === undefined) {
            console.warn(`Invalid plan data for ${planId}:`, plan);
            return (
              <Card key={`invalid-${planId}`} className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-600">Plan invalide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Les données du plan {planId} sont incomplètes</p>
                </CardContent>
              </Card>
            );
          }
          
          // Ensure planId exists in our defined features and icons
          const features = planFeatures[planId as keyof typeof planFeatures] || [];
          const icon = planIcons[planId as keyof typeof planIcons] || <Shield className="w-6 h-6" />;
          const colorClass = planColors[planId as keyof typeof planColors] || 'border-gray-200';
          
          return (
            <Card 
              key={planId}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedPlan === planId ? colorClass : 'border-gray-200'}`}
              onClick={() => {
                if (isMountedRef.current) {
                  handlePlanSelection(planId);
                }
              }}
            >
              {planId === 'standard' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Populaire</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center">
                  {icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.amount.toLocaleString('fr-FR')}</span>
                  <span className="text-muted-foreground ml-1">FCFA/mois</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6 min-h-[150px]">
                  {features && Array.isArray(features) ? (
                    features.map((feature: PlanFeature, index) => (
                      <li key={`${planId}-feature-${index}`} className="flex items-start gap-2">
                        {feature.available ? (
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.available ? '' : 'text-muted-foreground line-through'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li key={`${planId}-no-features`} className="flex items-center gap-2">
                      <span className="text-sm">Aucune fonctionnalité disponible</span>
                    </li>
                  )}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={selectedPlan === planId ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMountedRef.current) {
                      handlePlanSelection(planId);
                    }
                  }}
                >
                  {selectedPlan === planId ? 'Sélectionné' : 'Choisir ce plan'}
                </Button>
              </CardContent>

            </Card>
          );
        })}
      </div>

      {/* Plan Feature Comparison */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Comparaison des fonctionnalités</CardTitle>
          <CardDescription>
            Comparez les fonctionnalités disponibles dans chaque plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanFeatureComparison currentPlanId={currentSubscription?.subscription?.planId} />
        </CardContent>
      </Card>

      {/* Customer Information Form */}
      {selectedPlan ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informations de facturation</CardTitle>
            <CardDescription>
              Remplissez vos informations pour procéder au paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => {
                    if (isMountedRef.current) {
                      setCustomerInfo(prev => ({ ...prev, name: e.target.value }));
                    }
                  }}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => {
                    if (isMountedRef.current) {
                      setCustomerInfo(prev => ({ ...prev, email: e.target.value }));
                    }
                  }}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => {
                    if (isMountedRef.current) {
                      setCustomerInfo(prev => ({ ...prev, phone: e.target.value }));
                    }
                  }}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Instructions de paiement
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Après avoir cliqué sur "Procéder au paiement", vous serez redirigé vers notre système de paiement Lygos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>Vous recevrez un QR code ou un lien de paiement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Scannez le QR code ou suivez le lien pour payer via votre portefeuille mobile</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">4.</span>
                      <span>Votre abonnement sera activé automatiquement après paiement</span>
                    </li>
                  </ul>
                  <div className="mt-3 p-3 bg-blue-100 rounded text-blue-800 text-sm">
                    <p className="font-medium mb-1">Méthodes de paiement acceptées :</p>
                    <p>Orange Money, MTN Mobile Money, Wave</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Payment Section */}
      {selectedPlan ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-500" />
              Finaliser votre abonnement
            </CardTitle>
            <CardDescription>
              Paiement sécurisé et crypté via Lygos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    Plan {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Abonnement mensuel</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {plans?.[selectedPlan]?.amount.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-sm text-muted-foreground">par mois</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-blue-500" />
                  <span className="font-medium text-gray-700">Paiement Lygos</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Paiement sécurisé via portefeuille mobile (Orange Money, MTN Mobile Money, Wave)
                </p>
              </div>

              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-6 text-lg"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Traitement en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    <span>Procéder au paiement avec Lygos</span>
                  </div>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                En cliquant sur "Procéder au paiement", vous acceptez nos{' '}
                <a href="/terms" className="underline">conditions d'utilisation</a> et notre{' '}
                <a href="/privacy" className="underline">politique de confidentialité</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Payment History */}
      {paymentHistory?.payments && paymentHistory.payments.length > 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Historique des paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.payments.slice(0, 5).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {payment.amount.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR')} - {payment.method}
                    </p>
                  </div>
                  <Badge 
                    variant={payment.status === 'success' ? 'default' : 'destructive'}
                  >
                    {payment.status === 'success' ? 'Réussi' : 'Échec'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default SubscriptionPage;