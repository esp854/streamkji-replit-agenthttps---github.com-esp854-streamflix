import { useQuery } from '@tanstack/react-query';

// Define plan features with more detailed specifications
export const PLAN_FEATURES = {
  free: {
    name: "Gratuit",
    maxSimultaneousDevices: 1,
    videoQuality: "SD",
    downloadAllowed: false,
    exclusiveContent: false,
    prioritySupport: false,
    earlyAccess: false,
    ads: true,
    maxVideoQuality: "SD", // Maximum quality allowed
    maxDevices: 1, // Maximum devices allowed
    canDownload: false, // Can download content
    hasExclusive: false, // Has access to exclusive content
    supportLevel: "basic", // Support level (basic, priority, vip)
    earlyAccessAllowed: false, // Early access to new content
  },
  basic: {
    name: "Basic",
    maxSimultaneousDevices: 1,
    videoQuality: "SD",
    downloadAllowed: false,
    exclusiveContent: false,
    prioritySupport: false,
    earlyAccess: false,
    ads: false,
    maxVideoQuality: "SD",
    maxDevices: 1,
    canDownload: false,
    hasExclusive: false,
    supportLevel: "basic",
    earlyAccessAllowed: false,
  },
  standard: {
    name: "Standard",
    maxSimultaneousDevices: 2,
    videoQuality: "HD",
    downloadAllowed: true,
    exclusiveContent: false,
    prioritySupport: true,
    earlyAccess: false,
    ads: false,
    maxVideoQuality: "HD",
    maxDevices: 2,
    canDownload: true,
    hasExclusive: false,
    supportLevel: "priority",
    earlyAccessAllowed: false,
  },
  premium: {
    name: "Premium",
    maxSimultaneousDevices: 4,
    videoQuality: "4K",
    downloadAllowed: true,
    exclusiveContent: true,
    prioritySupport: true,
    earlyAccess: false,
    ads: false,
    maxVideoQuality: "4K",
    maxDevices: 4,
    canDownload: true,
    hasExclusive: true,
    supportLevel: "priority",
    earlyAccessAllowed: false,
  },
  vip: {
    name: "VIP",
    maxSimultaneousDevices: Infinity,
    videoQuality: "4K",
    downloadAllowed: true,
    exclusiveContent: true,
    prioritySupport: true,
    earlyAccess: true,
    ads: false,
    maxVideoQuality: "4K",
    maxDevices: Infinity,
    canDownload: true,
    hasExclusive: true,
    supportLevel: "vip",
    earlyAccessAllowed: true,
  }
};

// Hook to get user's current subscription
export const useUserSubscription = () => {
  return useQuery({
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
};

// Hook to get plan features for the current user
export const usePlanFeatures = () => {
  const { data: subscriptionData, isLoading, error } = useUserSubscription();
  
  if (isLoading) {
    return { features: null, isLoading: true, error: null, planId: null };
  }
  
  if (error) {
    return { features: null, isLoading: false, error, planId: null };
  }
  
  const planId = subscriptionData?.subscription?.planId || 'free';
  const features = PLAN_FEATURES[planId as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.free;
  
  return { features, isLoading: false, error: null, planId };
};

// Hook to check if user has specific feature
export const useHasFeature = (feature: string) => {
  const { features, isLoading, error } = usePlanFeatures();
  
  if (isLoading || error || !features) {
    return { hasFeature: false, isLoading, error };
  }
  
  // Map feature names to actual feature checks
  switch (feature) {
    case 'download':
      return { hasFeature: features.canDownload, isLoading, error };
    case 'hd':
      return { hasFeature: features.maxVideoQuality === 'HD' || features.maxVideoQuality === '4K', isLoading, error };
    case '4k':
      return { hasFeature: features.maxVideoQuality === '4K', isLoading, error };
    case 'exclusive':
      return { hasFeature: features.hasExclusive, isLoading, error };
    case 'prioritySupport':
      return { hasFeature: features.supportLevel === 'priority' || features.supportLevel === 'vip', isLoading, error };
    case 'earlyAccess':
      return { hasFeature: features.earlyAccessAllowed, isLoading, error };
    case 'noAds':
      return { hasFeature: !features.ads, isLoading, error };
    case 'multipleDevices':
      return { hasFeature: features.maxDevices > 1, isLoading, error };
    default:
      return { hasFeature: false, isLoading, error };
  }
};

// Hook to check if user can access specific video quality
export const useCanAccessQuality = (quality: 'SD' | 'HD' | '4K') => {
  const { features, isLoading, error } = usePlanFeatures();
  
  if (isLoading || error || !features) {
    return { canAccess: false, isLoading, error };
  }
  
  // Check if user's plan allows this quality
  switch (quality) {
    case 'SD':
      return { canAccess: true, isLoading, error }; // All plans can access SD
    case 'HD':
      return { canAccess: features.maxVideoQuality === 'HD' || features.maxVideoQuality === '4K', isLoading, error };
    case '4K':
      return { canAccess: features.maxVideoQuality === '4K', isLoading, error };
    default:
      return { canAccess: false, isLoading, error };
  }
};

// Hook to check device limit
export const useDeviceLimit = () => {
  const { features, isLoading, error } = usePlanFeatures();
  
  if (isLoading || error || !features) {
    return { maxDevices: 1, currentDevices: 0, canAddDevice: true, isLoading, error };
  }
  
  const maxDevices = features.maxDevices === Infinity ? 10 : features.maxDevices; // Cap for display purposes
  const currentDevices = 1; // In a real app, this would come from the backend
  const canAddDevice = features.maxDevices === Infinity || currentDevices < features.maxDevices;
  
  return { maxDevices, currentDevices, canAddDevice, isLoading, error };
};

export default PLAN_FEATURES;