import { Button } from "@/components/ui/button";
import { useStartCheckout } from "@/lib/checkout";
import { cn } from "@/lib/utils";

type Props = {
  businessId: string;
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline" | "ghost";
  label?: string;
};

export function AddPaymentButton({
  businessId,
  className,
  size = "default",
  variant = "default",
  label = "Add payment",
}: Props) {
  const { start, loading } = useStartCheckout(businessId);
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      disabled={loading}
      onClick={start}
    >
      {loading ? "Starting…" : label}
    </Button>
  );
}

/** Inline text link version, for use inside prose. */
export function AddPaymentLink({
  businessId,
  className,
  label = "Add payment",
}: Omit<Props, "size" | "variant">) {
  const { start, loading } = useStartCheckout(businessId);
  return (
    <button
      type="button"
      onClick={start}
      disabled={loading}
      className={cn("underline underline-offset-2 disabled:opacity-60", className)}
    >
      {loading ? "Starting…" : label}
    </button>
  );
}
