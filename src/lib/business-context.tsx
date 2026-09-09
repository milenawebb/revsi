import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Business = Database["public"]["Tables"]["businesses"]["Row"];

const BusinessContext = createContext<Business | null>(null);

export function useBusiness() {
  const business = useContext(BusinessContext);
  if (!business) throw new Error("useBusiness must be used inside BusinessProvider");
  return business;
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["business"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold">No business found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account isn't linked to a business yet.
          </p>
        </div>
      </div>
    );
  }

  return <BusinessContext.Provider value={data}>{children}</BusinessContext.Provider>;
}
