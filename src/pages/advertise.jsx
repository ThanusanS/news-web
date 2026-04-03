import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import { FiBarChart2, FiMail, FiUsers } from 'react-icons/fi';

const OPTIONS = [
  'Homepage featured placements',
  'Category page display campaigns',
  'Newsletter sponsorships',
  'Branded content opportunities',
];

export default function AdvertisePage() {
  return (
    <>
      <NextSeo
        title="Advertise With Us | CeylonUpdates.com"
        description="Partner with CeylonUpdates.com to reach engaged readers across Sri Lanka and South Asia through display ads and sponsorships."
        canonical="https://ceylonupdates.com/advertise"
      />

      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="rounded-2xl bg-gradient-to-br from-accent to-accent2 p-8 text-white">
            <h1 className="font-head text-3xl font-black md:text-4xl">Advertise With Us</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">
              Reach a high-intent audience interested in news, technology, careers, and education.
              We focus on relevant placements and brand-safe publishing standards.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100 inline-flex items-center gap-2">
                <FiUsers size={18} className="text-accent" /> Audience Snapshot
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-600 dark:text-neutral-400">
                <li>Readers across Sri Lanka and South Asia</li>
                <li>Strong interest in news and technology topics</li>
                <li>Mobile-first and socially active audience</li>
              </ul>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100 inline-flex items-center gap-2">
                <FiBarChart2 size={18} className="text-accent" /> Ad Options
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-600 dark:text-neutral-400">
                {OPTIONS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">Request Our Media Kit</h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-neutral-400">
              Share your campaign goals, target audience, budget range, and preferred timeline. Our
              team will respond with recommended packages.
            </p>
            <a
              href="mailto:ads@ceylonupdates.com?subject=Advertising%20Inquiry"
              className="mt-4 inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <FiMail size={14} /> Contact Advertising Team
            </a>
          </section>
        </div>
      </Layout>
    </>
  );
}
