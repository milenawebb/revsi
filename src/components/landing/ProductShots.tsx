import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { EmailPreview } from "@/components/EmailPreview";
import { cn } from "@/lib/utils";

/** Light browser chrome around a product view. */
export function BrowserFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-card shadow-[0_24px_60px_-24px_rgb(20_20_27/0.25)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/60 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#f0a5a5]" aria-hidden />
        <span className="size-2.5 rounded-full bg-[#f2d08a]" aria-hidden />
        <span className="size-2.5 rounded-full bg-[#a9d8b0]" aria-hidden />
      </div>
      <div className="bg-background p-4 sm:p-5">{children}</div>
    </div>
  );
}

/** Small white card overlapping the frame edge. */
export function FloatingChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card px-4 py-3 shadow-[0_18px_40px_-16px_rgb(20_20_27/0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const STAT_CARDS = [
  { label: "Jobs completed", value: "38" },
  { label: "Requests sent", value: "36" },
  { label: "Requests clicked", value: "19" },
  { label: "Click rate", value: "53%" },
];

const JOB_ROWS: {
  name: string;
  email: string;
  service: string;
  label: string;
  variant: "queued" | "requestSent" | "delivered" | "clicked";
  date: string;
}[] = [
  {
    name: "Sarah Whitlock",
    email: "sarah.whitlock@gmail.com",
    service: "Loan signing",
    label: "Delivered",
    variant: "delivered",
    date: "9 Sep 2026",
  },
  {
    name: "Dana Reyes",
    email: "dana@reyestitle.com",
    service: "Mobile notary",
    label: "Clicked",
    variant: "clicked",
    date: "8 Sep 2026",
  },
  {
    name: "Marcus Hale",
    email: "m.hale@outlook.com",
    service: "Refinance",
    label: "Queued",
    variant: "queued",
    date: "8 Sep 2026",
  },
];

export function JobsShot() {
  return (
    <BrowserFrame>
      <div className="space-y-4">
        <div>
          <p className="text-lg font-bold tracking-tight">Jobs</p>
          <p className="text-xs text-muted-foreground">Last 30 days at a glance.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STAT_CARDS.map((c) => (
            <div
              key={c.label}
              className="relative overflow-hidden rounded-xl border bg-card p-3 shadow-card"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-gradient" />
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-lg font-semibold tracking-tight">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-card">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr] gap-3 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Customer</span>
            <span>Service</span>
            <span>Request</span>
            <span className="text-right">Job date</span>
          </div>
          {JOB_ROWS.map((r) => (
            <div
              key={r.name}
              className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr] items-center gap-3 border-t border-border/60 px-4 py-3 text-xs"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{r.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{r.email}</p>
              </div>
              <span className="truncate text-muted-foreground">{r.service}</span>
              <span>
                <Badge variant={r.variant} className="text-[10px]">
                  {r.label}
                </Badge>
              </span>
              <span className="text-right text-muted-foreground">{r.date}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

const REQUEST_ROWS: {
  name: string;
  kind: string;
  status: string;
  variant: "queued" | "sent" | "clicked" | "cancelled";
  sendAfter: string;
  sent: string;
  clicked: string;
}[] = [
  {
    name: "Sarah Whitlock",
    kind: "Initial",
    status: "Sent",
    variant: "sent",
    sendAfter: "9 Sep, 9:30 AM",
    sent: "9 Sep, 9:31 AM",
    clicked: "No",
  },
  {
    name: "Dana Reyes",
    kind: "Initial",
    status: "Clicked",
    variant: "clicked",
    sendAfter: "8 Sep, 2:15 PM",
    sent: "8 Sep, 2:16 PM",
    clicked: "Yes (2)",
  },
  {
    name: "Dana Reyes",
    kind: "Reminder",
    status: "Cancelled",
    variant: "cancelled",
    sendAfter: "11 Sep, 2:15 PM",
    sent: "—",
    clicked: "No",
  },
  {
    name: "Marcus Hale",
    kind: "Initial",
    status: "Queued",
    variant: "queued",
    sendAfter: "10 Sep, 8:00 AM",
    sent: "—",
    clicked: "No",
  },
];

export function RequestsShot() {
  return (
    <BrowserFrame>
      <div className="space-y-4">
        <div>
          <p className="text-lg font-bold tracking-tight">Requests</p>
          <p className="text-xs text-muted-foreground">
            Created automatically when a job is completed.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-card">
          <div className="grid grid-cols-[1.2fr_0.7fr_0.8fr_1fr_0.6fr] gap-3 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Customer</span>
            <span>Kind</span>
            <span>Status</span>
            <span>Sent</span>
            <span>Clicked</span>
          </div>
          {REQUEST_ROWS.map((r) => (
            <div
              key={`${r.name}-${r.kind}-${r.status}`}
              className="grid grid-cols-[1.2fr_0.7fr_0.8fr_1fr_0.6fr] items-center gap-3 border-t border-border/60 px-4 py-3 text-xs"
            >
              <span className="truncate font-medium">{r.name}</span>
              <span className="text-muted-foreground">{r.kind}</span>
              <span>
                <Badge variant={r.variant} className="text-[10px]">
                  {r.status}
                </Badge>
              </span>
              <span className="truncate text-muted-foreground">{r.sent}</span>
              <span className="text-muted-foreground">{r.clicked}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

export function SettingsShot() {
  return (
    <BrowserFrame>
      <div className="space-y-4">
        <div>
          <p className="text-lg font-bold tracking-tight">Settings</p>
          <p className="text-xs text-muted-foreground">Email style and message.</p>
        </div>
        <div className="[&_p]:text-xs">
          <EmailPreview
            template="personal"
            businessName="Riverbend Notary"
            fromName="Riverbend Notary"
            replyToEmail={null}
            customIntro=""
            customBody=""
            senderPhotoUrl={null}
            postalAddress="118 Mill Street, Richmond, VA"
            logoUrl={null}
            buttonColor="#7C3AED"
          />
        </div>
      </div>
    </BrowserFrame>
  );
}

/**
 * Photography.
 *
 * Note on sourcing: Unsplash blocks downloads from this build environment, so
 * these photographs were generated to the agreed constraints instead of being
 * pulled from Unsplash. No licence or attribution is required for them — they
 * are project-owned files under src/assets/landing/.
 *   - signing-table.jpg  hands only, no faces, no logos
 *   - car-seat.jpg       no plates, street signs or house numbers
 *   - stamp-seal.jpg     no people, no branding
 */
export function PhotoFrame({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-[0_24px_60px_-24px_rgb(20_20_27/0.3)]",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={1280}
        height={960}
        className="h-full w-full object-cover"
      />
      {/* keeps the photography sitting with the brand rather than fighting it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-brand-purple/10 mix-blend-multiply"
      />
    </div>
  );
}
