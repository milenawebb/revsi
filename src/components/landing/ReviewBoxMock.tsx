import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { usePrefersReducedMotion, useInView } from "./motion";

const REVIEW =
  "Anna came out on a Sunday and walked us through every page. Straightforward and patient.";

export function ReviewBoxMock() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const active = inView && !reduced;
  const [chars, setChars] = useState(0);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    if (reduced) {
      setChars(REVIEW.length);
      setStars(5);
      return;
    }
    if (!active) return;
    let i = 0;
    let timer = window.setTimeout(function tick() {
      i += 1;
      setChars(i);
      if (i < REVIEW.length) {
        timer = window.setTimeout(tick, 22);
      } else {
        let s = 0;
        timer = window.setTimeout(function starTick() {
          s += 1;
          setStars(s);
          if (s < 5) timer = window.setTimeout(starTick, 160);
        }, 320);
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [active, reduced]);

  return (
    <div ref={ref} className="rounded-xl border bg-background p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          SK
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">Sarah K.</p>
          <p className="text-xs text-muted-foreground">Writing a review</p>
        </div>
      </div>

      <div className="mt-4 flex gap-1" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={
              "size-5 " +
              (i < stars
                ? "fill-pink text-pink " + (reduced ? "" : "animate-star-pop")
                : "text-border")
            }
          />
        ))}
      </div>

      <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-foreground">
        <span aria-hidden className="whitespace-pre-wrap">
          {REVIEW.slice(0, chars)}
        </span>
        {chars < REVIEW.length && !reduced ? (
          <span aria-hidden className="animate-caret ml-px inline-block w-px align-middle">
            |
          </span>
        ) : null}
        <span className="sr-only">{REVIEW}</span>
      </p>
    </div>
  );
}
