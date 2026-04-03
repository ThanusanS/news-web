import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import { FiMail, FiBriefcase, FiFileText, FiUsers } from 'react-icons/fi';

const CONTACT_CHANNELS = [
  {
    title: 'Editorial',
    email: 'editor@ceylonupdates.com',
    description: 'News tips, corrections, and editorial feedback.',
    icon: FiFileText,
  },
  {
    title: 'Advertising',
    email: 'ads@ceylonupdates.com',
    description: 'Sponsored content, banner ads, and media kit requests.',
    icon: FiBriefcase,
  },
  {
    title: 'Support',
    email: 'support@ceylonupdates.com',
    description: 'Technical issues, account support, and general help.',
    icon: FiUsers,
  },
];

export default function ContactPage() {
  return (
    <>
      <NextSeo
        title="Contact Us | CeylonUpdates.com"
        description="Contact the CeylonUpdates team for editorial inquiries, ad partnerships, or support."
        canonical="https://ceylonupdates.com/contact"
      />

      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-navy to-accent p-8 text-white">
            <h1 className="font-head text-3xl font-black md:text-4xl">Contact Us</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
              We usually respond within 1 to 2 business days. For fastest support, send your message to the
              relevant email below.
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
                <p className="mt-2 text-sm text-stone-500 dark:text-neutral-500">{channel.description}</p>
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
            <h2 className="font-head text-xl font-bold text-stone-900 dark:text-neutral-100">Send a Message</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-neutral-500">
              This form is for convenience. For urgent issues, email us directly.
            </p>

            <form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Full Name
                </label>
                <input className="form-input" type="text" name="name" placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Email Address
                </label>
                <input className="form-input" type="email" name="email" placeholder="you@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Subject
                </label>
                <input className="form-input" type="text" name="subject" placeholder="How can we help?" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Message
                </label>
                <textarea className="form-input min-h-[140px]" name="message" placeholder="Write your message here..." />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <p className="text-xs text-stone-400 dark:text-neutral-600">
                  By submitting, you agree to our Privacy Policy and Terms & Conditions.
                </p>
                <button type="submit" className="btn-primary">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}
