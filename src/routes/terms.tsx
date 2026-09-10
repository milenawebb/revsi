import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — newreview.app" },
      { name: "description", content: "Terms of Service for newreview.app, operated by Webb Consulting LLC." },
      { property: "og:title", content: "Terms of Service — newreview.app" },
      { property: "og:description", content: "Terms of Service for newreview.app, operated by Webb Consulting LLC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 10, 2026">
      <p>
        These terms are between you and Webb Consulting LLC, a Virginia limited
        liability company. They govern your use of newreview.app. By using the
        service, you agree to them.
      </p>

      <LegalSection heading="What the service does">
        <p>
          newreview.app sends review requests to a business's own customers on
          that business's behalf. You tell us about a completed job, and we
          email your customer a link to leave you a review. We also manage
          reminders, unsubscribes, and simple reporting.
        </p>
      </LegalSection>

      <LegalSection heading="Accounts and eligibility">
        <p>
          You must be 18 or over to use the service. You must give us accurate
          information when you sign up and keep it up to date. You are
          responsible for what happens under your account.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>You may only send review requests to people who genuinely used your business.</p>
        <p>You may not:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Ask for positive reviews. You may ask for honest reviews only.</li>
          <li>Offer incentives of any kind for reviews.</li>
          <li>Filter who you ask based on how happy you expect them to be.</li>
          <li>Upload contact lists you did not get through your own business relationship.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Your responsibility for message content">
        <p>
          You are responsible for the content of the messages sent through
          your account and for complying with Google's review policies, the
          FTC's Consumer Review Rule, CAN-SPAM, and any other applicable law.
          We provide the tool; how you use it is on you.
        </p>
      </LegalSection>

      <LegalSection heading="Blocking and suspension">
        <p>
          We may block message content that appears to violate these rules. We
          may suspend accounts that repeatedly try to send it. We do this to
          keep the service usable for everyone and to protect review
          platforms' rules.
        </p>
      </LegalSection>

      <LegalSection heading="Fees and billing">
        <p>
          Pricing for the service is to be determined. We will tell you before
          any fees apply to your account.
        </p>
      </LegalSection>

      <LegalSection heading="Termination">
        <p>
          You may stop using the service and close your account at any time.
          We may end your access for breach of these terms or for repeated
          misuse. When an account ends, your data is deleted after a
          reasonable period, except for records we must keep by law or to
          honour opt-outs.
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimer of warranties">
        <p>
          The service is provided as is, without warranties of any kind. We do
          not promise it will be uninterrupted, error-free, or that it will
          produce any particular number of reviews.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the fullest extent allowed by law, our total liability to you for
          any claim relating to the service is capped at the fees you paid us
          in the twelve months before the claim. We are not liable for
          indirect or consequential losses.
        </p>
      </LegalSection>

      <LegalSection heading="Indemnification">
        <p>
          You agree to indemnify us against claims arising from the content of
          your messages and from the contact lists you upload, including any
          claim that you did not have the right to contact those people.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of the Commonwealth of
          Virginia.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>
          We may update these terms. When we do, we will give you notice, for
          example by email or a notice in the app. If you keep using the
          service after the change takes effect, you accept the new terms.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms:{" "}
          <a href="mailto:info@webb-consulting.net" className="underline underline-offset-2">
            info@webb-consulting.net
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
