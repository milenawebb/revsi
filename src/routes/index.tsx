import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { HeroEmailCard } from "@/components/landing/HeroEmailCard";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Reveal, useInView, usePrefersReducedMotion } from "@/components/landing/motion";
import {
  FloatingChip,
  PhotoFrame,
  RequestsShot,
  SettingsShot,
} from "@/components/landing/ProductShots";
import signingTablePhoto from "@/assets/landing/signing-table.jpg";
import carSeatPhoto from "@/assets/landing/car-seat.jpg";
import stampSealPhoto from "@/assets/landing/stamp-seal.jpg";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const WAITLIST_MAILTO =
  "mailto:info@newreview.app?subject=newreview.app%20waitlist&body=Please%20add%20me%20to%20the%20waitlist.";

const TITLE = "Get Google reviews after every signing — newreview.app";
const DESC =
  "newreview.app asks your signers for an honest Google review an hour after the job is done. Built for notaries, mobile notaries and signing services.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
      <a href={WAITLIST_MAILTO}>Join the waitlist</a>
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

function SectionPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-brand-purple/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-purple">
      {children}
    </span>
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
          <SectionPill>{pill}</SectionPill>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">{heading}</h2>
          <div className="mt-6">{children}</div>
        </Reveal>

        {visual ? (
          <div className={cn("relative", reverse && "lg:order-1")}>
            <Reveal>{visual}</Reveal>
            {chip ? (
              <Reveal delay={150} className={cn("absolute z-10", chipClassName)}>
                {chip}
              </Reveal>
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
        return (
          <div key={text} className="relative">
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-0.5 origin-top bg-brand-purple",
                show ? "animate-line-draw" : "scale-y-0",
              )}
              style={{ animationDelay: `${i * 120 + 200}ms` }}
            />
            <div
              className={cn("pl-5", show ? "animate-problem-reveal" : "opacity-0")}
              style={{ animationDelay: `${i * 120}ms` }}
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

function LandingPage() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="landing-wash min-h-screen">
      {/* Hero on the brand gradient */}
      <div className="bg-brand-gradient text-primary-foreground">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <span className="text-sm font-semibold tracking-tight">newreview.app</span>
          {signedIn ? (
            <Button asChild size="sm" variant="secondary">
              <Link to="/jobs">Go to dashboard</Link>
            </Button>
          ) : (
            <Link to="/login" className="text-sm font-medium opacity-80 hover:opacity-100">
              Sign in
            </Link>
          )}
        </header>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 lg:grid-cols-2 lg:items-center lg:gap-14 lg:pb-28 lg:pt-16">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Get Google reviews after every signing.
            </h1>
            <p className="mt-5 text-lg opacity-90">
              newreview.app asks your signers for an honest review, on its own, an hour after the
              job is done. No app to remember, no awkward ask.
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
          visual={
            <PhotoFrame
              src={signingTablePhoto}
              alt="Hands turning a page of documents on a signing table beside a pen"
            />
          }
          chip={
            <FloatingChip>
              <Badge variant="delivered" className="text-[10px]">
                Delivered
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground">Sent 9:30 AM</p>
            </FloatingChip>
          }
          chipClassName="-bottom-6 -left-4 rotate-[-2deg] sm:-left-8"
        >
          <ProblemPoints />
        </AltSection>

        <AltSection
          id="how-it-works"
          pill="How it works"
          heading="How it works"
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
          chipClassName="-bottom-6 -right-4 rotate-[2deg] sm:-right-8"
        >
          <HowItWorks />
        </AltSection>

        <AltSection
          pill="For notaries"
          heading="Built for notaries"
          visual={
            <PhotoFrame
              src={carSeatPhoto}
              alt="A document folder and a phone on a car passenger seat in afternoon light"
            />
          }
          chip={
            <FloatingChip>
              <Badge variant="queued" className="text-[10px]">
                Queued
              </Badge>
              <p className="mt-2 text-xs text-muted-foreground">Sends 1 hour after the job</p>
            </FloatingChip>
          }
          chipClassName="-bottom-6 -left-4 rotate-[-2deg] sm:-left-8"
        >
          <ul className="grid gap-6">
            {NOTARY_POINTS.map((point) => (
              <li key={point} className="flex gap-3 text-base text-foreground">
                <span className="mt-2 size-2 shrink-0 rounded-full bg-pink" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </AltSection>

        <AltSection pill="Compliance" heading="Built to keep you out of trouble." tint>
          <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground">
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

        {/* Pricing — the second and final gradient moment */}
        <section className="landing-wash pb-20 lg:pb-28">
          <div className="mx-auto max-w-3xl px-5">
            <Reveal>
              <div className="rounded-2xl bg-brand-gradient p-8 text-center text-primary-foreground shadow-[0_24px_60px_-24px_rgb(20_20_27/0.35)] sm:p-12">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  Pricing
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight">Pricing</h2>
                <p className="mx-auto mt-4 max-w-md text-base opacity-90">
                  Pricing announced at launch. Waitlist members get founding pricing.
                </p>
                <div className="mt-8">
                  <WaitlistButton variant="secondary" className="w-full sm:w-auto" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>newreview.app — a Webb Consulting LLC service</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <a href="mailto:info@newreview.app" className="hover:text-foreground">
              info@newreview.app
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
