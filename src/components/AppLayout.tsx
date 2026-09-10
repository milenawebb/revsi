import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
  Check,
  ChevronsUpDown,
  Plus,
  UploadCloud,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusinesses } from "@/lib/business-context";
import { AddBusinessDialog } from "@/components/AddBusinessDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/requests", label: "Requests", icon: Send },
  { to: "/import", label: "Import", icon: UploadCloud },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { business, businesses, selectBusiness } = useBusinesses();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-accent/60">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-primary-foreground">
              {business.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                {business.name}
              </span>
              <span className="block text-xs text-sidebar-muted">Review requests</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-sidebar-muted" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {businesses.map((b) => (
            <DropdownMenuItem
              key={b.id}
              onSelect={() => {
                selectBusiness(b.id);
                setOpen(false);
              }}
              className="gap-2"
            >
              <Check className={cn("size-4", b.id === business.id ? "opacity-100" : "opacity-0")} />
              <span className="truncate">{b.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2" onSelect={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add business
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Button
        variant="ghost"
        className="mt-auto justify-start gap-3 px-3 text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        onClick={signOut}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-sidebar md:block">{sidebar}</aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card px-4 py-3 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <span className="text-sm font-semibold">{business.name}</span>
      </header>
      {open ? (
        <div className="fixed inset-x-0 top-[57px] bottom-0 z-20 bg-sidebar md:hidden">{sidebar}</div>
      ) : null}

      <main className="md:pl-60">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">{children}</div>
      </main>

      <AddBusinessDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(id) => {
          selectBusiness(id);
          setOpen(false);
          navigate({ to: "/jobs" });
        }}
      />
    </div>
  );
}
