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

export function statusTone(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "failed" || status === "bounced") return "destructive";
  if (status === "sent" || status === "completed") return "default";
  if (status === "cancelled") return "outline";
  return "secondary";
}
