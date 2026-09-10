import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { useCanAsk } from "@/lib/can-ask";
import { MarkCompletedDialog } from "@/components/MarkCompletedDialog";
import { FUTURE_ERROR_SHORT, fromLocalInput, toLocalInput } from "@/lib/completion-time";

const SENT_STATUSES = ["sending", "sent", "delivered", "bounced", "failed"];

type Props = {
  jobId: string | null;
  onOpenChange: (v: boolean) => void;
};

function toDateInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : toLocalInput(d);
}

export function JobDetailDialog({ jobId, onOpenChange }: Props) {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service_type: "",
    notes: "",
    completed_date: "",
  });

  const job = useQuery({
    queryKey: ["job", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select(
          "id, customer_id, service_type, notes, status, completed_at, customers(id, name, email, phone)",
        )
        .eq("id", jobId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const requests = useQuery({
    queryKey: ["job-requests", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_requests")
        .select("id, kind, status, send_after, sent_at, clicked_at, error_message")
        .eq("service_id", jobId!)
        .order("send_after", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!job.data) return;
    setForm({
      name: job.data.customers?.name ?? "",
      email: job.data.customers?.email ?? "",
      phone: job.data.customers?.phone ?? "",
      service_type: job.data.service_type ?? "",
      notes: job.data.notes ?? "",
      completed_date: toDateInput(job.data.completed_at),
    });
  }, [job.data]);

  useEffect(() => {
    if (!jobId) {
      setEditing(false);
      setEmailError(null);
    }
  }, [jobId]);

  const list = requests.data ?? [];
  const initial = list.find((r) => r.kind === "initial");
  const hasSent = list.some((r) => SENT_STATUSES.includes(r.status));
  const emailLocked = hasSent;
  const missingInitial =
    !requests.isLoading && !initial && job.data?.status === "completed";
  const { data: canAsk } = useCanAsk(job.data?.customer_id, Boolean(missingInitial));

  const save = useMutation({
    mutationFn: async () => {
      setEmailError(null);
      const customerId = job.data?.customers?.id ?? job.data?.customer_id;
      if (!customerId) throw new Error("Missing customer");

      const customerPatch = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        ...(emailLocked ? {} : { email: form.email.trim() || null }),
      };

      const { error: custErr } = await supabase
        .from("customers")
        .update(customerPatch)
        .eq("id", customerId);
      if (custErr) {
        if (custErr.code === "23505") {
          setEmailError("Another customer in this business already uses that email address.");
          throw new Error("Duplicate email");
        }
        throw custErr;
      }

      const originalDate = toDateInput(job.data?.completed_at ?? null);
      const dateChanged = form.completed_date !== originalDate;
      const parsed = fromLocalInput(form.completed_date);
      const completedAt = parsed ? parsed.toISOString() : null;

      const { error: svcErr } = await supabase
        .from("services")
        .update({
          service_type: form.service_type.trim() || null,
          notes: form.notes.trim() || null,
          completed_at: completedAt,
        })
        .eq("id", job.data!.id);
      if (svcErr) throw svcErr;

      if (dateChanged && completedAt && initial && initial.status === "queued") {
        const sendAfter = new Date(
          new Date(completedAt).getTime() + (business.request_delay_minutes ?? 0) * 60_000,
        ).toISOString();
        const { error: reqErr } = await supabase
          .from("review_requests")
          .update({ send_after: sendAfter })
          .eq("id", initial.id);
        if (reqErr) throw reqErr;
      }
    },
    onSuccess: () => {
      toast.success("Job updated");
      setEditing(false);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => {
      if (e.message !== "Duplicate email") {
        toast.error("Couldn't save changes", { description: e.message });
      }
    },
  });

  const complete = useMutation({
    mutationFn: async (completedAt: string) => {
      const { error } = await supabase
        .from("services")
        .update({ status: "completed", completed_at: completedAt })
        .eq("id", job.data!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job completed", { description: "A review request has been scheduled." });
      setConfirmComplete(false);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't complete job", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("services").delete().eq("id", job.data!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job deleted");
      setConfirmDelete(false);
      onOpenChange(false);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't delete job", { description: e.message }),
  });

  const cancelReminder = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("review_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminder cancelled");
      setConfirmCancelId(null);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't cancel reminder", { description: e.message }),
  });

  return (
    <>
      <Dialog open={!!jobId} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Job details</DialogTitle>
            <DialogDescription>
              {editing ? "Update the customer and job details." : "Customer, job and review request."}
            </DialogDescription>
          </DialogHeader>

          {job.isLoading || !job.data ? (
            <p className="py-6 text-sm text-muted-foreground">Loading…</p>
          ) : editing ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="d-name">Customer name</Label>
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
                    readOnly={emailLocked}
                    disabled={emailLocked}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {emailLocked && (
                    <p className="text-xs text-muted-foreground">
                      The request has already been sent, so the email address cannot be changed.
                    </p>
                  )}
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="d-service">Service type</Label>
                  <Input
                    id="d-service"
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-date">Completed date and time</Label>
                  <Input
                    id="d-date"
                    type="datetime-local"
                    aria-invalid={completedFuture ? true : undefined}
                    value={form.completed_date}
                    onChange={(e) => setForm({ ...form, completed_date: e.target.value })}
                  />
                  {completedFuture ? (
                    <p className="text-xs text-destructive">{FUTURE_ERROR_SHORT}</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="d-notes">Notes</Label>
                <Textarea
                  id="d-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-5 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Customer" value={job.data.customers?.name} />
                <Field label="Email" value={job.data.customers?.email} />
                <Field label="Phone" value={job.data.customers?.phone} />
                <Field label="Service type" value={job.data.service_type} />
                <Field label="Job status" value={job.data.status} />
                <Field label="Completed" value={formatDateTime(job.data.completed_at)} />
              </div>
              {job.data.notes && <Field label="Notes" value={job.data.notes} />}

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Review request
                </p>
                {requests.isLoading ? (
                  <p className="text-muted-foreground">Loading…</p>
                ) : list.length === 0 ? (
                  missingInitial ? (
                    <div className="rounded-lg border bg-status-queued p-3">
                      <p className="text-sm font-medium text-status-queued-foreground">
                        No request was sent
                      </p>
                      <p className="mt-1 text-sm text-status-queued-foreground">
                        {canAsk?.reason ?? "This customer cannot be asked right now."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No request yet.</p>
                  )
                ) : (
                  list.map((r) => (
                    <div key={r.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {r.kind}
                          </Badge>
                          <span className="capitalize text-muted-foreground">{r.status}</span>
                        </div>
                        {r.kind === "reminder" && r.status === "queued" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 text-xs text-primary hover:text-primary/80"
                            onClick={() => setConfirmCancelId(r.id)}
                          >
                            Cancel reminder
                          </Button>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p>Sends {formatDateTime(r.send_after)}</p>
                        {r.sent_at && <p>Sent {formatDateTime(r.sent_at)}</p>}
                        <p>{r.clicked_at ? `Clicked ${formatDateTime(r.clicked_at)}` : "Not clicked"}</p>
                        {r.status === "failed" && r.error_message && (
                          <p className="text-destructive">{r.error_message}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete job
                </Button>
                <div className="flex gap-2">
                  {job.data.status === "scheduled" && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={complete.isPending}
                      onClick={() => setConfirmComplete(true)}
                    >
                      Mark completed
                    </Button>
                  )}
                  <Button type="button" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete job</AlertDialogTitle>
            <AlertDialogDescription>
              {hasSent
                ? "Delete this job? A review request has already been sent to this customer, and deleting the job will not unsend it."
                : "Delete this job? Nothing has been sent to this customer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={remove.isPending} onClick={() => remove.mutate()}>
              Delete job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmCancelId} onOpenChange={() => setConfirmCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Cancel this reminder? No follow-up email will be sent to this customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmCancelId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelReminder.isPending}
              onClick={() => confirmCancelId && cancelReminder.mutate(confirmCancelId)}
            >
              Cancel reminder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words capitalize-none">{value || "—"}</p>
    </div>
  );
}
