import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePublicBranding } from "@/lib/public-branding";

export const Route = createFileRoute("/r/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Leave a review" },
      { name: "description", content: "Redirecting to leave a review." },
      { property: "og:title", content: "Leave a review" },
      { property: "og:description", content: "Redirecting to leave a review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewRedirectPage,
});

function ReviewRedirectPage() {
  const { token } = Route.useParams();
  const [status, setStatus] = useState<"loading" | "invalid" | "redirecting">("loading");
  const called = useRef(false);
  const branding = usePublicBranding(token);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    async function recordClick() {
      const { data, error } = await supabase.rpc("record_click_by_token", { p_token: token });

      if (error || !data || data.length === 0) {
        setStatus("invalid");
        return;
      }

      const reviewUrl = data[0]?.review_url;
      if (!reviewUrl) {
        setStatus("invalid");
        return;
      }

      setStatus("redirecting");
      window.location.href = reviewUrl;
    }


    recordClick();
  }, [token]);

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
        <div className="rounded-xl border bg-card p-8 shadow-card text-center">
        {status === "invalid" ? (
          <>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Link no longer valid
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This review link has expired or is no longer available.
            </p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-6 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Taking you to leave a review…
            </p>
          </>
        )}
        </div>
      </div>
    </main>
  );
}
