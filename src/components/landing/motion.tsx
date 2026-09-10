import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Fires once when the element scrolls into view. */
export function useInView<T extends HTMLElement>(rootMargin = "-10% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

/** Simple fade-up on scroll. Content is always in the DOM. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "h2" | "li" | "p";
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const show = reduced || inView;

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out will-change-transform",
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
      style={show && !reduced ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
