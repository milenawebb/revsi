import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/** Start Stripe checkout for a business and send the browser to the hosted page. */
export function useStartCheckout(businessId: string | null | undefined) {
  const [loading, setLoading] = useState(false);

  async function start() {
    if (!businessId || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ url?: string }>("create-checkout", {
        body: { business_id: businessId },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout link was returned.");
      window.location.href = data.url;
    } catch (e) {
      setLoading(false);
      toast.error("Couldn't start checkout", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  }

  return { start, loading };
}
