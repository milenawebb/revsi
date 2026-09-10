import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { usePublicBranding } from "@/lib/public-branding";
import {
  DEFAULT_BUTTON_COLOR,
  effectiveButtonColor,
  HEX_RE,
} from "@/components/EmailPreview";

export const Route = createFileRoute("/unsubscribe/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Unsubscribe from review requests" },
      { name: "description", content: "Unsubscribe from review request emails." },
      { property: "og:title", content: "Unsubscribe from review requests" },
      { property: "og:description", content: "Unsubscribe from review request emails." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useParams();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "invalid">("idle");
  const [result, setResult] = useState<{ business_name: string; customer_email: string } | null>(null);
  const called = useRef(false);
  const branding = usePublicBranding(token);

  async function onUnsubscribe() {
    if (called.current) return;
    called.current = true;

    setStatus("loading");
    const { data, error } = await supabase.rpc("optout_by_token", { p_token: token });

    if (error || !data || data.length === 0) {
      setStatus("invalid");
      return;
    }

    const row = data[0];
    if (!row) {
      setStatus("invalid");
      return;
    }

    setResult(row);
    setStatus("success");
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {branding?.logo_url ? (
          <div className="mb-6 flex justify-center">
            <img
              src={branding.logo_url}
              alt={branding.business_name}
              className="max-h-12 w-auto object-contain"
            />
          </div>
        ) : null}
        <div className="rounded-xl border bg-card p-8 shadow-card">
        {status === "success" && result ? (
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              You have been unsubscribed
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.customer_email} will no longer receive review request emails from{" "}
              {result.business_name}.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">Thank you for your business.</p>
          </div>
        ) : status === "invalid" ? (
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Link not valid
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This unsubscribe link is no longer valid or has already been used.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Unsubscribe from review requests
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Click below to stop receiving review request emails from this business.
            </p>
            <Button
              className="mt-6 w-full"
              style={
                branding?.button_color && HEX_RE.test(branding.button_color)
                  ? {
                      backgroundColor: effectiveButtonColor(branding.button_color),
                    }
                  : branding?.button_color
                    ? { backgroundColor: DEFAULT_BUTTON_COLOR }
                    : undefined
              }
              onClick={onUnsubscribe}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Unsubscribing…
                </>
              ) : (
                "Unsubscribe me"
              )}
            </Button>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
