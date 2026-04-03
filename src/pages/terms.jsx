import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';

export default function TermsPage() {
  const updatedOn = 'April 3, 2026';

  return (
    <>
      <NextSeo
        title="Terms & Conditions | CeylonUpdates.com"
        description="Read the Terms & Conditions for using CeylonUpdates.com, including acceptable use, content rights, and legal disclaimers."
        canonical="https://ceylonupdates.com/terms"
      />

      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
          <h1 className="font-head text-3xl font-black text-stone-900 dark:text-neutral-100 md:text-4xl">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-sm text-stone-500 dark:text-neutral-500">Last updated: {updatedOn}</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-stone-700 dark:text-neutral-300">
            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing or using CeylonUpdates.com, you agree to be bound by these Terms & Conditions and all
                applicable laws.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">2. Use of the Website</h2>
              <p className="mt-2">You agree not to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Use the website for unlawful, harmful, or fraudulent activity.</li>
                <li>Attempt to gain unauthorized access to systems or data.</li>
                <li>Disrupt site availability, performance, or security.</li>
                <li>Copy, scrape, or redistribute content in violation of applicable rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">3. Intellectual Property</h2>
              <p className="mt-2">
                Unless otherwise stated, all content on this site, including text, graphics, logos, and code, is the
                property of CeylonUpdates.com or its licensors and is protected by applicable intellectual property
                laws.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">4. User-Generated Content</h2>
              <p className="mt-2">
                If you submit comments, messages, or other content, you are responsible for that content and must
                have the rights to share it. We reserve the right to moderate, remove, or refuse content that violates
                law, policy, or community standards.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">5. Advertising and Third-Party Services</h2>
              <p className="mt-2">
                We may display ads, including Google AdSense ads, and use third-party tools for analytics and
                website operations. Interactions with third-party services are subject to their own terms and privacy
                policies.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">6. No Professional Advice</h2>
              <p className="mt-2">
                Content on this site is provided for general informational purposes only and does not constitute legal,
                financial, medical, or other professional advice.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">7. Disclaimer of Warranties</h2>
              <p className="mt-2">
                The website is provided on an "as is" and "as available" basis without warranties of any kind,
                express or implied, to the maximum extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">8. Limitation of Liability</h2>
              <p className="mt-2">
                To the extent permitted by law, CeylonUpdates.com and its operators are not liable for indirect,
                incidental, consequential, or special damages arising from your use of the site.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">9. Changes to These Terms</h2>
              <p className="mt-2">
                We may update these Terms & Conditions from time to time. Continued use of the site after updates
                means you accept the revised terms.
              </p>
            </section>

            <section>
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">10. Contact</h2>
              <p className="mt-2">
                For questions regarding these Terms & Conditions, contact
                {' '}
                <a href="mailto:legal@ceylonupdates.com" className="text-blue-600 hover:underline dark:text-blue-400">
                  legal@ceylonupdates.com
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
