import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service · revsi.app" },
      { name: "description", content: "Terms of Service for Revsi, operated by Webb Consulting LLC." },
      { property: "og:title", content: "Terms of Service · revsi.app" },
      { property: "og:description", content: "Terms of Service for Revsi, operated by Webb Consulting LLC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 12, 2026" draft={false}>
      <p>
        These Terms of Service ("Terms") are an agreement between you and Webb
        Consulting LLC, a Virginia limited liability company ("Webb
        Consulting," "Revsi," "we," "us," or "our"). Revsi is a DBA of Webb
        Consulting LLC. They govern your access to and use of revsi.app and
        related websites, applications, APIs, communications, and services
        (collectively, the "Service"). By creating an account, purchasing a
        subscription, accessing the API, or otherwise using the Service, you
        agree to these Terms.
      </p>
      <p>
        Our Privacy Policy and Subscription &amp; Refund Policy are
        incorporated into these Terms by reference. If you do not agree to
        these Terms, do not use the Service.
      </p>

      <LegalSection heading="1. What Revsi Does">
        <p>
          Revsi helps businesses request authentic reviews and feedback from
          people who have genuinely interacted with their business. Business
          users may provide information about completed customer interactions
          and instruct Revsi to send review requests, reminders, and links to
          third-party review destinations. Revsi may also provide email
          delivery, click tracking, reporting, templates, API access, and
          related tools.
        </p>
        <p>
          Revsi does not create or post reviews on behalf of recipients, sell
          or purchase reviews, create fake customer identities, condition
          review requests on positive sentiment, or guarantee positive
          reviews, ratings, rankings, or search results.
        </p>
      </LegalSection>

      <LegalSection heading="2. Eligibility and Accounts">
        <p>
          You must be at least 18 years old and legally able to enter into a
          binding agreement to use the Service. If you use Revsi on behalf of
          a company or other organization, you represent that you have
          authority to bind that organization to these Terms.
        </p>
        <p>
          You must provide accurate account and business information and keep
          it current. You are responsible for safeguarding your login
          credentials and for activity occurring through your account. You
          must promptly notify us if you suspect unauthorized access or use.
        </p>
      </LegalSection>

      <LegalSection heading="3. Recipient Data and Authority to Contact">
        <p>
          A "Recipient" is an individual whose contact information you provide
          to Revsi for a review or feedback request. "Recipient Data" means
          personal information you upload, import, enter, transmit through the
          API, or otherwise provide about a Recipient.
        </p>
        <p>
          You represent and warrant that you obtained Recipient Data through a
          legitimate business relationship or other lawful means and that you
          have all rights, permissions, consents, and lawful bases required to
          provide that data to Revsi and instruct us to process it and send
          the requested communications.
        </p>
        <p>
          You are responsible for determining whether a Recipient may lawfully
          be contacted through the communication channel you select and for
          honoring applicable consent, unsubscribe, suppression, and
          do-not-contact requirements.
        </p>
      </LegalSection>

      <LegalSection heading="4. Authentic Reviews and Acceptable Use">
        <p>
          You may use Revsi only to request authentic feedback from genuine
          customers or other legitimate Recipients. You may not:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Ask Recipients to leave only positive reviews or require a
            particular rating, sentiment, or wording.
          </li>
          <li>
            Filter, suppress, redirect, or selectively solicit Recipients
            based on whether you expect their review to be positive.
          </li>
          <li>
            Offer compensation, discounts, gifts, contest entries, or other
            incentives for reviews where prohibited by law or applicable
            platform policy.
          </li>
          <li>
            Create, buy, sell, impersonate, fabricate, coordinate, or
            facilitate fake, deceptive, or misleading reviews.
          </li>
          <li>
            Upload purchased, scraped, rented, or unrelated contact lists, or
            contact people with whom you lack an appropriate relationship or
            lawful basis.
          </li>
          <li>
            Use Revsi to violate or circumvent the review, content,
            solicitation, authenticity, or other applicable policies of Google
            or any other third-party review platform.
          </li>
          <li>
            Use the Service for spam, unlawful communications, harassment,
            fraud, malicious activity, or infringement of another person's
            rights.
          </li>
          <li>
            Circumvent usage or security controls, share access in an
            unauthorized manner, reverse engineer the Service except where
            applicable law expressly permits it, or use automated means to
            access the Service except through authorized Revsi functionality
            or APIs.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Your Responsibility for Communications and Compliance">
        <p>
          You control the Recipients you submit, the timing and destination of
          review requests, and any message content or settings you select. You
          are solely responsible for ensuring that your use of Revsi complies
          with applicable laws, regulations, contractual requirements, and
          third-party platform policies, including applicable consumer-review,
          advertising, email, telemarketing, privacy, and communications
          requirements.
        </p>
        <p>
          Revsi may provide templates, defaults, automated reminders,
          compliance-oriented settings, or other safeguards for convenience.
          These features do not constitute legal advice, do not guarantee
          compliance, and do not transfer your compliance obligations to
          Revsi.
        </p>
      </LegalSection>

      <LegalSection heading="6. Google and Other Third-Party Review Platforms">
        <p>
          Revsi is an independent service and is not affiliated with,
          sponsored by, endorsed by, or operated by Google or any other
          third-party review platform unless expressly stated otherwise.
          Google and other platforms establish and enforce their own terms,
          review policies, moderation standards, algorithms, and account
          rules, which may change at any time.
        </p>
        <p>
          You are solely responsible for ensuring that your review-solicitation
          practices and use of Revsi comply with the policies of Google and
          every other third-party platform you use. Revsi does not control
          whether a platform accepts, displays, removes, suppresses, filters,
          ranks, or otherwise treats a review or business profile.
        </p>
        <p>
          To the fullest extent permitted by law, Webb Consulting LLC is not
          responsible for the removal or suppression of reviews; changes to
          ratings, rankings, visibility, or search placement; warnings or
          restrictions placed on a business profile; suspension or termination
          of a Google Business Profile or other third-party account; loss of
          access to a third-party service; or other enforcement action taken
          by a third-party platform arising from your conduct, your
          instructions, your use of Revsi, or your failure to comply with that
          platform's policies.
        </p>
        <p>
          Revsi does not guarantee that any review will be submitted,
          published, remain published, improve your rating, increase search
          visibility, or produce any particular business result.
        </p>
      </LegalSection>

      <LegalSection heading="7. Free Review Requests">
        <p>
          Each new business added to Revsi currently receives its first 20
          review requests at no charge. No payment card is required to receive
          these requests, and there is no time-limited trial clock. The
          requests may be used at your own pace while the applicable account
          remains active and in good standing.
        </p>
        <p>
          Each business is eligible for one free allocation. You may not create
          duplicate accounts or business profiles to obtain repeated free
          allocations. After a business uses its 20 free requests, a paid
          subscription is required to send additional review requests for that
          business unless Revsi offers another plan or promotion.
        </p>
        <p>
          We may modify or discontinue the free-request offer for future users
          or businesses. We will not charge you merely because you used or
          exhausted the free allocation unless you separately activate a paid
          subscription and provide or authorize a payment method.
        </p>
      </LegalSection>

      <LegalSection heading="8. Subscriptions, Multiple Businesses, and Billing">
        <p>
          The current paid subscription for the first business is $29 per month
          and includes unlimited review requests for that business, subject to
          these Terms, reasonable use, and any technical or anti-abuse limits
          necessary to protect the Service. Included features may include email
          delivery, click tracking, reminders, reporting, and API access.
        </p>
        <p>
          A user may manage multiple businesses under one login. Each
          additional business currently receives its own 20 free review
          requests and, after those requests are used, may be activated as a
          paid business for $15 per month. Each paid business is a separate
          subscription and may be billed separately so that each business can
          receive its own invoice.
        </p>
        <p>
          Paid subscriptions are month to month and renew automatically each
          month until canceled. By activating a paid subscription, you
          authorize Webb Consulting LLC and its payment providers to charge the
          applicable subscription fees and taxes using your selected payment
          method.
        </p>
        <p>
          If a payment fails, we may retry the charge, request an updated
          payment method, restrict paid functionality, or suspend the affected
          business subscription until payment is resolved.
        </p>
        <p>
          Additional billing, cancellation, refund, and pricing terms are set
          out in our Subscription &amp; Refund Policy, which forms part of
          these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Cancellation and Refunds">
        <p>
          You may cancel a paid business subscription at any time through the
          Service or by contacting us. Unless otherwise required by law,
          cancellation takes effect at the end of the then-current paid billing
          period. You may continue using paid features for the affected
          business through that date, and cancellation of one business does not
          automatically cancel other business subscriptions under the same
          login.
        </p>
        <p>
          Except where required by law or expressly provided in the
          Subscription &amp; Refund Policy, subscription fees are
          non-refundable and we do not provide prorated refunds or credits for
          partial billing periods, unused features, unused review capacity, or
          periods of non-use.
        </p>
        <p>
          Suspension, restriction, removal, or termination of your Google
          Business Profile, reviews, third-party review-platform account, or
          other third-party content does not entitle you to a refund or credit
          for your Revsi subscription.
        </p>
      </LegalSection>

      <LegalSection heading="10. Price and Plan Changes">
        <p>
          We may change subscription pricing, plan features, or usage terms
          prospectively. If a price increase affects an existing paid
          subscription, we will provide at least 30 days' advance notice before
          the new price applies to a subsequent billing period. If you do not
          agree to the change, you may cancel before it takes effect.
          Promotional, beta, negotiated, or custom pricing may be subject to
          separate terms disclosed when offered.
        </p>
      </LegalSection>

      <LegalSection heading="11. API Access and Integrations">
        <p>
          Revsi may provide API access or integrations that allow authorized
          third-party software, including scheduling or business-management
          systems, to create review requests or exchange data with the Service.
          You are responsible for securing API credentials, configuring
          integrations appropriately, and ensuring that data submitted through
          an integration is authorized and accurate.
        </p>
        <p>
          We may impose reasonable technical, security, or rate limits on API
          access and may suspend API credentials that create a security risk,
          excessive load, unauthorized use, or violation of these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="12. Intellectual Property and License">
        <p>
          The Service, including its software, APIs, design, branding,
          documentation, and underlying technology, is owned by Webb Consulting
          LLC or its licensors and is protected by applicable
          intellectual-property laws. Subject to these Terms, we grant you a
          limited, non-exclusive, non-transferable, revocable right to access
          and use the Service for your internal business purposes.
        </p>
        <p>
          You retain ownership of information and content you provide to the
          Service. You grant Revsi the limited rights necessary to host,
          process, transmit, display, and otherwise use that information to
          provide, secure, support, and administer the Service and as otherwise
          described in our Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection heading="13. Feedback">
        <p>
          If you voluntarily provide ideas, suggestions, or feedback about
          Revsi, you permit us to use that feedback without restriction or
          compensation, provided we do not publicly identify you as its source
          without permission.
        </p>
      </LegalSection>

      <LegalSection heading="14. Service Changes and Beta Features">
        <p>
          We may add, modify, suspend, or discontinue features as the Service
          evolves. Features identified as beta, preview, experimental, or early
          access may be incomplete, change without notice, and be subject to
          additional limitations.
        </p>
      </LegalSection>

      <LegalSection heading="15. Blocking, Suspension, and Termination">
        <p>
          We may block or refuse messages, restrict functionality, suspend a
          business subscription or account, revoke API access, or terminate
          access when we reasonably believe use of the Service violates these
          Terms, applicable law, third-party platform rules, or presents a
          security, fraud, spam, abuse, or reputational risk to Revsi or
          others. Where practical, we may provide notice and an opportunity to
          correct the issue.
        </p>
        <p>
          You may stop using the Service and close your account at any time,
          subject to outstanding payment obligations. After termination, we may
          delete account and Recipient Data after a reasonable period, except
          for information we must retain for legal, security, accounting,
          dispute-resolution, backup, fraud-prevention, or suppression
          purposes. Our Privacy Policy provides additional information about
          retention.
        </p>
      </LegalSection>

      <LegalSection heading="16. Disclaimer of Warranties">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS
          IS" AND "AS AVAILABLE." WEBB CONSULTING DISCLAIMS WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT,
          AND WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE. WE
          DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
          COMPLETELY SECURE, OR COMPATIBLE WITH EVERY THIRD-PARTY PLATFORM OR
          INTEGRATION.
        </p>
        <p>
          WE DO NOT WARRANT OR GUARANTEE ANY PARTICULAR NUMBER, QUALITY,
          SENTIMENT, RATING, PUBLICATION, RETENTION, OR EFFECT OF REVIEWS, OR
          ANY PARTICULAR SEARCH RANKING, REPUTATION, REVENUE, OR OTHER BUSINESS
          RESULT.
        </p>
      </LegalSection>

      <LegalSection heading="17. Limitation of Liability">
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, WEBB CONSULTING AND ITS
          AFFILIATES, OFFICERS, EMPLOYEES, CONTRACTORS, AND SERVICE PROVIDERS
          WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
          PUNITIVE, OR CONSEQUENTIAL DAMAGES, OR FOR LOST PROFITS, REVENUE,
          DATA, GOODWILL, REVIEWS, RATINGS, SEARCH VISIBILITY, OR BUSINESS
          OPPORTUNITIES ARISING FROM OR RELATED TO THE SERVICE.
        </p>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, OUR AGGREGATE LIABILITY FOR
          CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT EXCEED THE
          AMOUNT YOU PAID TO WEBB CONSULTING FOR THE SERVICE DURING THE TWELVE
          MONTHS IMMEDIATELY BEFORE THE EVENT GIVING RISE TO THE CLAIM. Some
          jurisdictions do not allow certain exclusions or limitations, so some
          of the foregoing may not apply to you.
        </p>
      </LegalSection>

      <LegalSection heading="18. Indemnification">
        <p>
          To the extent permitted by law, you agree to defend, indemnify, and
          hold harmless Webb Consulting LLC and its affiliates, officers,
          employees, and contractors from claims, liabilities, damages, losses,
          penalties, and reasonable costs arising from or relating to your
          Recipient Data, message content, instructions, review-solicitation
          practices, violation of these Terms, violation of law or third-party
          rights, failure to comply with a third-party review platform's
          policies, or allegation that you lacked authority to contact a
          Recipient.
        </p>
      </LegalSection>

      <LegalSection heading="19. Governing Law and Venue">
        <p>
          These Terms are governed by the laws of the Commonwealth of Virginia,
          without regard to conflict-of-laws principles. Unless applicable law
          requires otherwise, any judicial proceeding arising out of these
          Terms or the Service will be brought in a state or federal court with
          jurisdiction in Virginia, and you consent to the personal
          jurisdiction of those courts.
        </p>
      </LegalSection>

      <LegalSection heading="20. Electronic Communications">
        <p>
          You agree that we may provide agreements, notices, disclosures,
          receipts, billing notices, and other Service-related communications
          electronically, including through the Service or by email to the
          address associated with your account.
        </p>
      </LegalSection>

      <LegalSection heading="21. Changes to These Terms">
        <p>
          We may update these Terms from time to time. We will post revised
          Terms with an updated effective date and, when appropriate, provide
          additional notice of material changes. Your continued use of the
          Service after revised Terms take effect constitutes acceptance of the
          revised Terms to the extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection heading="22. General Terms">
        <p>
          These Terms, together with the Privacy Policy, Subscription &amp;
          Refund Policy, and any additional terms presented for a particular
          feature, integration, promotion, or plan, form the agreement
          governing your use of the Service. If any provision is found
          unenforceable, the remaining provisions remain in effect. Failure to
          enforce a provision is not a waiver. You may not assign these Terms
          without our consent; we may assign them in connection with a merger,
          acquisition, reorganization, sale of assets, or by operation of law.
          Neither party is liable for delay or failure caused by events beyond
          its reasonable control, except for payment obligations.
        </p>
      </LegalSection>

      <LegalSection heading="23. Contact">
        <p>Questions about these Terms may be sent to:</p>
        <p>
          Webb Consulting LLC
          <br />
          511 Caddy Aly
          <br />
          Charlottesville, VA 22911
          <br />
          Email:{" "}
          <a href="mailto:info@revsi.app" className="underline underline-offset-2">
            info@revsi.app
          </a>
          <br />
          Website: revsi.app
        </p>
      </LegalSection>
    </LegalPage>
  );
}
