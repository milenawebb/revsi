import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

const empty = { name: "", email: "", phone: "", service_type: "", notes: "" };

export function NewJobDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [completedNow, setCompletedNow] = useState(true);

  const save = useMutation({
    mutationFn: async () => {
      const email = form.email.trim();
      let customerId: string | null = null;

      if (email) {
        const { data: existing, error: findError } = await supabase
          .from("customers")
          .select("id")
          .eq("business_id", business.id)
          .ilike("email", email)
          .maybeSingle();
        if (findError) throw findError;
        customerId = existing?.id ?? null;
      }

      if (!customerId) {
        const { data: created, error: insertError } = await supabase
          .from("customers")
          .insert({
            business_id: business.id,
            name: form.name.trim(),
            email: email || null,
            phone: form.phone.trim() || null,
          })
          .select("id")
          .single();
        if (insertError) throw insertError;
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
      setCompletedNow(true);
      onOpenChange(false);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error("Couldn't save job", { description: e.message }),
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
            <Label htmlFor="name">Customer name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
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
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
