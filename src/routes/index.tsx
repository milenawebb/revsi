import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { HeroEmailCard } from "@/components/landing/HeroEmailCard";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Reveal, useInView, usePrefersReducedMotion } from "@/components/landing/motion";
import {
  ChipReveal,
  FloatingChip,
  JobsShot,
  NotariesVisual,
  RequestsShot,
} from "@/components/landing/ProductShots";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import ogImage from "@/assets/og-revsi.jpg.asset.json";


const TITLE = "Get Google reviews after every job";
const DESC =
  "Revsi asks your customers for an honest review, on its own, an hour after the job is done.";
const OG_IMAGE = `https://revsi.app${ogImage.url}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://revsi.app/" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: "https://revsi.app/" }],
  }),
  component: LandingPage,
});

function WaitlistButton({
  variant = "default",
  className,
}: {
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  return (
    <Button asChild size="lg" variant={variant} className={className}>
      <Link to="/signup">Start free</Link>
    </Button>
  );
}

const PROBLEMS = [
  "You do great work, then never hear about it again.",
  "Asking in person is awkward, and you forget by the time you are back in the car.",
  "Your competitor with fourteen reviews shows up above you.",
];

const NOTARY_POINTS = [
  "Works for solo notaries and for signing services with a roster",
  "Ask the signer, the title company, or both, and set different rules for each",
  "Never asks the same person twice, and leaves business contacts alone for six months by default",
  "Connects to OpenSked, so a completed order asks automatically",
];

function splitSentences(text: string): [string, string | null] {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length > 1) return [parts[0]!, parts.slice(1).join(" ")];
  return [text, null];
}

function SectionLabel({
  children,
  centered = false,
}: {
  children: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className={cn("flex flex-col", centered ? "items-center" : "items-start")}>
      <span className="h-[2px] w-6 bg-brand-purple" aria-hidden />
      <span
        className={cn(
          "mt-3 text-[13px] font-medium text-muted-foreground",
          centered && "text-center",
        )}
      >
        {children}
      </span>
    </div>
  );
}

/** Text on one side, a product shot with an overlapping chip on the other. */
function AltSection({
  id,
  pill,
  heading,
  children,
  visual,
  chip,
  chipClassName,
  chipRotate = -2,
  reverse = false,
  tint = false,
}: {
  id?: string;
  pill: string;
  heading: string;
  children: ReactNode;
  visual?: ReactNode;
  chip?: ReactNode;
  chipClassName?: string;
  chipRotate?: number;
  reverse?: boolean;
  tint?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-8 py-20 lg:py-28",
        tint ? "landing-wash-alt" : "landing-wash",
      )}
    >
      <div
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-12 px-5",
          visual && "lg:grid-cols-2 lg:gap-16",
        )}
      >
        <Reveal className={cn(reverse && "lg:order-2")}>
          <SectionLabel>{pill}</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">{heading}</h2>
          <div className="mt-6">{children}</div>
        </Reveal>

        {visual ? (
          <div className={cn("relative", reverse && "lg:order-1")}>
            {visual}
            {chip ? (
              <ChipReveal
                rotate={chipRotate}
                className={cn("absolute", chipClassName)}
              >
                {chip}
              </ChipReveal>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProblemPoints() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>("-10% 0px");
  const show = reduced || inView;

  return (
    <div ref={ref} className="grid gap-8">
      {PROBLEMS.map((text, i) => {
        const [first, second] = splitSentences(text);
        const lineDelay = i * 120;
        return (
          <div key={text} className="relative">
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-0.5 origin-top bg-brand-purple",
                show ? "animate-line-draw" : "scale-y-0",
              )}
              style={{ animationDelay: `${lineDelay}ms`, animationDuration: "350ms" }}
            />
            <div
              className={cn("pl-5", show ? "animate-problem-reveal" : "opacity-0")}
              style={{ animationDelay: `${lineDelay + 80}ms` }}
            >
              <p className="text-lg font-light leading-snug text-foreground">
                {first}
                {second ? <span className="text-muted-foreground"> {second}</span> : null}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NotaryPoints() {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLUListElement>();
  const show = reduced || inView;

  return (
    <>
      <ul ref={ref} className="grid gap-6">
        {NOTARY_POINTS.map((point, i) => (
          <li
            key={point}
            className={cn(
              "flex gap-3 text-base text-foreground",
              show ? "animate-problem-reveal" : "opacity-0",
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span
              aria-hidden
              className={cn(
                "mt-2 size-2 shrink-0 rounded-full bg-pink",
                show ? "animate-dot-pop" : "scale-0",
              )}
              style={{ animationDelay: `${i * 100 + 120}ms` }}
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Revsi works the same way for any business with completed jobs: contractors, cleaners,
        salons, mobile detailing, photographers. The notary integration is simply the one that
        exists today.
      </p>
    </>
  );
}

function LandingPage() {


  return (
    <div className="landing-wash min-h-screen">
      {/* Hero on the brand gradient */}
      <div className="bg-brand-gradient text-primary-foreground">
        <SiteHeader variant="gradient" />

        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 lg:grid-cols-2 lg:items-center lg:gap-14 lg:pb-28 lg:pt-16">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Get Google reviews after every job.
            </h1>
            <p className="mt-5 text-lg opacity-90">
              Revsi asks your customers for an honest review, on its own, an hour after the job
              is done. No app to remember, no awkward ask.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <WaitlistButton variant="secondary" />
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/80">
              Every business gets 20 free review requests. No card required.
            </p>
          </div>
          <div className="lg:pl-6">
            <HeroEmailCard />
            <p className="mt-4 text-center text-sm text-white/80">
              Your logo, your colours, your words.
            </p>
          </div>
        </section>
      </div>

      <main>
        <AltSection
          pill="The problem"
          heading="Reviews decide who gets called."
          visual={<JobsShot />}
          chip={
            <FloatingChip>
              <Badge variant="delivered" className="text-[10px]">
                Delivered
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground">Sent 9:30 AM</p>
            </FloatingChip>
          }
          chipClassName="-bottom-6 -left-4 sm:-left-8"
          chipRotate={-2}
        >
          <ProblemPoints />
        </AltSection>

        <AltSection
          id="how-it-works"
          pill="How it works"
          heading="In simple steps"
          reverse
          tint
          visual={<RequestsShot />}
          chip={
            <FloatingChip>
              <Badge variant="clicked" className="text-[10px]">
                Clicked
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground">Reminder cancelled</p>
            </FloatingChip>
          }
          chipClassName="-bottom-6 -right-4 sm:-right-8"
          chipRotate={2}
        >
          <HowItWorks />
        </AltSection>

        <AltSection
          pill="Industries"
          heading="A use case for notaries"
          visual={<NotariesVisual />}
        >
          <NotaryPoints />
        </AltSection>

        <AltSection
          id="compliance"
          pill="Compliance"
          heading="Built to keep you out of trouble."
          reverse
          tint
        >
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              The tool will not let you ask for a five star review, offer anything in return, or
              ask only the customers you think are happy. Google&apos;s review policies and the
              FTC&apos;s Consumer Review Rule prohibit all three, and businesses lose reviews and
              face penalties over exactly these mistakes.
            </p>
            <p>
              Your message is checked before it sends, so a phrase that crosses the line gets
              flagged rather than mailed out. Every recipient gets the same honest ask, in the same
              order, whether you expect praise or not.
            </p>
          </div>
        </AltSection>

        {/* Pricing */}
        <section id="pricing" className="landing-wash scroll-mt-8 py-20 lg:py-28">
          <div className="mx-auto max-w-2xl px-5">
            <Reveal className="text-center">
              <SectionLabel centered>Pricing</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                Simple pricing
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Start free. No card until you need one.
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                No card, no trial clock. You get 20 requests to try it, however long you take to
                use them.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 rounded-2xl border border-border/60 bg-card p-8 text-center shadow-card sm:p-10">
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-bold tracking-tight text-foreground">$29</span>
                  <span className="text-base text-muted-foreground">per month</span>
                </div>
                <p className="mt-2 text-base text-foreground">
                  One business, unlimited review requests.
                </p>

                <hr className="my-6 border-border" />

                <ul className="mx-auto max-w-sm space-y-3 text-left">
                  {[
                    "20 free review requests to start",
                    "No card required to start",
                    "Month to month, cancel any time in the app",
                    "Email delivery, click tracking and reminders included",
                    "API access, so your scheduling software can create requests automatically",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base text-foreground">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-3" aria-hidden />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Running more than one business? Manage them all from one login. Each one gets
                  its own 20 free requests, and each additional business is $15 a month, billed
                  separately so every company gets its own invoice.
                </p>

                <div className="mt-8">
                  <WaitlistButton className="w-full sm:w-auto" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
