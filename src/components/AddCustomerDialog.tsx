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
import { useCustomerMatches } from "@/lib/customer-match";
import { CustomerMatchHint } from "@/components/CustomerMatchHint";

const empty = { name: "", email: "", phone: "" };

export function AddCustomerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(empty);
    setError(null);
    setEmailError(null);
    setExistingId(null);
  }, [open]);

  const { matches } = useCustomerMatches({
    businessId: business.id,
    name: form.name,
    email: form.email,
    enabled: open && !existingId,
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error: insertError } = await supabase.from("customers").insert({
        business_id: business.id,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success("Customer added");
      setForm(empty);
      setError(null);
      onOpenChange(false);
      queryClient.invalidateQueries();
    },
    onError: (e: { message: string; code?: string }) => {
      if (e.code === "23505" || /duplicate|unique/i.test(e.message)) {
        setEmailError("A customer with this email already exists for this business.");
        return;
      }
      toast.error("Couldn't add customer", { description: e.message });
    },
  });

  const canSave = Boolean(form.name.trim()) && Boolean(form.email.trim() || form.phone.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>Add someone to your list without logging a job.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            if (existingId) {
              setError("This person is already on your customer list.");
              return;
            }
            save.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              required
              value={form.name}
              onChange={(e) => {
                setExistingId(null);
                setForm({ ...form, name: e.target.value });
              }}
            />
            <CustomerMatchHint
              matches={matches}
              usingExisting={Boolean(existingId)}
              onUse={(c) => {
                setExistingId(c.id);
                setEmailError(null);
                setForm({ name: c.name, email: c.email ?? "", phone: c.phone ?? "" });
              }}
              onClear={() => setExistingId(null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              aria-invalid={emailError ? true : undefined}
              value={form.email}
              onChange={(e) => {
                setEmailError(null);
                setExistingId(null);
                setForm({ ...form, email: e.target.value });
              }}
            />
            {emailError ? <p className="text-xs text-destructive">{emailError}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-phone">Phone</Label>
            <Input
              id="c-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending || !canSave || Boolean(existingId)}>
              {save.isPending ? "Saving…" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
