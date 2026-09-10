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
import { useCanAsk } from "@/lib/can-ask";
import { useBusiness } from "@/lib/business-context";

function sendTimeLabel(delayMinutes: number) {
  const sendAt = new Date(Date.now() + delayMinutes * 60_000);
  const time = sendAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const now = new Date();
  const sameDay = sendAt.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay) return `Sends around ${time} today.`;
  if (sendAt.toDateString() === tomorrow.toDateString()) return `Sends around ${time} tomorrow.`;
  return `Sends around ${time} on ${formatDate(sendAt.toISOString())}.`;
}

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
  const [askOpen, setAskOpen] = useState(false);
  const [askServiceType, setAskServiceType] = useState("");
  const business = useBusiness();
  const canAsk = useCanAsk(customerId);

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

  const mostRecentType = data?.jobs.find((j) => j.service_type)?.service_type ?? "";
  const sendLabel = sendTimeLabel(business.request_delay_minutes);
  const sendTimeShort = sendLabel.replace(/^Sends around /, "").replace(/\.$/, "");
  const noEmail = Boolean(data) && !data!.customer.email;
  const askBlocked = noEmail || (canAsk.data != null && !canAsk.data.allowed);

  const askNow = useMutation({
    mutationFn: async () => {
      const { error: iErr } = await supabase.from("services").insert({
        business_id: business.id,
        customer_id: customerId!,
        status: "completed",
        completed_at: new Date().toISOString(),
        service_type: askServiceType.trim() || null,
      });
      if (iErr) throw iErr;
    },
    onSuccess: () => {
      toast.success(`Job created. The request sends around ${sendTimeShort}.`);
      setAskOpen(false);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't create job", { description: e.message }),
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
          ) : askOpen ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ask-service-type">Service type</Label>
                <Input
                  id="ask-service-type"
                  value={askServiceType}
                  onChange={(e) => setAskServiceType(e.target.value)}
                  placeholder="e.g. Deep clean"
                />
              </div>
              <p className="text-sm text-muted-foreground">{sendLabel}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAskOpen(false)}
                  disabled={askNow.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => askNow.mutate()}
                  disabled={askNow.isPending}
                >
                  {askNow.isPending ? "Creating…" : "Create job and ask"}
                </Button>
              </div>
            </div>
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
                  <div className="w-full space-y-1 sm:w-auto sm:flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        disabled={askBlocked || canAsk.isLoading}
                        onClick={() => {
                          setAskServiceType(mostRecentType);
                          setAskOpen(true);
                        }}
                      >
                        Ask now
                      </Button>
                    </div>
                    {noEmail ? (
                      <p className="text-xs text-muted-foreground">No email address on file.</p>
                    ) : canAsk.data && !canAsk.data.allowed ? (
                      <p className="text-xs text-muted-foreground">{canAsk.data.reason}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      This records a completed job for this customer, which is what sends the
                      request.
                    </p>
                  </div>
                </div>
              </form>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Mark as reviewed</p>
                    <p className="text-xs text-muted-foreground">
                      Stops future review requests for this person.
                    </p>
                  </div>
                  <Switch
                    checked={Boolean(data.customer.reviewed_at)}
                    disabled={prefs.isPending}
                    onCheckedChange={(v) =>
                      prefs.mutate({ reviewed_at: v ? new Date().toISOString() : null })
                    }
                  />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Never ask</p>
                    <p className="text-xs text-muted-foreground">
                      They will never be sent a review request.
                    </p>
                  </div>
                  <Switch
                    checked={Boolean(data.customer.do_not_ask)}
                    disabled={prefs.isPending}
                    onCheckedChange={(v) => prefs.mutate({ do_not_ask: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-role">Role</Label>
                  <Select
                    value={data.customer.role ?? "customer"}
                    onValueChange={(v) => prefs.mutate({ role: v })}
                  >
                    <SelectTrigger id="d-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="requestor">Requestor</SelectItem>
                      <SelectItem value="signer">Signer</SelectItem>
                      <SelectItem value="attendee">Attendee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>



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
                {hasSent ? (
                  <div className="space-y-3 rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">This customer cannot be deleted</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        A review request has already been sent to them, so their record is kept as
                        a record of what was sent.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={prefs.isPending || Boolean(data.customer.do_not_ask)}
                        onClick={() => prefs.mutate({ do_not_ask: true })}
                      >
                        {data.customer.do_not_ask ? "Never asking" : "Never ask again"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("d-name")?.focus()}
                      >
                        Edit details
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Never ask again keeps their history but stops all future requests. Edit
                      details is for fixing a wrong name or phone number.
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() => setConfirmOpen(true)}
                  >
                    Delete customer
                  </Button>
                )}
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
