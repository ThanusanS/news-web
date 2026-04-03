import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import BreakingTicker from './BreakingTicker';
import AdSense from './AdSense';

export default function Layout({ children, title, description }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '';
  const hasRealAdsenseId = adsenseId.startsWith('ca-pub-') && !adsenseId.includes('XXXX');

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        <link rel="icon" href="/favicon.ico" />
        {/* Google AdSense Script */}
        {hasRealAdsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </Head>

      {/* Top banner ad (render only when a real AdSense ID is configured) */}
      {hasRealAdsenseId && (
        <div className="hidden md:flex w-full justify-center border-b border-stone-200 bg-stone-100 py-2 dark:border-neutral-800 dark:bg-neutral-900">
          <AdSense type="leaderboard" />
        </div>
      )}

      <Navbar />
      <BreakingTicker />

      <main className="min-h-screen">{children}</main>

      <Footer />
    </>
  );
}
