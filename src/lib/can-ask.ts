import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CanAsk = {
  allowed: boolean;
  reason: string | null;
  last_asked: string | null;
};

/** Ask the database whether this customer can be sent a review request. */
export function useCanAsk(customerId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["can-ask", customerId],
    enabled: Boolean(customerId) && enabled,
    queryFn: async (): Promise<CanAsk | null> => {
      const { data, error } = await supabase.rpc("can_ask_customer", {
        p_customer_id: customerId!,
      });
      if (error) throw error;
      const row = data?.[0];
      if (!row) return null;
      return {
        allowed: row.allowed,
        reason: row.reason ?? null,
        last_asked: row.last_asked ?? null,
      };
    },
  });
}

/** Short label for the reason text returned by can_ask_customer. */
export function askBlockLabel(reason: string | null | undefined) {
  const text = (reason ?? "").toLowerCase();
  if (text.includes("unsubscrib") || text.includes("opt")) return "Unsubscribed";
  if (text.includes("never") || text.includes("do not ask")) return "Do not ask";
  if (text.includes("review")) return "Reviewed";
  if (text.includes("recent") || text.includes("day")) return "Asked recently";
  return "Not asking";
}
