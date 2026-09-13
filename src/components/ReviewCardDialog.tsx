import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Check, Download, Star } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
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
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (review) {
      setFormat("square");
      setStyle("bold");
    }
  }, [review]);

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
              </div>

              <Button onClick={download} disabled={busy} className="gap-2">
                <Download className="size-4" />
                {busy ? "Preparing…" : "Download image"}
              </Button>
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
  const fontSize = bodySize(review.body.length);
  const pad = 72;
  const light = "#FAFAFE";

  const header = (
    <div
      style={{
        display: "flex",
        justifyContent: style === "bold" ? "center" : style === "split" ? "center" : "flex-end",
        alignItems: "center",
        minHeight: 96,
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          crossOrigin="anonymous"
          style={{ height: 72, width: "auto", objectFit: "contain" }}
        />
      ) : (
        <span
          style={{
            fontSize: 40,
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
        borderRadius: 40,
        border: style === "light" ? "1px solid #E8E8EF" : "none",
        padding: 72,
        boxShadow: style === "light" ? "none" : "0 24px 60px rgba(0,0,0,0.14)",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -30,
          left: 28,
          fontSize: 260,
          lineHeight: 1,
          fontFamily: "Georgia, serif",
          color: color,
          opacity: 0.12,
        }}
      >
        &ldquo;
      </span>
      <div style={{ position: "relative" }}>
        {review.rating ? (
          <div style={{ marginBottom: 32 }}>
            <Stars rating={review.rating} color={color} size={44} />
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
        <div style={{ marginTop: 44 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a" }}>
            {displayName(review.reviewer_name)}
          </div>
          {review.reviewer_city ? (
            <div style={{ fontSize: 24, color: "#6b7280", marginTop: 6 }}>
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
        fontSize: 24,
        color: style === "bold" ? "rgba(255,255,255,0.85)" : color,
      }}
    >
      <Check style={{ width: 26, height: 26 }} />
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
            height: Math.round(height / 3),
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: pad,
          }}
        >
          {header}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: pad,
            marginTop: -120,
          }}
        >
          {card}
          <div style={{ marginTop: 48 }}>{footer}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        background: style === "bold" ? color : light,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: pad,
        overflow: "hidden",
      }}
    >
      {header}
      <div style={{ paddingTop: 40, paddingBottom: 40 }}>{card}</div>
      {footer}
    </div>
  );
}
