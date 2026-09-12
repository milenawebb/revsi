import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · revsi.app" },
      { name: "description", content: "Privacy Policy for revsi.app, operated by Webb Consulting LLC." },
      { property: "og:title", content: "Privacy Policy · revsi.app" },
      { property: "og:description", content: "Privacy Policy for revsi.app, operated by Webb Consulting LLC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 10, 2026" draft={false}>
      <p>
        This Privacy Policy explains how Webb Consulting LLC, a Virginia
        limited liability company ("Webb Consulting," "Revsi," "we," "us," or
        "our"), collects, uses, discloses, retains, and protects personal
        information in connection with revsi.app and related services (the
        "Service"). Revsi is a DBA of Webb Consulting LLC.
      </p>

      <LegalSection heading="1. Our role and your role">
        <p>
          For information associated with your Revsi account, such as your
          name, email address, login information, billing information, and
          business details, Webb Consulting generally acts as the controller
          because we determine how that information is used to operate and
          administer the Service.
        </p>
        <p>
          For personal information that a business user uploads, imports,
          enters, or otherwise provides about its customers or other recipients
          ("Recipient Data"), the business user is the controller and Revsi
          acts as a processor or service provider. We process Recipient Data on
          the business user's documented instructions to provide the Service,
          including sending review requests, reminders, and related
          communications.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Account information, including name, email address, password or
            authentication credentials, and business affiliation.
          </li>
          <li>
            Business settings, including business name, review destination
            links, message style, templates, and communication preferences.
          </li>
          <li>
            Recipient Data provided by a business user, such as recipient name,
            email address, phone number, and information needed to identify the
            relevant customer interaction.
          </li>
          <li>
            Message and delivery data, such as sends, deliveries, bounces,
            failures, unsubscribes, and similar status information.
          </li>
          <li>
            Interaction data, including clicks on review links and other
            Service interactions.
          </li>
          <li>
            Technical and security data, which may include IP address, browser or
            device information, timestamps, authentication events, and logs used
            to operate, secure, and troubleshoot the Service.
          </li>
          <li>
            Billing and transaction information when you subscribe to a paid
            plan. Revsi currently offers 20 review requests per business at no
            charge and does not require a payment card to start. If you
            continue after using those 20 requests, the primary business plan is
            $29 per month for unlimited review requests for one business.
            Additional businesses managed under the same login are $15 per month
            each and are billed separately. Payment card information may be
            processed by a third-party payment processor rather than stored
            directly by Revsi.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. How we use information">
        <p>We use personal information as reasonably necessary to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide, operate, maintain, secure, and improve the Service.</li>
          <li>Create and administer accounts and authenticate users.</li>
          <li>
            Send review requests and reminders at the instruction of business
            users.
          </li>
          <li>
            Manage unsubscribes, suppression records, delivery issues, and
            customer support.
          </li>
          <li>Provide dashboards, reporting, and service-related communications.</li>
          <li>
            Prevent fraud, abuse, spam, unauthorized access, and violations of
            our Terms of Service.
          </li>
          <li>Comply with applicable law and enforce our agreements.</li>
        </ul>
        <p>
          We do not sell Recipient Data. We do not use Recipient Data to
          advertise Revsi or unrelated products to recipients, and we do not use
          a business user's Recipient Data for our own independent marketing
          purposes.
        </p>
      </LegalSection>

      <LegalSection heading="4. How we disclose information">
        <p>
          We may disclose personal information to service providers and
          subprocessors that help us operate the Service, subject to appropriate
          contractual or other safeguards. We may also disclose information when
          required by law, to protect rights or security, in connection with a
          corporate transaction, or with the direction or consent of the
          applicable business user or individual.
        </p>
      </LegalSection>

      <LegalSection heading="5. Service providers and subprocessors">
        <p>Revsi currently uses service providers that may include:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase, for database, authentication, and hosting-related services.</li>
          <li>Resend, for email delivery.</li>
          <li>Lovable, for application development and front-end infrastructure.</li>
          <li>
            Cloudflare, for infrastructure, security, and performance services
            where applicable.
          </li>
        </ul>
        <p>
          Our providers may change as the Service evolves. Where required, we
          will provide appropriate notice of material changes.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookies and similar technologies">
        <p>
          Revsi may use cookies, local storage, and similar technologies that
          are necessary for authentication, security, preferences, and operation
          of the Service. If we introduce non-essential analytics or advertising
          technologies, we will update this Policy and provide any notices or
          choices required by applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="7. Data retention">
        <p>
          We retain account and business information for as long as reasonably
          necessary to provide the Service, administer the account, comply with
          legal obligations, resolve disputes, and enforce agreements. Recipient
          Data is retained in accordance with the applicable business user's
          instructions and our operational and legal requirements. After an
          account is closed, information may remain for a limited period in
          backups, security logs, or records required for legal, fraud-prevention,
          accounting, or compliance purposes.
        </p>
        <p>
          Suppression and opt-out records may be retained for as long as
          necessary to ensure that an individual's request not to receive
          further communications continues to be honored.
        </p>
      </LegalSection>

      <LegalSection heading="8. Your choices and privacy rights">
        <p>
          Every applicable review-request email sent through Revsi includes a
          mechanism to unsubscribe from further review-request emails.
          Individuals may also contact the business that sent the request or
          contact us at{" "}
          <a href="mailto:info@revsi.app" className="underline underline-offset-2">
            info@revsi.app
          </a>{" "}
          regarding access, correction, deletion, or other privacy requests.
        </p>
        <p>
          When Revsi processes Recipient Data on behalf of a business user, we
          may refer the request to that business or assist the business in
          responding, because the business controls that data. Depending on
          where you live, applicable law may provide additional privacy rights.
        </p>
      </LegalSection>

      <LegalSection heading="9. Security">
        <p>
          We use administrative, technical, and organizational safeguards
          designed to protect personal information. These measures include
          encryption in transit and at rest where supported and access controls
          intended to segregate each business user's data. No method of
          transmission, storage, or security is completely risk-free, and we
          cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="10. Data incidents">
        <p>
          If we become aware of a security incident involving personal
          information, we will investigate and take reasonable responsive
          measures. We will provide notices to affected business users,
          individuals, or authorities when required by applicable law or our
          contractual obligations.
        </p>
      </LegalSection>

      <LegalSection heading="11. International data transfers">
        <p>
          The Service is operated from the United States and information may be
          stored or processed in the United States and other locations where our
          service providers operate. If you use the Service from another
          country, your information may be transferred to jurisdictions with
          different data-protection laws. Where required, we use appropriate
          safeguards for such transfers.
        </p>
      </LegalSection>

      <LegalSection heading="12. Children">
        <p>
          The Service is intended for business users who are at least 18 years
          old and is not directed to children. Business users must not knowingly
          provide Revsi with personal information about children in violation
          of applicable law.
        </p>
      </LegalSection>

      <LegalSection heading="13. Business transfers">
        <p>
          If Webb Consulting is involved in a merger, acquisition, financing,
          reorganization, sale of assets, or similar transaction, information
          may be transferred as part of that transaction, subject to applicable
          law.
        </p>
      </LegalSection>

      <LegalSection heading="14. Changes to this Policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the
          updated version with a revised "Last updated" date and, when
          appropriate, provide additional notice of material changes.
        </p>
      </LegalSection>

      <LegalSection heading="15. Contact">
        <p>
          Privacy questions or requests may be sent to:{" "}
          <a href="mailto:info@revsi.app" className="underline underline-offset-2">
            info@revsi.app
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
