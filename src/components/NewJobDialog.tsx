import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronsUpDown, UserPlus } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCanAsk } from "@/lib/can-ask";
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

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
      setSearch("");
    }
    setCompletedNow(true);
  }, [open, presetCustomer]);

  const { data: matches = [] } = useQuery({
    queryKey: ["customer-search", business.id, search],
    enabled: open && !locked,
    queryFn: async () => {
      let q = supabase
        .from("customers")
        .select("id, name, email, phone")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (search.trim()) q = q.or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const readOnlyContact = Boolean(selectedId);
  const { data: canAsk } = useCanAsk(selectedId, open);
  const blockedReason = canAsk && !canAsk.allowed ? canAsk.reason : null;
  const [emailError, setEmailError] = useState<string | null>(null);

  const typed = search.trim();
  const exactMatch = matches.some(
    (c) =>
      c.name.trim().toLowerCase() === typed.toLowerCase() ||
      (c.email ?? "").trim().toLowerCase() === typed.toLowerCase(),
  );

  const canSave = selectedId
    ? true
    : Boolean(form.name.trim()) && Boolean(form.email.trim() || form.phone.trim());

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
            <div className="flex items-center justify-between">
              <Label>Customer</Label>
              {selectedId && !locked ? (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    setSelectedId(null);
                    setForm({ ...form, name: "", email: "", phone: "" });
                    setSearch("");
                    setEmailError(null);
                  }}
                >
                  Change
                </button>
              ) : null}
            </div>
            {locked ? (
              <Input value={form.name} readOnly className="bg-muted/50" />
            ) : (
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    <span className={cn(!form.name && "text-muted-foreground")}>
                      {form.name || "Search customers…"}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by name or email…"
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Type a name to create a new customer.</CommandEmpty>
                      <CommandGroup>
                        {matches.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.id}
                            onSelect={() => {
                              setSelectedId(c.id);
                              setForm({
                                ...form,
                                name: c.name,
                                email: c.email ?? "",
                                phone: c.phone ?? "",
                              });
                              setPickerOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                selectedId === c.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <span className="truncate">
                              {c.name}
                              {c.email ? (
                                <span className="text-muted-foreground"> · {c.email}</span>
                              ) : null}
                            </span>
                          </CommandItem>
                        ))}
                        {search.trim() ? (
                          <CommandItem
                            value="__create"
                            onSelect={() => {
                              setSelectedId(null);
                              setForm({ ...form, name: search.trim() });
                              setPickerOpen(false);
                            }}
                          >
                            <UserPlus className="mr-2 size-4" />
                            Create new customer: {search.trim()}
                          </CommandItem>
                        ) : null}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                readOnly={readOnlyContact}
                className={cn(readOnlyContact && "bg-muted/50")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                readOnly={readOnlyContact}
                className={cn(readOnlyContact && "bg-muted/50")}
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
            <Button type="submit" disabled={save.isPending || !form.name.trim()}>
              {save.isPending ? "Saving…" : "Save job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
