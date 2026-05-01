import Link from 'next/link';
import Layout from '../components/Layout';
import { NextSeo } from 'next-seo';

export default function Custom404() {
  return (
    <>
      <NextSeo title="Page Not Found | CeylonUpdates.me" noindex />
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mb-6 text-8xl">404</div>
          <h1 className="mb-4 font-head text-5xl font-black text-stone-900 dark:text-neutral-50">
            404
          </h1>
          <p className="mb-2 text-xl text-stone-600 dark:text-neutral-400">Page Not Found</p>
          <p className="mb-8 text-stone-400 dark:text-neutral-600">
            The article or page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/" className="btn-primary px-6 py-2.5">
              ← Home
            </Link>
            <Link href="/search" className="btn-secondary px-6 py-2.5">
              Search Articles
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}
