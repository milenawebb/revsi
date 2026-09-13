import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Check, Copy, Download, Loader2, Sparkles, Star } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ReviewRow = {
  id: string;
  reviewer_name: string;
  reviewer_city: string | null;
  rating: number | null;
  body: string;
  reviewed_at: string;
  source_url?: string | null;
};

type Format = "square" | "story";
type Style = "bold" | "light" | "split";

const FORMATS: { id: Format; label: string; w: number; h: number }[] = [
  { id: "square", label: "Square 1080 x 1080", w: 1080, h: 1080 },
  { id: "story", label: "Story 1080 x 1920", w: 1080, h: 1920 },
];

const STYLES: { id: Style; label: string }[] = [
  { id: "bold", label: "Bold" },
  { id: "light", label: "Light" },
  { id: "split", label: "Split" },
];

function bodySize(len: number) {
  if (len < 80) return 48;
  if (len <= 200) return 38;
  if (len <= 400) return 30;
  return 24;
}

/** "Sarah Mitchell" becomes "Sarah M." Never shows a full surname. */
export function displayName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]!;
  const rest = parts.slice(1).filter((p) => /[a-z0-9]/i.test(p));
  const last = rest[rest.length - 1];
  return last ? `${first} ${last[0]!.toUpperCase()}.` : first;
}

/**
 * Single source of truth for the "Verified Google review" badge.
 * Today a review counts as verified when a Google link is attached.
 * Extend here when Google Business Profile sourced reviews arrive.
 */
export function isVerifiedReview(review: Pick<ReviewRow, "source_url">) {
  return Boolean(review.source_url && review.source_url.trim());
}

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "review";
}

export function ReviewCardDialog({
  review,
  onOpenChange,
}: {
  review: ReviewRow | null;
  onOpenChange: (v: boolean) => void;
}) {
  const business = useBusiness();
  const [format, setFormat] = useState<Format>("square");
  const [style, setStyle] = useState<Style>("bold");
  const [busy, setBusy] = useState(false);
  const [captions, setCaptions] = useState<string[]>([]);
  const [captionBusy, setCaptionBusy] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (review) {
      setFormat("square");
      setStyle("bold");
      setCaptions([]);
      setCaptionBusy(false);
      setCaptionError(null);
      setSelected(null);
    }
  }, [review]);

  async function writeCaption() {
    if (!review) return;
    setCaptionBusy(true);
    setCaptionError(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: { review_id: review.id },
      });
      if (error) throw error;
      const raw = (data as { captions?: unknown })?.captions ?? data;
      const list = Array.isArray(raw) ? raw.filter((c): c is string => typeof c === "string") : [];
      if (list.length === 0) throw new Error("No captions were returned.");
      setCaptions(list);
      setSelected(0);
    } catch (e) {
      setCaptions([]);
      setSelected(null);
      setCaptionError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setCaptionBusy(false);
    }
  }

  async function copyCaption(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Caption copied.");
    } catch {
      toast.error("Couldn't copy the caption.");
    }
  }

  const spec = FORMATS.find((f) => f.id === format)!;
  const previewW = format === "square" ? 340 : 260;
  const scale = previewW / spec.w;

  async function download() {
    if (!cardRef.current || !review) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: spec.w,
        height: spec.h,
        pixelRatio: 1,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${safeFileName(business.name)}-review-${safeFileName(review.reviewer_name)}-${format}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      toast.error("Couldn't create the image", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={Boolean(review)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Share this review</DialogTitle>
          <DialogDescription>
            Pick a format and style, then download the image to post it.
          </DialogDescription>
        </DialogHeader>

        {review ? (
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="flex justify-center">
              <div
                className="overflow-hidden rounded-lg border bg-muted"
                style={{ width: previewW, height: spec.h * scale }}
              >
                <div
                  style={{
                    width: spec.w,
                    height: spec.h,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <ReviewCard
                    ref={cardRef}
                    review={review}
                    style={style}
                    width={spec.w}
                    height={spec.h}
                    color={business.button_color || "#4F6EF7"}
                    logoUrl={business.logo_url}
                    businessName={business.name}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Format</Label>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => (
                    <Button
                      key={f.id}
                      type="button"
                      size="sm"
                      variant={format === f.id ? "default" : "outline"}
                      onClick={() => setFormat(f.id)}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Style</Label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <Button
                      key={s.id}
                      type="button"
                      size="sm"
                      variant={style === s.id ? "default" : "outline"}
                      onClick={() => setStyle(s.id)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
                {isVerifiedReview(review) ? null : (
                  <p className="text-xs text-muted-foreground">
                    No Google link on this review, so the verified badge is hidden. Add the
                    link from the review list to show it.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Button onClick={download} disabled={busy} className="gap-2">
                  <Download className="size-4" />
                  {busy ? "Preparing…" : "Download image"}
                </Button>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={writeCaption}
                    disabled={captionBusy}
                    className="gap-2"
                  >
                    {captionBusy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {captionBusy
                      ? "Writing…"
                      : captions.length > 0
                        ? "Write new captions"
                        : "Write a caption"}
                  </Button>

                  {captionError ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                      <p className="text-destructive">
                        Couldn't write a caption. {captionError}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={writeCaption}
                        disabled={captionBusy}
                      >
                        Try again
                      </Button>
                    </div>
                  ) : null}

                  {captions.length > 0 ? (
                    <div className="space-y-2">
                      {captions.map((c, i) => (
                        <div
                          key={i}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelected(i)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelected(i);
                            }
                          }}
                          className={cn(
                            "cursor-pointer rounded-lg border p-3 text-sm transition-colors",
                            selected === i
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted",
                          )}
                        >
                          <p className="whitespace-pre-wrap">{c}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="mt-2 gap-2 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              void copyCaption(c);
                            }}
                          >
                            <Copy className="size-3.5" />
                            Copy
                          </Button>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Written by AI from the review. Check it before you post.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

const GOLD = "#F5A524";

function Stars({ rating, size }: { rating: number; size: number }) {
  return (
    <div style={{ display: "flex", gap: size * 0.34 }}>
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} style={{ width: size, height: size, color: GOLD, fill: GOLD }} />
      ))}
    </div>
  );
}

/** Low opacity angled bars that add texture to a coloured background. */
function Texture({ width, height }: { width: number; height: number }) {
  const bar = (extra: React.CSSProperties) => ({
    position: "absolute" as const,
    background: "#ffffff",
    opacity: 0.08,
    ...extra,
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={bar({
          top: -height * 0.14,
          left: -width * 0.22,
          width: width * 0.34,
          height: height * 0.5,
          transform: "rotate(28deg)",
          borderRadius: 24,
        })}
      />
      <div
        style={bar({
          top: -height * 0.1,
          left: -width * 0.04,
          width: width * 0.14,
          height: height * 0.4,
          transform: "rotate(28deg)",
          borderRadius: 24,
        })}
      />
      <div
        style={bar({
          bottom: -height * 0.16,
          right: -width * 0.18,
          width: width * 0.4,
          height: height * 0.42,
          transform: "rotate(28deg)",
          borderRadius: 24,
        })}
      />
    </div>
  );
}

function ReviewCard({
  ref,
  review,
  style,
  width,
  height,
  color,
  logoUrl,
  businessName,
}: {
  ref: React.Ref<HTMLDivElement>;
  review: ReviewRow;
  style: Style;
  width: number;
  height: number;
  color: string;
  logoUrl: string | null;
  businessName: string;
}) {
  const isStory = height > width;
  const s = isStory ? 1.4 : 1;
  const fontSize = Math.round(bodySize(review.body.length) * s);
  const pad = Math.round(72 * (isStory ? 1.1 : 1));
  const light = "#FAFAFE";
  const verified = isVerifiedReview(review);
  const padBottom = verified ? pad : Math.round(pad * 0.7);
  const quoteSize = Math.round(150 * s);

  const quote = (which: "open" | "close") => (
    <span
      style={{
        position: "absolute",
        ...(which === "open"
          ? { top: Math.round(-quoteSize * 0.34), left: Math.round(pad * 0.35) }
          : {
              bottom: Math.round(-quoteSize * 0.62),
              right: Math.round(pad * 0.35),
              transform: "rotate(180deg)",
            }),
        fontSize: quoteSize,
        lineHeight: 1,
        fontFamily: "Georgia, serif",
        color,
        opacity: 0.15,
      }}
    >
      &ldquo;
    </span>
  );

  const header = (
    <div
      style={{
        display: "flex",
        justifyContent: style === "light" ? "flex-end" : "center",
        alignItems: "center",
        minHeight: Math.round(96 * s),
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          crossOrigin="anonymous"
          style={{ height: Math.round(72 * s), width: "auto", objectFit: "contain" }}
        />
      ) : (
        <span
          style={{
            fontSize: Math.round(40 * s),
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: style === "light" ? "#1a1a1a" : "#ffffff",
          }}
        >
          {businessName}
        </span>
      )}
    </div>
  );

  const card = (
    <div
      style={{
        position: "relative",
        background: "#ffffff",
        borderRadius: 24,
        border: style === "light" ? "1px solid #E8E8EF" : "none",
        padding: Math.round(96 * s),
        boxShadow: style === "light" ? "none" : "0 40px 110px rgba(0,0,0,0.16)",
        overflow: "hidden",
      }}
    >
      {quote("open")}
      {quote("close")}
      <div style={{ position: "relative" }}>
        {review.rating ? (
          <div style={{ marginBottom: Math.round(40 * s) }}>
            <Stars rating={review.rating} size={Math.round(56 * s)} />
          </div>
        ) : null}
        <p
          style={{
            fontSize,
            lineHeight: 1.45,
            color: "#1a1a1a",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {review.body}
        </p>
        <div style={{ marginTop: Math.round(52 * s) }}>
          <div style={{ fontSize: Math.round(42 * s), fontWeight: 700, color: "#1a1a1a" }}>
            {displayName(review.reviewer_name)}
          </div>
          {review.reviewer_city ? (
            <div style={{ fontSize: Math.round(28 * s), color, marginTop: 8 }}>
              {review.reviewer_city}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const footer = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: Math.round(24 * s),
        color: style === "bold" ? "rgba(255,255,255,0.85)" : color,
      }}
    >
      <Check style={{ width: Math.round(26 * s), height: Math.round(26 * s) }} />
      <span>Verified Google review</span>
    </div>
  );

  if (style === "split") {
    return (
      <div
        ref={ref}
        style={{
          width,
          height,
          background: light,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            height: Math.round(height / 3),
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: pad,
            overflow: "hidden",
          }}
        >
          <Texture width={width} height={Math.round(height / 3)} />
          <div style={{ position: "relative" }}>{header}</div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: verified ? "space-between" : "center",
            padding: pad,
            paddingBottom: padBottom,
            marginTop: Math.round(-140 * s),
          }}
        >
          {card}
          {verified ? <div style={{ marginTop: Math.round(48 * s) }}>{footer}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width,
        height,
        background: style === "bold" ? color : light,
        display: "flex",
        flexDirection: "column",
        padding: pad,
        paddingBottom: padBottom,
        overflow: "hidden",
      }}
    >
      {style === "bold" ? <Texture width={width} height={height} /> : null}
      <div
        style={{
          position: "relative",
          height: `${isStory ? 20 : 18}%`,
          display: "flex",
          alignItems: "center",
          justifyContent: style === "light" ? "flex-end" : "center",
        }}
      >
        {header}
      </div>
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {card}
      </div>
      {verified ? (
        <div
          style={{
            position: "relative",
            height: `${isStory ? 10 : 12}%`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}
