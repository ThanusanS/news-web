import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import { FiMail, FiBriefcase, FiFileText, FiUsers } from 'react-icons/fi';

const CONTACT_CHANNELS = [
  {
    title: 'Editorial',
    email: 'editor@ceylonupdates.me',
    description: 'News tips, corrections, and editorial feedback.',
    icon: FiFileText,
  },
  {
    title: 'Advertising',
    email: 'ads@ceylonupdates.me',
    description: 'Sponsored content, banner ads, and media kit requests.',
    icon: FiBriefcase,
  },
  {
    title: 'Support',
    email: 'support@ceylonupdates.me',
    description: 'Technical issues, account support, and general help.',
    icon: FiUsers,
  },
];

export default function ContactPage() {
  return (
    <>
      <NextSeo
        title="Contact Us | CeylonUpdates.me"
        description="Contact the CeylonUpdates team for editorial inquiries, ad partnerships, or support."
        canonical="https://www.ceylonupdates.me/contact"
      />

      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-navy to-accent p-8 text-white">
            <h1 className="font-head text-3xl font-black md:text-4xl">Contact Us</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
              We usually respond within 1 to 2 business days. For fastest support, send your message
              to the relevant email below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {CONTACT_CHANNELS.map((channel) => (
              <div
                key={channel.title}
                className="rounded-xl border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="mb-3 text-accent">
                  <channel.icon size={22} />
                </div>
                <h2 className="font-head text-lg font-bold text-stone-900 dark:text-neutral-100">
                  {channel.title}
                </h2>
                <p className="mt-2 text-sm text-stone-500 dark:text-neutral-500">
                  {channel.description}
                </p>
                <a
                  href={`mailto:${channel.email}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  <FiMail size={14} />
                  {channel.email}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">
              Send a Message
            </h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-neutral-500">
              For the fastest response, email us directly. Please include your name, topic, and a
              brief message.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href="mailto:editor@ceylonupdates.me" className="btn-primary inline-flex">
                Email Editorial
              </a>
              <a
                href="mailto:support@ceylonupdates.me"
                className="inline-flex rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
