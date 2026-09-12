import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import logoHeader from "@/assets/logo-header.png.asset.json";
import logoFooter from "@/assets/logo-footer.png.asset.json";

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Compliance", href: "/#compliance" },
  { label: "Pricing", href: "/#pricing" },
];


function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return signedIn;
}

export function SiteHeader({
  variant = "plain",
  className,
}: {
  variant?: "gradient" | "plain";
  className?: string;
}) {
  const signedIn = useSignedIn();
  const onGradient = variant === "gradient";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        onGradient ? "text-primary-foreground" : "border-b bg-card",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" aria-label="revsi.app home">
          <img src={onGradient ? logoHeader.url : logoFooter.url} alt="Revsi" className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium",
                onGradient
                  ? "opacity-80 hover:opacity-100"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </a>
          ))}
          {signedIn ? (
            <Button asChild size="sm" variant={onGradient ? "secondary" : "default"}>
              <Link to="/jobs">Go to dashboard</Link>
            </Button>
          ) : (
            <Link
              to="/login"
              className={cn(
                "text-sm font-medium",
                onGradient
                  ? "opacity-80 hover:opacity-100"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sign in
            </Link>
          )}
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className={cn(
            "md:hidden",
            onGradient ? "opacity-90" : "text-muted-foreground",
          )}
        >
          <Menu className="size-6" />
        </button>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-brand-gradient px-5 py-5 text-primary-foreground md:hidden">
          <div className="flex items-center justify-between">
            <img src={logoHeader.url} alt="Revsi" className="h-7 w-auto" />
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X className="size-6" />
            </button>
          </div>
          <nav className="mt-12 flex flex-col items-center gap-8 text-lg font-medium">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            {signedIn ? (
              <Link to="/jobs" onClick={() => setMenuOpen(false)}>
                Go to dashboard
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
            )}
            <Button asChild size="lg" variant="secondary">
              <a href={WAITLIST_MAILTO} onClick={() => setMenuOpen(false)}>
                Join the waitlist
              </a>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t bg-card", className)}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-left">
        <Link to="/" aria-label="revsi.app home">
          <img src={logoFooter.url} alt="Revsi" className="h-6 w-auto" />
        </Link>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <a href="mailto:info@revsi.app" className="hover:text-foreground">
            info@revsi.app
          </a>
        </div>
      </div>
    </footer>
  );
}
