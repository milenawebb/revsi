import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { BusinessProvider } from "@/lib/business-context";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    const { data: rows, error: bizError } = await supabase
      .from("businesses")
      .select("id")
      .limit(1);
    if (!bizError && (!rows || rows.length === 0)) throw redirect({ to: "/welcome" });
    return { user: data.user };
  },
  component: () => (
    <BusinessProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </BusinessProvider>
  ),
});
