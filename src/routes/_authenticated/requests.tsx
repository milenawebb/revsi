import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime, statusTone } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({
    meta: [
      { title: "Requests · Review Requests" },
      { name: "description", content: "Every review request queued, sent, clicked or failed." },
      { property: "og:title", content: "Requests · Review Requests" },
      {
        property: "og:description",
        content: "Every review request queued, sent, clicked or failed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestsPage,
});

const STATUSES = ["queued", "sending", "sent", "failed", "bounced", "cancelled"];

function RequestsPage() {
  const business = useBusiness();
  const [status, setStatus] = useState("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["requests", business.id, status],
    queryFn: async () => {
      let q = supabase
        .from("review_requests")
        .select(
          "id, kind, status, send_after, sent_at, clicked_at, click_count, error_message, created_at, customers(name)",
        )
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (status !== "all") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
          <p className="text-sm text-muted-foreground">
            Created automatically when a job is completed.
          </p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_1fr_1fr_0.7fr] gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:grid">
          <span>Customer</span>
          <span>Kind</span>
          <span>Status</span>
          <span>Send after</span>
          <span>Sent</span>
          <span>Clicked</span>
        </div>
        {isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
        ) : data.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          data.map((r) => (
            <div key={r.id} className="border-t border-border/60 px-5 py-4 text-sm">
              <div className="grid gap-2 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr_1fr_0.7fr] md:items-center md:gap-4">
                <span className="font-medium">{r.customers?.name ?? "–"}</span>
                <span className="text-muted-foreground capitalize">{r.kind}</span>
                <span>
                  <Badge variant={statusTone(r.status)} className="capitalize">
                    {r.status}
                  </Badge>
                </span>
                <span className="text-muted-foreground">{formatDateTime(r.send_after)}</span>
                <span className="text-muted-foreground">{formatDateTime(r.sent_at)}</span>
                <span className="text-muted-foreground">
                  {r.clicked_at ? `Yes (${r.click_count})` : "No"}
                </span>
              </div>
              {r.status === "failed" && r.error_message ? (
                <p className="mt-2 text-xs text-destructive">{r.error_message}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
