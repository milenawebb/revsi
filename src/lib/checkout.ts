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

/**
 * Handles /jobs?checkout=success|cancelled. On success, toast and poll the
 * business row until the plan flips to paid (up to 30 seconds).
 */
export function useCheckoutReturn(businessId: string | null | undefined) {
  const queryClient = useQueryClient();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || !businessId || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const state = params.get("checkout");
    if (!state) return;
    handled.current = true;

    params.delete("checkout");
    const qs = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash,
    );

    if (state !== "success") return;

    toast.success("Payment added. Any requests that were waiting will send shortly.");

    let cancelled = false;
    const started = Date.now();

    async function poll() {
      while (!cancelled && Date.now() - started < 30_000) {
        await new Promise((r) => setTimeout(r, 2000));
        if (cancelled) return;
        const { data } = await supabase
          .from("businesses")
          .select("plan")
          .eq("id", businessId!)
          .maybeSingle();
        if (data?.plan === "paid") {
          await queryClient.invalidateQueries();
          return;
        }
      }
      if (!cancelled) {
        toast("Payment received. It may take a moment to activate.");
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [businessId, queryClient]);
}
