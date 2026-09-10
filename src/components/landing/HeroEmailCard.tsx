import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./motion";

const LINES = [
  "Hi Sarah,",
  "It was good working with you on your loan signing.",
  "If you have a moment, would you share an honest review of how it went? It makes a real difference to a small business like mine.",
];

const SPEED = 14; // ms per character

/** Types the lines in sequence. Full text is always in the DOM for readers. */
function useTypedLines(enabled: boolean) {
  const [counts, setCounts] = useState<number[]>(() => LINES.map(() => 0));
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCounts(LINES.map((l) => l.length));
      setDone(true);
      return;
    }
    let line = 0;
    let char = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      char += 1;
      setCounts((prev) => {
        const next = [...prev];
        next[line] = char;
        return next;
      });
      if (char >= LINES[line]!.length) {
        line += 1;
        char = 0;
        if (line >= LINES.length) {
          setDone(true);
          return;
        }
        timer = window.setTimeout(tick, 280);
        return;
      }
      timer = window.setTimeout(tick, SPEED);
    };

    let timer = window.setTimeout(tick, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);

  return { counts, done };
}

export function HeroEmailCard() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { counts, done } = useTypedLines(mounted && !reduced);

  return (
    <div
      className={
        "rounded-2xl border border-border/60 bg-card p-5 shadow-2xl " +
        (reduced ? "" : "animate-land-in")
      }
    >
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">Dana at Riverbend Notary</p>
        <p className="text-xs text-muted-foreground">Thanks for choosing Riverbend Notary</p>
        <p className="text-xs text-muted-foreground">Reply-to: dana@riverbendnotary.com</p>
      </div>

      <hr className="my-4 border-border" />

      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        DR
      </div>

      <div className="space-y-3">
        {LINES.map((line, i) => (
          <p key={line} className="text-sm text-foreground">
            <span aria-hidden className="whitespace-pre-wrap">
              {line.slice(0, counts[i] ?? line.length)}
            </span>
            <span className="sr-only">{line}</span>
          </p>
        ))}
      </div>

      <div className="mt-5">
        <span
          className={
            "inline-block cursor-default rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-500 " +
            (done ? "opacity-100 " + (reduced ? "" : "animate-pulse-once") : "opacity-0")
          }
        >
          Leave a review
        </span>
      </div>

      <p className="mt-5 text-sm text-foreground">Thanks again,</p>
      <p className="text-sm text-foreground">Dana at Riverbend Notary</p>

      <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
        <div className="mb-3 inline-flex h-[36px] items-center rounded-md border px-3 text-[11px] font-semibold uppercase tracking-widest">
          Riverbend Notary
        </div>
        <p>You received this because you recently used Riverbend Notary.</p>
        <p className="mt-1">104 Main Street, Suite 2, Richmond, VA</p>
        <p className="mt-1">
          <span className="cursor-default text-primary underline">Unsubscribe</span>
        </p>
      </div>
    </div>
  );
}
