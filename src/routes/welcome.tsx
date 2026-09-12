import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { BUSINESS_STORAGE_KEY } from "@/lib/business-context-core";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    const { data: rows } = await supabase.from("businesses").select("id").limit(1);
    if (rows && rows.length > 0) throw redirect({ to: "/jobs" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Set up your business · Revsi" },
      { name: "description", content: "Add your business details to start sending review requests." },
      { property: "og:title", content: "Set up your business · Revsi" },
      { property: "og:description", content: "Add your business details to start sending review requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [accountEmail, setAccountEmail] = useState("");
  const [form, setForm] = useState({
    name: "",
    from_name: "",
    review_url: "",
    reply_to_email: "",
    postal_address: "",
  });

  useEffect(() => {
    if (accountEmail) setForm((f) => ({ ...f, reply_to_email: accountEmail }));
  }, [accountEmail]);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAccountEmail(data.user?.email ?? ""));
  }, []);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUrlError(null);
    try {
      const url = new URL(form.review_url.trim());
      if (!url.protocol.startsWith("http")) throw new Error();
    } catch {
      setUrlError("Enter a valid link starting with https://");
      return;
    }
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setBusy(false);
      navigate({ to: "/login", replace: true });
      return;
    }
    const { data, error } = await supabase
      .from("businesses")
      .insert({
        owner_id: auth.user.id,
        name: form.name.trim(),
        from_name: form.from_name.trim(),
        review_url: form.review_url.trim(),
        reply_to_email: form.reply_to_email.trim(),
        postal_address: form.postal_address.trim(),
        request_delay_minutes: 60,
        reminder_enabled: true,
        reminder_delay_days: 3,
        free_allowance: 20,
        plan: "free",
        is_active: true,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      toast.error("Couldn't save your business", { description: error.message });
      return;
    }
    localStorage.setItem(BUSINESS_STORAGE_KEY, data.id);
    // Fire and forget: welcome email for the first business only.
    void supabase.functions
      .invoke("send-welcome-email", { body: { business_id: data.id } })
      .then(({ error: fnError }) => {
        if (fnError) console.error("send-welcome-email failed", fnError);
      })
      .catch((err) => console.error("send-welcome-email failed", err));
    await queryClient.invalidateQueries({ queryKey: ["businesses"] });
    navigate({ to: "/jobs", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="gradient" className="bg-brand-gradient" />
      <main className="flex flex-1 items-start justify-center bg-brand-gradient px-4 py-12">
        <div className="w-full max-w-lg rounded-xl border bg-card p-8 shadow-card">
          <h1 className="text-xl font-semibold tracking-tight">Set up your business</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This is what your customers will see when you ask them for a review.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_name">From name</Label>
              <Input
                id="from_name"
                required
                value={form.from_name}
                onChange={(e) => set("from_name", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The name recipients see in their inbox
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review_url">Google review link</Label>
              <Input
                id="review_url"
                type="url"
                required
                placeholder="https://g.page/r/..."
                value={form.review_url}
                onChange={(e) => set("review_url", e.target.value)}
              />
              {urlError ? <p className="text-sm text-destructive">{urlError}</p> : null}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <ChevronDown className="h-3.5 w-3.5" />
                  Where do I find this?
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Sign in to your Google Business Profile, open Read reviews, then Get more
                  reviews. Copy the short link it gives you.
                </CollapsibleContent>
              </Collapsible>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply_to_email">Reply-to email</Label>
              <Input
                id="reply_to_email"
                type="email"
                required
                placeholder={accountEmail}
                value={form.reply_to_email}
                onChange={(e) => set("reply_to_email", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Customer replies go here. Defaults to your account email.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_address">Contact information</Label>
              <Textarea
                id="postal_address"
                required
                rows={3}
                value={form.postal_address}
                onChange={(e) => set("postal_address", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Shown at the bottom of every email. A physical mailing address is required by law.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Save and continue"}
            </Button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
