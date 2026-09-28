import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

const DESCRIPTION =
  "Subscription and Refund Policy for revsi.app, operated by Webb Consulting LLC.";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscription & Refund Policy · revsi.app" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Subscription & Refund Policy · revsi.app" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  return (
    <LegalPage
      title="Subscription & Refund Policy"
      updated="September 12, 2026"
      draft={false}
    >
      <p>
        This Subscription &amp; Refund Policy ("Policy") describes the billing
        terms, subscription management, free request allowance, cancellation,
        and refund practices for Revsi, operated by Webb Consulting LLC. Revsi
        is a DBA of Webb Consulting LLC. By purchasing a Revsi subscription,
        you agree to this Policy.
      </p>
      <p>
        This Policy supplements our Terms of Service, which govern your use of
        Revsi generally.
      </p>

      <LegalSection heading="1. Free review requests">
        <p>
          Each new business added to Revsi receives 20 free review requests to
          try the Service. The following terms apply:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            No credit or debit card is required to receive the 20 free review
            requests.
          </li>
          <li>
            The free requests do not expire after a set trial period. You may
            use them at your own pace while your account remains active and in
            good standing.
          </li>
          <li>
            Each business is eligible for one allocation of 20 free review
            requests.
          </li>
          <li>
            The free allowance is associated with the individual business and
            may not be repeatedly claimed by creating duplicate accounts or
            business profiles.
          </li>
          <li>
            Once a business has used its 20 free review requests, a paid
            subscription is required to send additional review requests for
            that business.
          </li>
          <li>
            Webb Consulting LLC may modify or discontinue the free request
            offer for future users or businesses. Any change will not result in
            a charge unless you affirmatively subscribe to a paid plan.
          </li>
        </ul>
        <p>
          The free request allowance is not a time-limited free trial, and
          Revsi will not automatically charge you when the 20 requests have
          been used unless you have separately subscribed to a paid plan and
          provided a payment method.
        </p>
      </LegalSection>

      <LegalSection heading="2. Subscription pricing">
        <p>
          After the 20 free review requests have been used, the following
          monthly pricing applies.
        </p>
        <p>
          <strong>Primary business: $29 per month.</strong> The paid
          subscription includes unlimited review requests for that business,
          subject to these Terms and reasonable use of the Service. Included
          features may include email delivery, click tracking, reminders,
          reporting, and API access.
        </p>
        <p>
          <strong>Additional businesses: $15 per month per business.</strong>{" "}
          Users managing multiple businesses may manage them from a single
          Revsi login. Each additional business:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Receives its own 20 free review requests before a paid subscription
            is required.
          </li>
          <li>
            Is billed separately at $15 per month if activated as a paid
            business.
          </li>
          <li>
            Has its own subscription and billing cycle unless Revsi specifies
            otherwise.
          </li>
        </ul>
        <p>
          Adding a business to your account does not automatically create a
          paid subscription for that business.
        </p>
      </LegalSection>

      <LegalSection heading="3. Billing and payment">
        <p>
          By activating a paid subscription, you authorize Webb Consulting LLC
          and its payment processor to charge your selected payment method on a
          recurring basis.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Subscriptions are billed monthly.</li>
          <li>
            Your subscription automatically renews each month unless canceled.
          </li>
          <li>Charges are in U.S. dollars.</li>
          <li>Applicable taxes may be added where required.</li>
          <li>You are responsible for maintaining a valid payment method.</li>
          <li>We may retry failed payments.</li>
          <li>
            If payment cannot be collected after reasonable attempts, we may
            suspend paid functionality for the affected business until payment
            is received.
          </li>
        </ul>
        <p>
          The current subscription price and applicable charges will be
          displayed before you complete a purchase.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cancellation">
        <p>
          You may cancel a paid subscription at any time through your Revsi
          account or by contacting info@revsi.app. When you cancel:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Cancellation takes effect at the end of the current paid billing
            period.
          </li>
          <li>
            You may continue using the paid features for that business through
            the end of the billing period.
          </li>
          <li>
            You will not be charged for another billing period unless you
            reactivate the subscription.
          </li>
          <li>
            Cancellation of one business subscription does not automatically
            cancel subscriptions associated with other businesses under the
            same login.
          </li>
          <li>
            Canceling a subscription does not necessarily delete your Revsi
            account or associated data immediately. Data is handled according
            to our Terms of Service and Privacy Policy.
          </li>
        </ul>
        <p>
          Because the initial 20 requests require no payment method, there is
          nothing to cancel and no charge to avoid while a business is using
          only its free request allowance.
        </p>
      </LegalSection>

      <LegalSection heading="5. No refund policy">
        <p>
          ALL SUBSCRIPTION FEES ARE NON-REFUNDABLE EXCEPT WHERE REQUIRED BY LAW
          OR AS EXPRESSLY PROVIDED IN SECTION 9 BELOW. This includes, but is
          not limited to:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Partial months remaining after cancellation.</li>
          <li>Periods during which you did not use Revsi.</li>
          <li>Unused features.</li>
          <li>Review requests you chose not to send.</li>
          <li>
            Cancellation of a business before the end of its billing period.
          </li>
          <li>
            Suspension or termination resulting from a violation of our Terms
            of Service.
          </li>
        </ul>
        <p>
          We do not ordinarily provide prorated refunds or credits for unused
          portions of a billing period. By purchasing a Revsi subscription, you
          acknowledge and agree to this refund policy.
        </p>
      </LegalSection>

      <LegalSection heading="6. Multiple businesses">
        <p>
          A Revsi account may be used to manage more than one business. The
          primary paid business is currently $29 per month, and each additional
          paid business is currently $15 per month. Each business subscription
          is treated separately. This means that:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Each business receives its own initial 20 free review requests.</li>
          <li>
            A business does not become paid merely because another business
            under the same login has a paid subscription.
          </li>
          <li>
            Each paid business may be activated or canceled independently.
          </li>
          <li>
            Charges for additional businesses may appear as separate
            transactions or invoices.
          </li>
          <li>
            Canceling one business does not affect the subscription status of
            another business unless you specifically cancel it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="7. Price changes">
        <p>
          Webb Consulting LLC may change Revsi's subscription pricing or
          introduce new plans or features. For existing paid subscriptions, we
          will provide at least 30 days' advance notice before a price increase
          applies to a subsequent billing period.
        </p>
        <p>
          If you do not agree to a price change, you may cancel the affected
          subscription before the new price takes effect. Continued use of a
          paid subscription after the new pricing becomes effective constitutes
          acceptance of the new price.
        </p>
      </LegalSection>

      <LegalSection heading="8. Account suspension and termination">
        <p>
          Webb Consulting LLC may suspend or terminate an account or individual
          business subscription for violations of our Terms of Service,
          including misuse of Revsi for fake reviews, review manipulation,
          spam, unauthorized contact lists, fraudulent activity, or other
          prohibited conduct.
        </p>
        <p>
          If a paid subscription is suspended or terminated for cause, no
          refund will ordinarily be issued for the remaining portion of the
          billing period. Data associated with suspended or terminated accounts
          will be handled according to our Terms of Service and Privacy Policy.
        </p>
        <p>
          Suspension, restriction, or removal of your Google Business Profile,
          reviews, or other third-party accounts or content does not entitle
          you to a refund or credit for your Revsi subscription.
        </p>
      </LegalSection>

      <LegalSection heading="9. Billing errors and exceptional circumstances">
        <p>
          Although subscription fees are generally non-refundable, we will
          review legitimate billing errors, including:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Duplicate charges caused by a technical error.</li>
          <li>
            Charges made after a properly completed cancellation due to an
            error on our part.
          </li>
          <li>
            Incorrect subscription charges caused by a Revsi billing-system
            error.
          </li>
          <li>
            Other circumstances where a refund is required by applicable law.
          </li>
        </ul>
        <p>
          To report a billing issue, contact us within 30 days of the charge at
          info@revsi.app and include sufficient information for us to identify
          the account and transaction. Submitting a request does not guarantee
          a refund. Approved refunds will generally be returned to the original
          payment method.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this Policy">
        <p>
          We may update this Policy as Revsi evolves. If we make a material
          change affecting an existing paid subscription, we will provide
          reasonable notice before the change takes effect where appropriate or
          required by law. The version posted on Revsi will identify its
          effective or last-updated date.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact us">
        <p>
          For billing questions, cancellation assistance, or subscription
          support, please contact:
        </p>
        <p>
          Webb Consulting LLC
          <br />
          243 Ridge McIntire Rd #1042
          <br />
          Charlottesville, VA 22911
          <br />
          Email: info@revsi.app
          <br />
          Website: revsi.app
        </p>
      </LegalSection>
    </LegalPage>
  );
}
