export function formatDateTime(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** e.g. 12 September 2026 */
export function formatLongDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

/** e.g. $15.00 */
export function formatMoney(cents: number | null | undefined, currency: string | null | undefined) {
  if (cents == null) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "usd").toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)}`;
  }
}
