import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/lib/business-context";
import { Button } from "@/components/ui/button";
import { AddReviewDialog } from "@/components/AddReviewDialog";
import { ReviewCardDialog, type ReviewRow } from "@/components/ReviewCardDialog";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews · Review Requests" },
      {
        name: "description",
        content: "Turn the reviews you have earned into shareable graphics.",
      },
      { property: "og:title", content: "Reviews · Review Requests" },
      {
        property: "og:description",
        content: "Turn the reviews you have earned into shareable graphics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const business = useBusiness();
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<ReviewRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", business.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, reviewer_name, reviewer_city, rating, body, reviewed_at, source_url")
        .eq("business_id", business.id)
        .order("reviewed_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as ReviewRow[];
    },
  });

  const reviews = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn a review into a graphic you can post.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add review
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            No reviews yet. Add one by hand for now. Once your Google Business Profile is connected,
            they will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          {reviews.map((review, i) => (
            <div
              key={review.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(review)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(review);
                }
              }}
              className={cn(
                "flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                i > 0 && "border-t",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{review.reviewer_name}</span>
                  {review.rating ? (
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, s) => (
                        <Star key={s} className="size-3.5 fill-primary text-primary" />
                      ))}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {review.body.split("\n")[0]}
                </p>
              </div>
              {review.source_url ? (
                <a
                  href={review.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  View on Google
                </a>
              ) : null}
              <span className="text-xs text-muted-foreground">
                {formatDate(review.reviewed_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      <AddReviewDialog open={addOpen} onOpenChange={setAddOpen} />
      <ReviewCardDialog review={selected} onOpenChange={(v) => !v && setSelected(null)} />
    </div>
  );
}
