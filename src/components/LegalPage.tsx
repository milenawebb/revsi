import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

export function LegalPage({
  title,
  updated,
  draft = true,
  children,
}: {
  title: string;
  updated: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {draft ? (
          <div className="bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-foreground">
            Draft for review. Not yet reviewed by counsel.
          </div>
        ) : null}
        <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-14">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last updated: {updated}</p>
          <div className="legal-body mt-8 space-y-8 text-sm leading-relaxed text-foreground">
            {children}
          </div>
          <p className="mt-10 text-sm text-muted-foreground">
            <Link to="/" className="underline underline-offset-2 hover:text-foreground">
              Back to Revsi.app
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold tracking-tight">{heading}</h2>
      <div className="space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}
