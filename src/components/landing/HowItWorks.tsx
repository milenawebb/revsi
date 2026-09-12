import { usePrefersReducedMotion, useInView } from "./motion";

const STEPS = [
  "Mark the job complete",
  "We wait an hour, so it lands while you are still fresh in their mind",
  "They get a short, personal email with one button",
  "One polite reminder if they do not act, and nothing more",
  "Your first 20 requests are free, so you can see whether it works before paying anything",
];

export function HowItWorks() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLOListElement>();
  const show = reduced || inView;

  const step = 700 / STEPS.length;

  return (
    <ol ref={ref} className="relative mt-10 space-y-5 pl-10">
      {/* connecting line, drawn with a transform only */}
      <span
        aria-hidden
        className="absolute left-4 top-2 w-px origin-top bg-border transition-transform duration-700 ease-out"
        style={{ bottom: "0.5rem", transform: `scaleY(${show ? 1 : 0})` }}
      />
      {STEPS.map((text, i) => (
        <li
          key={text}
          className="relative rounded-xl border bg-card p-5 shadow-card transition-[opacity,transform] duration-500 ease-out will-change-transform"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translate3d(0,0,0)" : "translate3d(0,16px,0)",
            transitionDelay: show && !reduced ? `${i * step}ms` : undefined,
          }}
        >
          <span
            className="absolute -left-10 top-4 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform duration-300 ease-out"
            style={{
              transform: show || reduced ? "scale(1)" : "scale(0.8)",
              transitionDelay: show && !reduced ? `${i * step}ms` : undefined,
            }}
          >
            {i + 1}
          </span>
          <p className="text-base leading-relaxed text-foreground">{text}</p>
        </li>
      ))}
    </ol>
  );
}
