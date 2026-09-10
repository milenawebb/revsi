import type { CustomerMatch } from "@/lib/customer-match";

export function CustomerMatchHint({
  matches,
  usingExisting,
  onUse,
  onClear,
}: {
  matches: CustomerMatch[];
  usingExisting: boolean;
  onUse: (c: CustomerMatch) => void;
  onClear: () => void;
}) {
  if (usingExisting) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Using existing customer</span>
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={onClear}
        >
          Not them
        </button>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="space-y-1">
      {matches.map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            {c.name}
            {c.email ? ` (${c.email})` : ""} is already a customer.
          </span>
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => onUse(c)}
          >
            Use them
          </button>
        </div>
      ))}
    </div>
  );
}
