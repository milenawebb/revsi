import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { useCanSend } from "@/lib/can-send";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewJobDialog } from "@/components/NewJobDialog";
import { JobDetailDialog } from "@/components/JobDetailDialog";
import { MarkCompletedDialog } from "@/components/MarkCompletedDialog";
import { formatDate } from "@/lib/format";
import { requestBadge, type RequestSummary } from "@/lib/request-state";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs · Review Requests" },
      { name: "description", content: "Log jobs and trigger automated review requests." },
      { property: "og:title", content: "Jobs · Review Requests" },
      { property: "og:description", content: "Log jobs and trigger automated review requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

function since30() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

function JobsPage() {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { data: canSend } = useCanSend(business.id);
  const usedUp = Boolean(canSend && canSend.used >= canSend.allowance);

  const jobs = useQuery({
    queryKey: ["jobs", business.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, service_type, status, completed_at, created_at, customers(name, email)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const dueByService = useQuery({
    queryKey: ["due-map", business.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_requests")
        .select("service_id, kind, status, send_after, sent_at, clicked_at, error_message")
        .eq("business_id", business.id)
        .eq("kind", "initial")
        .limit(500);
      if (error) throw error;
      const map: Record<string, RequestSummary> = {};
      for (const r of data) map[r.service_id] = r;
      return map;
    },
  });

  const stats = useQuery({
    queryKey: ["stats", business.id],
    queryFn: async () => {
      const from = since30();
      const [completed, requests] = await Promise.all([
        supabase
          .from("services")
          .select("id", { count: "exact", head: true })
          .eq("business_id", business.id)
          .eq("status", "completed")
          .gte("completed_at", from),
        supabase
          .from("review_requests")
          .select("sent_at, clicked_at")
          .eq("business_id", business.id)
          .eq("status", "sent")
          .gte("sent_at", from)
          .limit(1000),
      ]);
      if (completed.error) throw completed.error;
      if (requests.error) throw requests.error;
      const sent = requests.data.length;
      const clicked = requests.data.filter((r) => r.clicked_at).length;
      return {
        jobs: completed.count ?? 0,
        sent,
        clicked,
        rate: sent ? Math.round((clicked / sent) * 100) : 0,
      };
    },
  });

  const complete = useMutation({
    mutationFn: async ({ id, completedAt }: { id: string; completedAt: string }) => {
      const { error } = await supabase
        .from("services")
        .update({ status: "completed", completed_at: completedAt })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job completed", { description: "A review request has been scheduled." });
      setCompletingId(null);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't complete job", { description: e.message }),
  });

  const cards = [
    { label: "Jobs completed", value: stats.data?.jobs ?? 0 },
    { label: "Requests sent", value: stats.data?.sent ?? 0 },
    { label: "Requests clicked", value: stats.data?.clicked ?? 0 },
    { label: "Click rate", value: `${stats.data?.rate ?? 0}%` },
  ];

  return (
    <div className="space-y-6">
      {usedUp && !dismissed ? (
        <div className="flex items-start gap-3 rounded-xl border bg-status-queued p-4">
          <p className="flex-1 text-sm text-status-queued-foreground">
            You have used all {canSend?.allowance} free requests. New requests are being saved and
            will send as soon as you add a payment method.
          </p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="text-status-queued-foreground/70 hover:text-status-queued-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">Last 30 days at a glance.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="size-4" /> New job
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-card">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-gradient" />
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_0.8fr_1.2fr] gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:grid">
          <span>Customer</span>
          <span>Email</span>
          <span>Service</span>
          <span>Request</span>
          <span className="text-right">Job date</span>
        </div>
        {jobs.isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
        ) : jobs.data && jobs.data.length > 0 ? (
          jobs.data.map((job) => {
            const req = dueByService.data?.[job.id];
            const state = requestBadge(req);
            return (
              <div
                key={job.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedJobId(job.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedJobId(job.id);
                  }
                }}
                className="grid cursor-pointer gap-2 border-t border-border/60 px-5 py-4 text-sm transition-colors hover:bg-muted/40 md:grid-cols-[1.2fr_1.4fr_1fr_0.8fr_1.2fr] md:items-center md:gap-4"
              >
                <span className="font-medium">{job.customers?.name ?? "–"}</span>
                <span className="truncate text-muted-foreground">
                  {job.customers?.email ?? "–"}
                </span>
                <span className="text-muted-foreground">{job.service_type ?? "–"}</span>
                <div className="space-y-1">
                  <Badge variant={state.variant} className="capitalize">
                    {state.label}
                  </Badge>
                  {state.subtext && (
                    <div className="text-xs text-muted-foreground">{state.subtext}</div>
                  )}
                </div>
                <div className="md:text-right">
                  {job.status === "scheduled" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={complete.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompletingId(job.id);
                      }}
                    >
                      Mark completed
                    </Button>
                  ) : job.completed_at ? (
                    <span className="text-muted-foreground">{formatDate(job.completed_at)}</span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="px-5 py-8 text-sm text-muted-foreground">No jobs yet.</p>
        )}
      </div>

      <NewJobDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <JobDetailDialog
        jobId={selectedJobId}
        onOpenChange={(v) => {
          if (!v) setSelectedJobId(null);
        }}
      />
      <MarkCompletedDialog
        open={!!completingId}
        onOpenChange={(v) => {
          if (!v) setCompletingId(null);
        }}
        delayMinutes={business.request_delay_minutes ?? 0}
        pending={complete.isPending}
        onConfirm={(completedAt) =>
          completingId && complete.mutate({ id: completingId, completedAt })
        }
      />
    </div>
  );
}
