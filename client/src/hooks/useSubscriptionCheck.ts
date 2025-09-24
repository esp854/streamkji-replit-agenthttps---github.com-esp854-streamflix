import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

export const useSubscriptionCheck = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch current subscription for authenticated users (except admins)
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["current-subscription"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/subscription/current", {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch current subscription");
      return res.json();
    },
    enabled: isAuthenticated && !isAdmin,
  });

  // Check if user has an active subscription
  const hasActiveSubscription = isAdmin || (currentSubscription?.status === 'active' && new Date(currentSubscription.endDate) > new Date());

  // Users should be redirected to subscription page if:
  // 1. They are authenticated
  // 2. They are not admin
  // 3. They don't have an active subscription
  const shouldRedirectToSubscription = isAuthenticated && !isAdmin && !hasActiveSubscription;

  return {
    isAdmin,
    hasActiveSubscription,
    shouldRedirectToSubscription,
    currentSubscription,
    subscriptionLoading
  };
};