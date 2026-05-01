import Link from 'next/link';
import Layout from '../components/Layout';
import { NextSeo } from 'next-seo';
import { FiTool } from 'react-icons/fi';

export default function Custom500() {
  return (
    <>
      <NextSeo title="Server Error | CeylonUpdates.me" noindex />
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mb-6 flex justify-center">
            <FiTool size={72} className="text-stone-400 dark:text-neutral-500" />
          </div>
          <h1 className="mb-4 font-head text-5xl font-black text-stone-900 dark:text-neutral-50">
            500
          </h1>
          <p className="mb-2 text-xl text-stone-600 dark:text-neutral-400">Server Error</p>
          <p className="mb-8 text-stone-400 dark:text-neutral-600">
            Something went wrong on our end. Our team has been notified and is working on a fix.
          </p>
          <Link href="/" className="btn-primary px-6 py-2.5">
            ← Back to Home
          </Link>
        </div>
      </Layout>
    </>
  );
}
