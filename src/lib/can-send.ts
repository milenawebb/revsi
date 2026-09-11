import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CanSend = {
  allowed: boolean;
  reason: string | null;
  used: number;
  allowance: number;
};

/** Ask the database whether this business can still send review requests. */
export function useCanSend(businessId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["can-send", businessId],
    enabled: Boolean(businessId) && enabled,
    queryFn: async (): Promise<CanSend | null> => {
      const { data, error } = await supabase.rpc("can_business_send", {
        p_business_id: businessId!,
      });
      if (error) throw error;
      const row = data?.[0];
      if (!row) return null;
      return {
        allowed: row.allowed,
        reason: row.reason ?? null,
        used: row.used ?? 0,
        allowance: row.allowance ?? 0,
      };
    },
  });
}

export const PAYMENT_MAILTO = "mailto:info@revsi.app?subject=Payment";
