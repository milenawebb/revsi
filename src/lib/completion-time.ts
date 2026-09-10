const pad = (n: number) => String(n).padStart(2, "0");

/** Format a Date as a value for <input type="datetime-local"> in local time. */
export function toLocalInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

/** Parse a datetime-local value as a local Date. Returns null when invalid/empty. */
export function fromLocalInput(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function nowLocalInput() {
  return toLocalInput(new Date());
}

/** Line explaining when the request will send for a chosen completion time. */
export function sendTimeLine(completedAt: Date, delayMinutes: number) {
  const sendAt = completedAt.getTime() + delayMinutes * 60_000;
  if (sendAt <= Date.now()) {
    return "The request will send at the next check, within 15 minutes.";
  }
  return `The request sends ${delayMinutes} minutes after this time.`;
}

export const FUTURE_ERROR =
  "A job can't be completed in the future. Choose \u201cNot completed yet\u201d instead.";

export const FUTURE_ERROR_SHORT = "A job can't be completed in the future. Choose an earlier time.";
