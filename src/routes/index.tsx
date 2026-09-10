import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  variant?: "default" | "outline";
  className?: string;
}) {
  return (
    <Button asChild size="lg" variant={variant} className={className}>
      <a href={WAITLIST_MAILTO}>Join the waitlist</a>
    </Button>
  );
}

function EmailMock() {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">Dana at Riverbend Notary</p>
        <p className="text-xs text-muted-foreground">Thanks for choosing Riverbend Notary</p>
        <p className="text-xs text-muted-foreground">Reply-to: dana@riverbendnotary.com</p>
      </div>

      <hr className="my-4 border-border" />

      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        DR
      </div>

      <p className="text-sm text-foreground">Hi Sarah,</p>
      <p className="mt-3 text-sm text-foreground">
        It was good working with you on your loan signing.
      </p>
      <p className="mt-3 text-sm text-foreground">
        If you have a moment, would you share an honest review of how it went? It makes a real
        difference to a small business like mine.
      </p>

      <div className="mt-5">
        <span className="inline-block cursor-default rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
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

const PROBLEMS = [
  "You do great work, then never hear about it again.",
  "Asking in person is awkward, and you forget by the time you are back in the car.",
  "Your competitor with fourteen reviews shows up above you.",
];

const STEPS = [
  "Mark the signing complete",
  "We wait an hour, so it lands while you are still fresh in their mind",
  "They get a short, personal email with one button",
  "One polite reminder if they do not act, and nothing more",
];

const NOTARY_POINTS = [
  "Works for solo notaries and for signing services with a roster",
  "Ask the signer, the title company, or both, and set different rules for each",
  "Never asks the same person twice, and leaves business contacts alone for six months by default",
  "Connects to OpenSked, so a completed order asks automatically",
];

function LandingPage() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSignedIn(!!session);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="text-sm font-semibold tracking-tight">newreview.app</span>
        {signedIn ? (
          <Button asChild size="sm">
            <Link to="/jobs">Go to dashboard</Link>
          </Button>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 lg:grid-cols-2 lg:items-center lg:gap-14 lg:pb-24 lg:pt-16">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Get Google reviews after every signing.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              newreview.app asks your signers for an honest review, on its own, an hour after the
              job is done. No app to remember, no awkward ask.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <WaitlistButton />
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
          </div>
          <div className="lg:pl-6">
            <EmailMock />
          </div>
        </section>

        {/* Problem */}
        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
            {PROBLEMS.map((p) => (
              <p key={p} className="text-lg font-medium leading-snug text-foreground">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-16 lg:py-24">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step} className="rounded-xl border bg-card p-6 shadow-card">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Built for notaries */}
        <section className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
            <h2 className="text-3xl font-bold tracking-tight">Built for notaries</h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {NOTARY_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-base text-foreground">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-pink" aria-hidden />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Compliance */}
        <section className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
          <h2 className="text-3xl font-bold tracking-tight">Built to keep you out of trouble.</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
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
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-xl px-5 pb-16 lg:pb-24">
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-card">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-gradient" />
            <h2 className="text-2xl font-bold tracking-tight">Pricing</h2>
            <p className="mt-4 text-base text-muted-foreground">
              Pricing announced at launch. Waitlist members get founding pricing.
            </p>
            <div className="mt-8">
              <WaitlistButton className="w-full sm:w-auto" />
            </div>
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
