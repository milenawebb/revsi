import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewJobDialog } from "@/components/NewJobDialog";
import { formatDate } from "@/lib/format";
import { requestBadge, type RequestSummary } from "@/lib/request-state";

export function CustomerDetailDialog({
  customerId,
  onOpenChange,
}: {
  customerId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["customer", customerId],
    enabled: Boolean(customerId),
    queryFn: async () => {
      const { data: customer, error: cErr } = await supabase
        .from("customers")
        .select("id, name, email, phone, reviewed_at, do_not_ask, role")
        .eq("id", customerId!)
        .single();
      if (cErr) throw cErr;

      const { data: jobs, error: sErr } = await supabase
        .from("services")
        .select(
          "id, service_type, status, completed_at, created_at, review_requests(kind, status, send_after, sent_at, clicked_at, error_message)",
        )
        .eq("customer_id", customerId!)
        .order("created_at", { ascending: false });
      if (sErr) throw sErr;

      return { customer, jobs: jobs ?? [] };
    },
  });

  useEffect(() => {
    if (data?.customer) {
      setForm({
        name: data.customer.name,
        email: data.customer.email ?? "",
        phone: data.customer.phone ?? "",
      });
      setError(null);
    }
  }, [data?.customer]);

  const hasSent = (data?.jobs ?? []).some((j) =>
    (j.review_requests ?? []).some((r) => r.status === "sent" || r.status === "delivered"),
  );

  const save = useMutation({
    mutationFn: async () => {
      const { error: uErr } = await supabase
        .from("customers")
        .update({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
        })
        .eq("id", customerId!);
      if (uErr) throw uErr;
    },
    onSuccess: () => {
      toast.success("Customer updated");
      queryClient.invalidateQueries();
    },
    onError: (e: { message: string; code?: string }) => {
      if (e.code === "23505" || /duplicate|unique/i.test(e.message)) {
        setError("Another customer in this business already uses that email address.");
        return;
      }
      toast.error("Couldn't save changes", { description: e.message });
    },
  });

  const prefs = useMutation({
    mutationFn: async (patch: {
      reviewed_at?: string | null;
      do_not_ask?: boolean;
      role?: string;
    }) => {
      const { error: pErr } = await supabase
        .from("customers")
        .update(patch)
        .eq("id", customerId!);
      if (pErr) throw pErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't update", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error: dErr } = await supabase.from("customers").delete().eq("id", customerId!);
      if (dErr) throw dErr;
    },
    onSuccess: () => {
      toast.success("Customer deleted");
      setConfirmOpen(false);
      onOpenChange(false);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't delete customer", { description: e.message }),
  });

  return (
    <>
      <Dialog open={Boolean(customerId)} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{data?.customer.name ?? "Customer"}</DialogTitle>
            <DialogDescription>Their details and every job you logged for them.</DialogDescription>
          </DialogHeader>

          {isLoading || !data ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-6">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setError(null);
                  save.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="d-name">Name</Label>
                  <Input
                    id="d-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="d-email">Email</Label>
                    <Input
                      id="d-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="d-phone">Phone</Label>
                    <Input
                      id="d-phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={save.isPending}>
                    {save.isPending ? "Saving…" : "Save changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setJobOpen(true)}>
                    Add job for this customer
                  </Button>
                </div>
              </form>

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Jobs
                </p>
                {data.jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No jobs yet.</p>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    {data.jobs.map((job) => {
                      const initial = (job.review_requests ?? []).find(
                        (r) => r.kind === "initial",
                      ) as RequestSummary | undefined;
                      const state = requestBadge(initial);
                      return (
                        <div
                          key={job.id}
                          className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
                        >
                          <div>
                            <p className="font-medium">{job.service_type ?? "Job"}</p>
                            <p className="text-xs text-muted-foreground">
                              {job.completed_at ? formatDate(job.completed_at) : "Not completed"}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={state.variant}>{state.label}</Badge>
                            {state.subtext ? (
                              <p className="mt-1 text-xs text-muted-foreground">{state.subtext}</p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t pt-4">
                <Button
                  variant="outline"
                  className="text-destructive"
                  disabled={hasSent}
                  onClick={() => setConfirmOpen(true)}
                >
                  Delete customer
                </Button>
                {hasSent ? (
                  <p className="text-xs text-muted-foreground">
                    A review request has already been sent to this customer, so their record is
                    kept.
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes them from your list. Their jobs must be deleted first if they have any.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {data?.customer ? (
        <NewJobDialog
          open={jobOpen}
          onOpenChange={setJobOpen}
          presetCustomer={{
            id: data.customer.id,
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone,
          }}
        />
      ) : null}
    </>
  );
}
