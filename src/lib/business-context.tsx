import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AddBusinessDialog } from "@/components/AddBusinessDialog";
import { Button } from "@/components/ui/button";

export type Business = Database["public"]["Tables"]["businesses"]["Row"];

const STORAGE_KEY = "selected-business-id";

type Ctx = {
  business: Business;
  businesses: Business[];
  selectBusiness: (id: string) => void;
};

const BusinessContext = createContext<Ctx | null>(null);

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

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setSelectedId(localStorage.getItem(STORAGE_KEY));
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const businesses = useMemo(() => data ?? [], [data]);
  const current = businesses.find((b) => b.id === selectedId) ?? businesses[0] ?? null;

  function selectBusiness(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
    setSelectedId(id);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't load your businesses. Try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold">Add your first business</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up a business to start logging jobs and sending review requests.
          </p>
          <Button className="mt-5" onClick={() => setAddOpen(true)}>
            Add business
          </Button>
        </div>
        <AddBusinessDialog open={addOpen} onOpenChange={setAddOpen} onCreated={selectBusiness} />
      </div>
    );
  }

  return (
    <BusinessContext.Provider value={{ business: current, businesses, selectBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}
