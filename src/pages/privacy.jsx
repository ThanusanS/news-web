import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';

export default function PrivacyPage() {
  const updatedOn = 'April 3, 2026';

  return (
    <>
      <NextSeo
        title="Privacy Policy | CeylonUpdates.com"
        description="Read the CeylonUpdates.com Privacy Policy, including data collection, cookies, analytics, and Google AdSense advertising disclosures."
        canonical="https://ceylonupdates.com/privacy"
      />

      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
          <h1 className="font-head text-3xl font-black text-stone-900 dark:text-neutral-100 md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-stone-500 dark:text-neutral-500">Last updated: {updatedOn}</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-stone-700 dark:text-neutral-300">
            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">1. Overview</h2>
              <p className="mt-2">
                CeylonUpdates.com respects your privacy. This Privacy Policy explains what information we collect,
                how we use it, and your choices regarding your personal data.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">2. Information We Collect</h2>
              <p className="mt-2">We may collect the following categories of information:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Contact data you provide, such as name and email address.</li>
                <li>Newsletter subscription data.</li>
                <li>Comments and feedback submitted on our platform.</li>
                <li>Technical data such as browser type, device details, IP address, and referral pages.</li>
                <li>Usage data such as visited pages, time on page, and interaction events.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">3. How We Use Information</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Provide, operate, and improve our website and content.</li>
                <li>Respond to messages, requests, and customer support inquiries.</li>
                <li>Deliver newsletters and site updates when you opt in.</li>
                <li>Prevent abuse, fraud, and unauthorized access.</li>
                <li>Measure audience engagement and improve performance.</li>
                <li>Display and optimize relevant advertisements.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">4. Cookies and Similar Technologies</h2>
              <p className="mt-2">
                We use cookies and similar technologies to keep the site functional, analyze usage, and support
                advertising. Cookies may be set by us and by trusted third-party services.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">5. Google AdSense and Advertising</h2>
              <p className="mt-2">
                We use Google AdSense to serve ads. Google and its partners may use cookies to personalize ads based
                on your prior visits to this and other websites.
              </p>
              <p className="mt-2">
                Users may opt out of personalized advertising by visiting Google Ads Settings at
                {' '}
                <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                  adssettings.google.com
                </a>
                .
              </p>
              <p className="mt-2">
                You can also visit
                {' '}
                <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                  www.aboutads.info
                </a>
                {' '}
                for more information about interest-based advertising and opt-out options.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">6. Data Sharing</h2>
              <p className="mt-2">
                We do not sell personal information. We may share data with service providers that help us operate
                the website, send newsletters, secure the platform, and analyze traffic, subject to contractual and
                legal safeguards.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">7. Data Retention and Security</h2>
              <p className="mt-2">
                We retain data only as long as necessary for the purposes outlined in this policy and legal
                obligations. We apply reasonable administrative, technical, and organizational measures to protect
                personal data.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">8. Your Rights</h2>
              <p className="mt-2">
                Depending on your location, you may have rights to access, correct, delete, or restrict the use of
                your personal data, and to object to certain processing activities.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">9. Children&apos;s Privacy</h2>
              <p className="mt-2">
                Our services are not directed to children under 13. We do not knowingly collect personal data from
                children under 13.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">10. Contact</h2>
              <p className="mt-2">
                For privacy questions or requests, contact us at
                {' '}
                <a href="mailto:privacy@ceylonupdates.com" className="text-blue-600 hover:underline dark:text-blue-400">
                  privacy@ceylonupdates.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}
