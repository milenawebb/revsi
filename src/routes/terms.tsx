import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service · revsi.app" },
      { name: "description", content: "Terms of Service for revsi.app, operated by Webb Consulting LLC." },
      { property: "og:title", content: "Terms of Service · revsi.app" },
      { property: "og:description", content: "Terms of Service for revsi.app, operated by Webb Consulting LLC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 10, 2026" draft={false}>
      <p>
        These Terms of Service ("Terms") are an agreement between you and Webb
        Consulting LLC, a Virginia limited liability company ("Webb
        Consulting," "Revsi," "we," "us," or "our"). They govern your access
        to and use of revsi.app and related services (the "Service"). By
        creating an account or using the Service, you agree to these Terms.
      </p>

      <LegalSection heading="1. What Revsi does">
        <p>
          Revsi helps businesses request authentic reviews and feedback from
          people who have genuinely interacted with their business. Business
          users provide information about a completed customer interaction and
          instruct Revsi to send review requests, reminders, and links to
          third-party review destinations. Revsi may also provide
          unsubscription management, reporting, templates, and related tools.
        </p>
        <p>
          Revsi does not create fake reviews, purchase reviews, condition
          review requests on positive sentiment, or provide incentives in
          exchange for reviews.
        </p>
      </LegalSection>

      <LegalSection heading="2. Eligibility and accounts">
        <p>
          You must be at least 18 years old and legally able to enter into a
          binding agreement to use the Service. You must provide accurate
          account information and keep it current. You are responsible for
          safeguarding your credentials and for activity occurring through
          your account. You must promptly notify us of suspected unauthorized
          access.
        </p>
      </LegalSection>

      <LegalSection heading="3. Recipient Data and authority to contact">
        <p>
          A "Recipient" is an individual whose contact information you provide
          to Revsi for a review or feedback request. You represent and warrant
          that you obtained Recipient Data through a legitimate business
          relationship or other lawful means and that you have all rights,
          permissions, consents, and other lawful bases required to provide
          that data to Revsi and instruct us to process it and send the
          requested communications.
        </p>
        <p>
          You are responsible for determining whether a recipient may lawfully
          be contacted through the communication channel you select and for
          honoring applicable consent, opt-out, suppression, and
          do-not-contact requirements.
        </p>
      </LegalSection>

      <LegalSection heading="4. Authentic reviews and acceptable use">
        <p>
          You may use Revsi only to request authentic feedback from genuine
          customers or other legitimate recipients. You may not:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Ask recipients to leave only positive reviews or require a
            particular rating, sentiment, or wording.
          </li>
          <li>
            Offer compensation, discounts, gifts, entries, or other incentives
            in exchange for reviews where prohibited by law or platform
            policy.
          </li>
          <li>
            Filter, suppress, or selectively route recipients based on whether
            you expect their review to be positive.
          </li>
          <li>
            Upload purchased, scraped, rented, or unrelated contact lists, or
            contact people with whom you lack an appropriate relationship or
            lawful basis.
          </li>
          <li>
            Use Revsi to create, buy, sell, impersonate, fabricate, or
            coordinate fake or misleading reviews.
          </li>
          <li>
            Use the Service for spam, unlawful communications, harassment,
            fraud, malicious activity, or infringement of another person's
            rights.
          </li>
          <li>
            Circumvent Service limits, interfere with security controls,
            reverse engineer the Service except where applicable law expressly
            permits it, or use automated means to access the Service in an
            unauthorized manner.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Your responsibility for communications">
        <p>
          You control the recipients, timing, review destinations, and message
          content used through your account. You are responsible for ensuring
          that your use of the Service complies with applicable laws,
          regulations, contractual requirements, and third-party platform
          policies, including applicable consumer-review, advertising, email,
          telemarketing, privacy, and communications rules.
        </p>
        <p>
          Revsi may provide templates, defaults, or compliance-oriented
          features for convenience, but these do not constitute legal advice
          and do not transfer your compliance obligations to Revsi.
        </p>
      </LegalSection>

      <LegalSection heading="6. Third-party review platforms">
        <p>
          Revsi may link recipients to Google or other third-party review
          platforms. Revsi is independent from those platforms unless
          expressly stated otherwise. We do not control whether a third-party
          platform accepts, displays, removes, ranks, filters, or otherwise
          treats a review, and we do not guarantee any particular rating,
          number of reviews, search ranking, or business result. Your use of
          third-party platforms remains subject to their own terms and
          policies.
        </p>
      </LegalSection>

      <LegalSection heading="7. Blocking, suspension, and enforcement">
        <p>
          We may block or refuse messages, restrict functionality, suspend
          accounts, or terminate access when we reasonably believe use of the
          Service violates these Terms, applicable law, third-party platform
          rules, or presents a security, fraud, spam, or reputational risk to
          Revsi or others. Where practical, we may provide notice and an
          opportunity to correct the issue.
        </p>
      </LegalSection>

      <LegalSection heading="8. Fees, subscriptions, and billing">
        <p>
          Revsi lets each business send its first 20 review requests at no
          charge. There is no time limit for using those 20 requests and no
          payment card is required to start. After a business uses its 20 free
          review requests, continued use requires a paid subscription unless
          Revsi offers another plan or promotion.
        </p>
        <p>
          The current paid plan for the first business is $29 per month and
          includes unlimited review requests for that business, email delivery,
          click tracking, reminders, and API access. A user may manage more than
          one business under one login. Each additional business receives its
          own 20 free review requests and, after those requests are used, is $15
          per month. Additional businesses are billed separately so each
          business may receive its own invoice. Subscriptions are month to month
          and may be canceled in the app at any time.
        </p>
        <p>
          Paid subscriptions renew automatically each month until canceled.
          Cancellation stops future renewal charges and takes effect at the end
          of the then-current paid billing period unless applicable law requires
          otherwise. Except where required by law or expressly stated otherwise,
          amounts already paid are non-refundable and Revsi does not provide
          prorated refunds for a partially used billing period.
        </p>
        <p>
          You authorize Revsi and its payment providers to charge applicable
          subscription fees and taxes using your selected payment method. If a
          payment fails, we may retry the charge, request an updated payment
          method, limit paid features, or suspend the affected business until
          payment is resolved.
        </p>
        <p>
          We may change prices or plan features prospectively. If a price change
          affects an existing paid subscription, we will provide reasonable
          advance notice before the new price applies to a future billing
          period. Promotional, beta, or custom pricing may be subject to
          separate terms disclosed when offered.
        </p>
      </LegalSection>

      <LegalSection heading="9. Intellectual property and license">
        <p>
          The Service, including its software, design, branding,
          documentation, and underlying technology, is owned by Webb
          Consulting LLC or its licensors and is protected by applicable
          intellectual-property laws. Subject to these Terms, we grant you a
          limited, non-exclusive, non-transferable, revocable right to access
          and use the Service for your internal business purposes.
        </p>
        <p>
          You retain ownership of information and content you provide to the
          Service. You grant Revsi the limited rights necessary to host,
          process, transmit, and otherwise use that information solely to
          provide, secure, support, and administer the Service and as
          otherwise permitted by our Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection heading="10. Feedback">
        <p>
          If you voluntarily provide ideas, suggestions, or feedback about
          Revsi, you permit us to use that feedback without restriction or
          compensation, provided we do not publicly identify you as its source
          without permission.
        </p>
      </LegalSection>

      <LegalSection heading="11. Service changes and beta features">
        <p>
          We may add, modify, suspend, or discontinue features as the Service
          evolves. Features identified as beta, preview, experimental, or
          early access may be incomplete, change without notice, and be
          subject to additional limitations.
        </p>
      </LegalSection>

      <LegalSection heading="12. Termination and data">
        <p>
          You may stop using the Service and close your account at any time,
          subject to any outstanding payment obligations. We may suspend or
          terminate access for material breach, repeated misuse, nonpayment,
          legal or security reasons, or as otherwise permitted by these Terms.
        </p>
        <p>
          After termination, we may delete account and Recipient Data after a
          reasonable period, except for information we must retain for legal,
          security, accounting, dispute-resolution, backup, fraud-prevention,
          or suppression purposes. Our Privacy Policy provides additional
          information about retention.
        </p>
      </LegalSection>

      <LegalSection heading="13. Disclaimer of warranties">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS
          IS" AND "AS AVAILABLE." WEBB CONSULTING DISCLAIMS WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT,
          AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.
          WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
          ERROR-FREE, COMPLETELY SECURE, OR PRODUCE ANY PARTICULAR NUMBER,
          QUALITY, OR RATING OF REVIEWS.
        </p>
      </LegalSection>

      <LegalSection heading="14. Limitation of liability">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, WEBB CONSULTING AND ITS
          AFFILIATES, OFFICERS, EMPLOYEES, CONTRACTORS, AND SERVICE PROVIDERS
          WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
          PUNITIVE, OR CONSEQUENTIAL DAMAGES, OR FOR LOST PROFITS, REVENUE,
          DATA, GOODWILL, OR BUSINESS OPPORTUNITIES ARISING FROM OR RELATED TO
          THE SERVICE.
        </p>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, OUR AGGREGATE LIABILITY FOR
          CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT EXCEED THE
          AMOUNT YOU PAID TO WEBB CONSULTING FOR THE SERVICE DURING THE TWELVE
          MONTHS IMMEDIATELY BEFORE THE EVENT GIVING RISE TO THE CLAIM. Some
          jurisdictions do not allow certain exclusions or limitations, so
          some of the foregoing may not apply to you.
        </p>
      </LegalSection>

      <LegalSection heading="15. Indemnification">
        <p>
          To the extent permitted by law, you agree to defend, indemnify, and
          hold harmless Webb Consulting LLC and its affiliates, officers,
          employees, and contractors from claims, liabilities, damages,
          losses, and reasonable costs arising from your Recipient Data,
          message content, instructions, violation of these Terms, violation
          of law or third-party rights, or allegation that you lacked
          authority to contact a Recipient.
        </p>
      </LegalSection>

      <LegalSection heading="16. Governing law and venue">
        <p>
          These Terms are governed by the laws of the Commonwealth of
          Virginia, without regard to conflict-of-laws principles. Unless
          applicable law requires otherwise, any judicial proceeding arising
          out of these Terms or the Service will be brought in a state or
          federal court with jurisdiction in Virginia, and you consent to the
          personal jurisdiction of those courts.
        </p>
      </LegalSection>

      <LegalSection heading="17. Electronic communications">
        <p>
          You agree that we may provide agreements, notices, disclosures,
          receipts, and other Service-related communications electronically,
          including through the Service or by email to the address associated
          with your account.
        </p>
      </LegalSection>

      <LegalSection heading="18. Changes to these Terms">
        <p>
          We may update these Terms from time to time. We will post the
          revised Terms with an updated effective date and, when appropriate,
          provide additional notice of material changes. Your continued use of
          the Service after revised Terms take effect constitutes acceptance
          of the revised Terms to the extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection heading="19. General terms">
        <p>
          These Terms, together with the Privacy Policy and any additional
          terms presented for a particular feature or plan, form the agreement
          governing your use of the Service. If any provision is found
          unenforceable, the remaining provisions remain in effect. Failure to
          enforce a provision is not a waiver. You may not assign these Terms
          without our consent; we may assign them in connection with a merger,
          acquisition, reorganization, sale of assets, or by operation of law.
          Neither party is liable for delay or failure caused by events beyond
          its reasonable control, except for payment obligations.
        </p>
      </LegalSection>

      <LegalSection heading="20. Contact">
        <p>
          Questions about these Terms may be sent to:{" "}
          <a href="mailto:info@revsi.app" className="underline underline-offset-2">
            info@revsi.app
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
