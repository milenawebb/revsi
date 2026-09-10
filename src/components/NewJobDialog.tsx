import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CompletionTimeControl,
  isFuture,
  type CompletionMode,
} from "@/components/CompletionTimeControl";
import { fromLocalInput, nowLocalInput } from "@/lib/completion-time";
import { useCanAsk } from "@/lib/can-ask";
import { useCustomerMatches } from "@/lib/customer-match";
import { CustomerMatchHint } from "@/components/CustomerMatchHint";
import { cn } from "@/lib/utils";

export type PresetCustomer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

const empty = { name: "", email: "", phone: "", service_type: "", notes: "" };

export function NewJobDialog({
  open,
  onOpenChange,
  presetCustomer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presetCustomer?: PresetCustomer;
}) {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [completedNow, setCompletedNow] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const locked = Boolean(presetCustomer);

  useEffect(() => {
    if (!open) return;
    if (presetCustomer) {
      setSelectedId(presetCustomer.id);
      setForm({
        ...empty,
        name: presetCustomer.name,
        email: presetCustomer.email ?? "",
        phone: presetCustomer.phone ?? "",
      });
    } else {
      setSelectedId(null);
      setForm(empty);
    }
    setEmailError(null);
    setCompletedNow(true);
  }, [open, presetCustomer]);

  const { matches } = useCustomerMatches({
    businessId: business.id,
    name: form.name,
    email: form.email,
    enabled: open && !locked && !selectedId,
  });

  const { data: canAsk } = useCanAsk(selectedId, open);
  const blockedReason = canAsk && !canAsk.allowed ? canAsk.reason : null;

  const canSave = Boolean(form.name.trim()) && Boolean(form.email.trim() || form.phone.trim());

  const save = useMutation({
    mutationFn: async () => {
      let customerId = selectedId;
      setEmailError(null);

      if (!customerId) {
        const { data: created, error: insertError } = await supabase
          .from("customers")
          .insert({
            business_id: business.id,
            name: form.name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
          })
          .select("id")
          .single();
        if (insertError) {
          if (insertError.code === "23505" || /duplicate key|unique/i.test(insertError.message)) {
            setEmailError("A customer with this email already exists for this business.");
            throw new Error("DUPLICATE_EMAIL");
          }
          throw insertError;
        }
        customerId = created.id;
      }

      const { error: serviceError } = await supabase.from("services").insert({
        business_id: business.id,
        customer_id: customerId,
        service_type: form.service_type.trim() || null,
        notes: form.notes.trim() || null,
        status: completedNow ? "completed" : "scheduled",
        completed_at: completedNow ? new Date().toISOString() : null,
      });
      if (serviceError) throw serviceError;
    },
    onSuccess: () => {
      toast.success("Job saved", {
        description: completedNow
          ? "A review request has been scheduled."
          : "Mark it completed when the work is done.",
      });
      setForm(empty);
      setSelectedId(null);
      setCompletedNow(true);
      onOpenChange(false);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => {
      if (e.message === "DUPLICATE_EMAIL") return;
      toast.error("Couldn't save job", { description: e.message });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New job</DialogTitle>
          <DialogDescription>Log the work and the customer to ask for a review.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer</Label>
            <Input
              id="customer-name"
              readOnly={locked}
              className={cn(locked && "bg-muted/50")}
              placeholder="Full name"
              value={form.name}
              onChange={(e) => {
                setSelectedId(null);
                setForm({ ...form, name: e.target.value });
              }}
            />
            {!locked ? (
              <CustomerMatchHint
                matches={matches}
                usingExisting={Boolean(selectedId)}
                onUse={(c) => {
                  setSelectedId(c.id);
                  setEmailError(null);
                  setForm({
                    ...form,
                    name: c.name,
                    email: c.email ?? "",
                    phone: c.phone ?? "",
                  });
                }}
                onClear={() => setSelectedId(null)}
              />
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={emailError ? true : undefined}
                value={form.email}
                onChange={(e) => {
                  setEmailError(null);
                  setSelectedId(null);
                  setForm({ ...form, email: e.target.value });
                }}
              />
              {emailError ? <p className="text-xs text-destructive">{emailError}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_type">Service type</Label>
            <Input
              id="service_type"
              value={form.service_type}
              onChange={(e) => setForm({ ...form, service_type: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="completed"
              checked={completedNow}
              onCheckedChange={(v) => setCompletedNow(v === true)}
            />
            <Label htmlFor="completed" className="font-normal">
              Completed now
            </Label>
          </div>
          {blockedReason ? (
            <div className="rounded-lg border bg-status-queued p-3">
              <p className="text-sm text-status-queued-foreground">{blockedReason}</p>
              <p className="mt-1 text-sm text-status-queued-foreground">
                Saving this job will not send a review request.
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending || !canSave}>
              {save.isPending ? "Saving…" : "Save job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
