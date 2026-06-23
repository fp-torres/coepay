import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id?: string;
  subscription_end?: string;
  plan: "free" | "basic" | "premium";
  loading: boolean;
}

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    plan: "free",
    loading: true,
  });
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        setStatus({ subscribed: false, plan: "free", loading: false });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus({ subscribed: false, plan: "free", loading: false });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setStatus({
        subscribed: data.subscribed || false,
        product_id: data.product_id,
        subscription_end: data.subscription_end,
        plan: data.plan || "free",
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus({ subscribed: false, plan: "free", loading: false });
    }
  };

  const createCheckout = async (priceId: string) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        toast({
          title: "Planos indisponíveis",
          description: "Configure Supabase/Stripe para ativar checkout.",
          variant: "destructive",
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para fazer upgrade.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { priceId },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar sessão de pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    try {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir portal do cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();

    if (!isSupabaseConfigured || !supabase) return;

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkSubscription();
      } else if (event === 'SIGNED_OUT') {
        setStatus({ subscribed: false, plan: "free", loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...status,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
