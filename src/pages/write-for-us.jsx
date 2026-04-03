import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import { FiCheckCircle, FiMail, FiFileText } from 'react-icons/fi';

const REQUIREMENTS = [
  'Original, well-researched, and fact-checked content.',
  'Clear structure with headings, sources, and practical value.',
  'No plagiarism, spun content, or AI-only low-value articles.',
  'Author bio and one relevant profile link.',
  'Minimum 800 words for feature submissions.',
];

export default function WriteForUsPage() {
  return (
    <>
      <NextSeo
        title="Write For Us | CeylonUpdates.com"
        description="Contribute to CeylonUpdates.com. Submit high-quality articles on Sri Lanka news, tech, AI, jobs, sports, and education."
        canonical="https://ceylonupdates.com/write-for-us"
      />

      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="rounded-2xl bg-gradient-to-br from-navy to-accent p-8 text-white">
            <h1 className="font-head text-3xl font-black md:text-4xl">Write For Us</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
              We welcome experienced writers, journalists, and subject experts who can publish useful,
              trustworthy content for our audience.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">What We Publish</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-600 dark:text-neutral-400">
                <li>Sri Lanka News and analysis</li>
                <li>World News explainers</li>
                <li>Tech News and product trends</li>
                <li>AI & Innovation tutorials</li>
                <li>Jobs & Careers guidance</li>
                <li>Sports and Education stories</li>
              </ul>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">Editorial Standards</h2>
              <div className="mt-3 space-y-2">
                {REQUIREMENTS.map((item) => (
                  <p key={item} className="flex items-start gap-2 text-sm text-stone-600 dark:text-neutral-400">
                    <FiCheckCircle className="mt-0.5 shrink-0 text-accent" size={14} />
                    {item}
                  </p>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">How To Submit</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-stone-600 dark:text-neutral-400">
              <li>Send your topic pitch and outline.</li>
              <li>Include 2 writing samples or published links.</li>
              <li>Add a short author bio and preferred contact details.</li>
            </ol>

            <a
              href="mailto:editor@ceylonupdates.com?subject=Write%20For%20Us%20Submission"
              className="mt-5 inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <FiMail size={14} /> Submit Your Pitch
            </a>
            <p className="mt-3 text-xs text-stone-500 dark:text-neutral-500 inline-flex items-center gap-1">
              <FiFileText size={12} />
              Response time: usually within 3-5 business days.
            </p>
          </section>
        </div>
      </Layout>
    </>
  );
}
