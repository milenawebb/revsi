import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — newreview.app" },
      { name: "description", content: "Privacy Policy for newreview.app, operated by Webb Consulting LLC." },
      { property: "og:title", content: "Privacy Policy — newreview.app" },
      { property: "og:description", content: "Privacy Policy for newreview.app, operated by Webb Consulting LLC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 10, 2026">
      <p>
        This policy explains how newreview.app, operated by Webb Consulting
        LLC, handles personal data. We keep two roles clearly separate.
      </p>

      <LegalSection heading="The two roles we play">
        <p>
          For your own account data — your name, email, and business details —
          we are the controller. We decide how that data is used to run your
          account.
        </p>
        <p>
          For the contact data you upload about your customers, you are the
          controller and we are the processor. We handle that data only on
          your instructions, to send the review requests you ask us to send.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>Account data: your name, email address, and password.</li>
          <li>Business settings: your business name, email style, and template choices.</li>
          <li>Customer contact data you upload: names, email addresses, and phone numbers.</li>
          <li>Email delivery events: sends, bounces, and similar status updates.</li>
          <li>Click events on review links.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          We use this data to operate the service: sending your review
          requests, managing unsubscribes, and showing you your dashboard.
        </p>
        <p>
          We do not sell personal data. We do not use it for advertising. We
          do not use your customers' contact data for our own purposes.
        </p>
      </LegalSection>

      <LegalSection heading="Subprocessors">
        <p>We use these services to run newreview.app:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase, for database and hosting.</li>
          <li>Resend, for email delivery.</li>
          <li>Lovable, for the application front end.</li>
          <li>Cloudflare, for infrastructure where applicable.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Retention">
        <p>
          We keep records for as long as your account is active and for a
          reasonable period afterward. Opt-out records are kept indefinitely,
          because we must keep honouring them.
        </p>
      </LegalSection>

      <LegalSection heading="Recipient rights">
        <p>
          Every email we send on your behalf includes an unsubscribe link.
          People can also ask to have their data deleted by contacting us at{" "}
          <a href="mailto:info@newreview.app" className="underline underline-offset-2">
            info@newreview.app
          </a>{" "}
          or by contacting the business that sent them the request.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          Data is encrypted in transit and at rest. Access to each business's
          data is controlled at the database level, so accounts can only reach
          their own records.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>The service is not for anyone under 18.</p>
      </LegalSection>

      <LegalSection heading="International transfers">
        <p>
          Data is stored in the United States. If you use the service from
          elsewhere, your data will be transferred to and processed in the
          United States.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          If we change this policy, we will post the new version here and, for
          significant changes, let you know.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about privacy:{" "}
          <a href="mailto:info@newreview.app" className="underline underline-offset-2">
            info@newreview.app
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
