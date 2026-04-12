import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const CONTACT_EMAIL = "bharatskilldevelopmentacademy@gmail.com";
const SITE = "https://bharatskillacademy.com";

export default function Privacy() {
  return (
    <section className="section-page contact-page">
      <Helmet>
        <title>Privacy Policy | Bharat Skill Development Academy</title>
        <meta
          name="description"
          content="Privacy policy for Bharat Skill Development Academy website and mobile app — how we handle your data, accounts, and enquiries."
        />
        <link rel="canonical" href={`${SITE}/privacy`} />
      </Helmet>
      <div className="container">
        <header className="page-head theme-section-head contact-page__intro">
          <span>Legal</span>
          <h1>Privacy policy</h1>
          <p>
            This policy describes how Bharat Skill Development Academy (“we”, “us”) collects and uses information when
            you use our website <a href={SITE}>{SITE.replace("https://", "")}</a>, our training services, or our official
            Android app on Google Play.
          </p>
          <p className="privacy-meta">
            <strong>Effective date:</strong> 10 April 2026. We may update this page; the latest version is always here.
          </p>
        </header>

        <div className="privacy-prose info-card contact-info" style={{ maxWidth: "720px", margin: "0 auto 48px" }}>
          <h2>1. What we collect</h2>
          <ul>
            <li>
              <strong>Account &amp; learning data:</strong> When you register or sign in, we store details you provide
              (such as name, email, phone) and information related to courses, enrollments, orders, wishlists, and
              notifications as needed to run the platform.
            </li>
            <li>
              <strong>Enquiries:</strong> Messages you send via our contact or enquiry forms, including the details you
              type in the form.
            </li>
            <li>
              <strong>Payments:</strong> Payments are processed by our payment provider. We do not store full card
              numbers on our servers; we may receive payment status, transaction references, and billing-related
              metadata required to confirm your purchase.
            </li>
            <li>
              <strong>Technical data:</strong> Standard server and app logs (for example IP address, device/browser
              type, approximate timestamps) used for security, debugging, and improving reliability.
            </li>
          </ul>

          <h2>2. How we use information</h2>
          <ul>
            <li>To provide courses, accounts, certificates, and customer support.</li>
            <li>To process enrolments, orders, and payments.</li>
            <li>To send service-related messages (such as account or order updates) where applicable.</li>
            <li>To secure our systems and prevent fraud or abuse.</li>
            <li>To comply with applicable law.</li>
          </ul>

          <h2>3. Sharing</h2>
          <p>
            We do not sell your personal information. We share data only with service providers who help us operate the
            site and app (for example hosting, email or form delivery, payment processing, analytics as configured),
            and only as needed for those services. We may disclose information if required by law or to protect our
            rights and users.
          </p>

          <h2>4. Cookies &amp; storage</h2>
          <p>
            We use cookies and similar technologies (including local storage) to keep you signed in, remember
            preferences, run the shopping cart, and understand how the service is used. You can control cookies through
            your browser settings; some features may not work without them.
          </p>

          <h2>5. Android app</h2>
          <p>
            Our Play Store app loads the same service as our website (or bundled web content synced with it). Data
            practices are the same as described here. The app requires network access to function.
          </p>

          <h2>6. Children</h2>
          <p>
            Our services are aimed at learners and professionals. If you believe a child has provided personal data
            without appropriate consent, contact us and we will take reasonable steps to delete it.
          </p>

          <h2>7. Your choices</h2>
          <p>
            You may request access, correction, or deletion of certain personal data where applicable law allows. Contact
            us using the email below. We may need to verify your identity before acting on a request.
          </p>

          <h2>8. Contact</h2>
          <p>
            Questions about this policy:{" "}
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Privacy policy question")}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            or <Link to="/contact">contact page</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
