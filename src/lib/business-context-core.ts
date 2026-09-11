import { createContext, useContext } from "react";
import type { Database } from "@/integrations/supabase/types";

export type Business = Database["public"]["Tables"]["businesses"]["Row"];

export const BUSINESS_STORAGE_KEY = "selected-business-id";

export type BusinessCtx = {
  business: Business;
  businesses: Business[];
  selectBusiness: (id: string) => void;
};

export const BusinessContext = createContext<BusinessCtx | null>(null);

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used inside BusinessProvider");
  return ctx.business;
}

export function useBusinesses() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusinesses must be used inside BusinessProvider");
  return ctx;
}
