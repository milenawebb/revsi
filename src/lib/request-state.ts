import { formatDateTime } from "@/lib/format";

export type RequestSummary = {
  service_id?: string;
  status: string;
  send_after: string;
  sent_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
};

export function truncate(value: string, max = 70) {
  if (value.length <= max) return value;
  return value.slice(0, max) + "…";
}

export function requestBadge(req?: RequestSummary) {
  if (!req) return { variant: "notAsked" as const, label: "Not asked yet" as const };
  if (req.clicked_at) {
    return {
      variant: "clicked" as const,
      label: "Clicked" as const,
      subtext: `Clicked ${formatDateTime(req.clicked_at)}`,
    };
  }
  switch (req.status) {
    case "queued":
      return {
        variant: "scheduled" as const,
        label: "Scheduled" as const,
        subtext: `Sends ${formatDateTime(req.send_after)}`,
      };
    case "sending":
    case "sent":
      return {
        variant: "requestSent" as const,
        label: "Sent" as const,
        subtext: `Sent ${formatDateTime(req.sent_at)}`,
      };
    case "delivered":
      return {
        variant: "delivered" as const,
        label: "Delivered" as const,
        subtext: `Delivered ${formatDateTime(req.sent_at)}`,
      };
    case "bounced":
      return {
        variant: "bounced" as const,
        label: "Bounced" as const,
        subtext: "Email did not reach them",
      };
    case "failed":
      return {
        variant: "requestFailed" as const,
        label: "Failed" as const,
        subtext: req.error_message ? truncate(req.error_message) : undefined,
      };
    case "cancelled":
      return {
        variant: "requestCancelled" as const,
        label: "Cancelled" as const,
        subtext: "Unsubscribed or cancelled",
      };
    default:
      return { variant: "notAsked" as const, label: "Not asked yet" as const };
  }
}
