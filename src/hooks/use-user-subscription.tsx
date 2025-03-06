
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserSubscription } from "@/types/subscriptions";

export function useUserSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" - not an error for us
        console.error("Error fetching subscription:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription information",
          variant: "destructive",
        });
      }

      setSubscription(data as UserSubscription || null);
    } catch (error) {
      console.error("Error in subscription hook:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription on mount and when user changes
  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  // Function to check if user is on a free plan
  const isFreePlan = () => {
    if (!user) return true; // No user = free plan
    if (!subscription) return true; // No subscription = free plan
    return subscription.plan_id === "free" || subscription.status !== "active";
  };

  // Function to check if user has premium features
  const hasPremiumAccess = () => {
    if (!user) return false; // No user = no premium
    if (!subscription) return false; // No subscription = no premium
    
    // Check if subscription is active and not on free plan
    return (
      subscription.status === "active" && 
      (subscription.plan_id === "monthly" || subscription.plan_id === "annual")
    );
  };

  // Get the plan name as a formatted string
  const getPlanName = () => {
    if (!subscription) return "Free Plan";
    
    switch (subscription.plan_id) {
      case "monthly":
        return "Premium Monthly";
      case "annual":
        return "Premium Annual";
      default:
        return "Free Plan";
    }
  };

  return {
    subscription,
    loading,
    isFreePlan,
    hasPremiumAccess,
    getPlanName,
    refreshSubscription: fetchSubscription
  };
}
