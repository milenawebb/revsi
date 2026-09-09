import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

const empty = {
  name: "",
  from_name: "",
  review_url: "",
  reply_to_email: "",
  postal_address: "",
};

export function AddBusinessDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [urlError, setUrlError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("You need to be signed in.");

      const { data, error } = await supabase
        .from("businesses")
        .insert({
          owner_id: auth.user.id,
          name: form.name.trim(),
          from_name: form.from_name.trim(),
          review_url: form.review_url.trim(),
          reply_to_email: form.reply_to_email.trim() || null,
          postal_address: form.postal_address.trim() || null,
          request_delay_minutes: 60,
          reminder_enabled: true,
          reminder_delay_days: 3,
          is_active: true,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: async (id) => {
      toast.success("Business added");
      setForm(empty);
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      onCreated(id);
    },
    onError: (e: Error) => toast.error("Couldn't add business", { description: e.message }),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = new URL(form.review_url.trim());
      if (!url.protocol.startsWith("http")) throw new Error();
    } catch {
      setUrlError("Enter a valid URL starting with https://");
      return;
    }
    setUrlError(null);
    save.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add business</DialogTitle>
          <DialogDescription>Each business has its own jobs and review requests.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4 text-left" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="biz_name">Business name</Label>
            <Input
              id="biz_name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz_from_name">From name</Label>
            <Input
              id="biz_from_name"
              required
              value={form.from_name}
              onChange={(e) => setForm({ ...form, from_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz_review_url">Review link</Label>
            <Input
              id="biz_review_url"
              required
              value={form.review_url}
              onChange={(e) => setForm({ ...form, review_url: e.target.value })}
            />
            {urlError ? <p className="text-sm text-destructive">{urlError}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz_reply_to">Reply-to email</Label>
            <Input
              id="biz_reply_to"
              type="email"
              value={form.reply_to_email}
              onChange={(e) => setForm({ ...form, reply_to_email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz_address">Postal address</Label>
            <Textarea
              id="biz_address"
              rows={2}
              value={form.postal_address}
              onChange={(e) => setForm({ ...form, postal_address: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Add business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
