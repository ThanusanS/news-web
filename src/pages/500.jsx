import Link from 'next/link';
import Layout from '../components/Layout';
import { NextSeo } from 'next-seo';

export default function Custom500() {
  return (
    <>
      <NextSeo title="Server Error | CeylonUpdates.com" noindex />
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="text-8xl mb-6">🔧</div>
          <h1 className="font-head text-5xl font-black text-stone-900 dark:text-neutral-50 mb-4">500</h1>
          <p className="text-xl text-stone-600 dark:text-neutral-400 mb-2">Server Error</p>
          <p className="text-stone-400 dark:text-neutral-600 mb-8">
            Something went wrong on our end. Our team has been notified and is working on a fix.
          </p>
          <Link href="/" className="btn-primary px-6 py-2.5">← Back to Home</Link>
        </div>
      </Layout>
    </>
  );
}
