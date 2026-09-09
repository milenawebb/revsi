import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, Send, Settings, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/requests", label: "Requests", icon: Send },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const business = useBusiness();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div>
        <p className="text-sm font-semibold tracking-tight">{business.name}</p>
        <p className="text-xs text-muted-foreground">Review requests</p>
      </div>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary font-medium text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Button variant="ghost" className="mt-auto justify-start gap-3 px-3" onClick={signOut}>
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-card md:block">{sidebar}</aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 bg-card px-4 py-3 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <span className="text-sm font-semibold">{business.name}</span>
      </header>
      {open ? (
        <div className="fixed inset-x-0 top-[57px] bottom-0 z-20 bg-card md:hidden">{sidebar}</div>
      ) : null}

      <main className="md:pl-60">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
