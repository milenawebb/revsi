import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import logoHeader from "@/assets/logo-header.png.asset.json";
import logoFooter from "@/assets/logo-footer.png.asset.json";

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

  return (
    <header
      className={cn(
        onGradient ? "text-primary-foreground" : "border-b bg-card",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" aria-label="revsi.app home">
          <img src={onGradient ? logoHeader.url : logoFooter.url} alt="revsi" className="h-7 w-auto" />
        </Link>
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
      </div>
    </header>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t bg-card", className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" aria-label="revsi.app home">
          <img src={logoFooter.url} alt="revsi" className="h-6 w-auto" />
        </Link>
        <div className="flex flex-wrap items-center gap-4">
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
