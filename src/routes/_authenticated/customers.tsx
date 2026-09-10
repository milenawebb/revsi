import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportFlow } from "@/components/ImportFlow";
import { AddCustomerDialog } from "@/components/AddCustomerDialog";
import { CustomerDetailDialog } from "@/components/CustomerDetailDialog";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Review Requests" },
      { name: "description", content: "Everyone you have worked with, and their job history." },
      { property: "og:title", content: "Customers — Review Requests" },
      {
        property: "og:description",
        content: "Everyone you have worked with, and their job history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", business.id],
    queryFn: async () => {
      const [customers, jobs, optouts] = await Promise.all([
        supabase
          .from("customers")
          .select("id, name, email, phone, created_at")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("services")
          .select("customer_id, completed_at")
          .eq("business_id", business.id)
          .limit(2000),
        supabase
          .from("contact_optouts")
          .select("email")
          .eq("business_id", business.id)
          .limit(2000),
      ]);
      if (customers.error) throw customers.error;
      if (jobs.error) throw jobs.error;
      if (optouts.error) throw optouts.error;

      const counts: Record<string, { jobs: number; last: string | null }> = {};
      for (const j of jobs.data ?? []) {
        const entry = (counts[j.customer_id] ??= { jobs: 0, last: null });
        entry.jobs += 1;
        if (j.completed_at && (!entry.last || j.completed_at > entry.last)) {
          entry.last = j.completed_at;
        }
      }
      const optedOut = new Set(
        (optouts.data ?? []).map((o) => (o.email ?? "").toLowerCase().trim()).filter(Boolean),
      );

      return (customers.data ?? []).map((c) => ({
        ...c,
        jobCount: counts[c.id]?.jobs ?? 0,
        lastJob: counts[c.id]?.last ?? null,
        unsubscribed: optedOut.has((c.email ?? "").toLowerCase().trim()),
      }));
    },
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(
      (c) =>
        c.name.toLowerCase().includes(term) || (c.email ?? "").toLowerCase().includes(term),
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Everyone you have worked with.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" /> Import
          </Button>
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add customer
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm bg-card"
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="hidden grid-cols-[1.2fr_1.6fr_1fr_0.6fr_0.8fr] gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:grid">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Jobs</span>
          <span className="text-right">Last job</span>
        </div>
        {isLoading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No customers yet.</p>
        ) : (
          rows.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(c.id);
                }
              }}
              className="grid cursor-pointer gap-2 border-t border-border/60 px-5 py-4 text-sm transition-colors hover:bg-muted/40 md:grid-cols-[1.2fr_1.6fr_1fr_0.6fr_0.8fr] md:items-center md:gap-4"
            >
              <span className="flex items-center gap-2 font-medium">
                {c.name}
                {c.unsubscribed ? <Badge variant="cancelled">Unsubscribed</Badge> : null}
              </span>
              <span className="truncate text-muted-foreground">{c.email ?? "—"}</span>
              <span className="text-muted-foreground">{c.phone ?? "—"}</span>
              <span className="text-muted-foreground">{c.jobCount}</span>
              <span className="text-muted-foreground md:text-right">{formatDate(c.lastJob)}</span>
            </div>
          ))
        )}
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-h-[92vh] w-[96vw] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import contacts</DialogTitle>
            <DialogDescription>Bring past customers in from a spreadsheet.</DialogDescription>
          </DialogHeader>
          <ImportFlow
            showHeading={false}
            onFinished={() => {
              setImportOpen(false);
              queryClient.invalidateQueries();
            }}
          />
        </DialogContent>
      </Dialog>

      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
      <CustomerDetailDialog
        customerId={selectedId}
        onOpenChange={(v) => {
          if (!v) setSelectedId(null);
        }}
      />
    </div>
  );
}
