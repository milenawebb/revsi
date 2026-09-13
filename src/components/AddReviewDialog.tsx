import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";
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
import { cn } from "@/lib/utils";

const MAX_BODY = 1500;

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AddReviewDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const business = useBusiness();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [date, setDate] = useState(today());

  useEffect(() => {
    if (!open) return;
    setFirstName("");
    setLastInitial("");
    setCity("");
    setRating(null);
    setBody("");
    setDate(today());
  }, [open]);

  const composedName = lastInitial
    ? `${firstName.trim()} ${lastInitial}.`
    : firstName.trim();

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        business_id: business.id,
        reviewer_name: composedName,
        reviewer_city: city.trim() || null,
        rating,
        body: body.trim(),
        reviewed_at: new Date(`${date}T12:00:00`).toISOString(),
        source: "manual",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review added");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["reviews", business.id] });
    },
    onError: (e: { message: string }) => {
      toast.error("Couldn't add review", { description: e.message });
    },
  });

  const canSave = Boolean(name.trim()) && Boolean(body.trim()) && body.length <= MAX_BODY;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add review</DialogTitle>
          <DialogDescription>
            Enter a review you have received so you can turn it into a shareable graphic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="review-name">Reviewer name</Label>
            <Input
              id="review-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Mitchell"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="review-city">City</Label>
              <Input
                id="review-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Charlottesville, VA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-date">Date left</Label>
              <Input
                id="review-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(rating === n ? null : n)}
                >
                  <Star
                    className={cn(
                      "size-6 transition-colors",
                      rating && n <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
              {rating ? (
                <button
                  type="button"
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setRating(null)}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-body">Review</Label>
            <Textarea
              id="review-body"
              rows={6}
              maxLength={MAX_BODY}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did they say?"
            />
            <p className="text-xs text-muted-foreground">
              {body.length} of {MAX_BODY} characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSave || save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : "Save review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
