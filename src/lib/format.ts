export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function statusTone(
  status: string,
): "queued" | "sent" | "clicked" | "failed" | "cancelled" {
  if (status === "failed" || status === "bounced") return "failed";
  if (status === "sent" || status === "completed") return "sent";
  if (status === "clicked") return "clicked";
  if (status === "cancelled") return "cancelled";
  return "queued";
}
