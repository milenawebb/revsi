import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PublicBranding = {
  business_name: string;
  logo_url: string | null;
  button_color: string | null;
  website_url: string | null;
};

/**
 * Fetches public branding for a click/unsubscribe token via the
 * anon-granted public_branding RPC. Non-blocking: returns null until the
 * row arrives, and null forever for unknown tokens.
 */
export function usePublicBranding(token: string): PublicBranding | null {
  const [branding, setBranding] = useState<PublicBranding | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.rpc("public_branding" as never, {
        p_token: token,
      } as never);
      if (cancelled || error || !data) return;
      const rows = data as unknown as PublicBranding[];
      if (rows.length > 0 && rows[0]) setBranding(rows[0]);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return branding;
}
