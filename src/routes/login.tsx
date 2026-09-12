import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in · Review Requests" },
      { name: "description", content: "Sign in to manage jobs and review requests." },
      { property: "og:title", content: "Sign in · Review Requests" },
      { property: "og:description", content: "Sign in to manage jobs and review requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function onForgotPassword() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter your email address first, then choose Forgot password.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice("We sent you a link to reset your password. Check your inbox.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/jobs", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="gradient" className="bg-brand-gradient" />
      <main className="flex flex-1 items-center justify-center bg-brand-gradient px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-card">
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your jobs and review requests.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 space-y-2 text-center text-sm">
          <p className="text-muted-foreground">
            <Link to="/signup" className="font-medium text-foreground hover:underline">
              Create an account
            </Link>
          </p>
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={busy}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Forgot password
          </button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4 border-t pt-4 text-xs text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
