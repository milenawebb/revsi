import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        queued: "border-transparent bg-status-queued text-status-queued-foreground",
        sent: "border-transparent bg-status-sent text-status-sent-foreground",
        clicked: "border-transparent bg-status-clicked text-status-clicked-foreground",
        failed: "border-transparent bg-status-failed text-status-failed-foreground",
        cancelled: "border-transparent bg-status-cancelled text-status-cancelled-foreground",
        notAsked: "border-transparent bg-status-not-asked text-status-not-asked-foreground",
        scheduled: "border-transparent bg-status-scheduled text-status-scheduled-foreground",
        requestSent: "border-transparent bg-status-request-sent text-status-request-sent-foreground",
        delivered: "border-transparent bg-status-delivered text-status-delivered-foreground",
        bounced: "border-transparent bg-status-bounced text-status-bounced-foreground",
        requestFailed: "border-transparent bg-status-failed text-status-failed-foreground",
        requestCancelled: "border-transparent bg-status-cancelled text-status-cancelled-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
