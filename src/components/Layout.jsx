import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import BreakingTicker from './BreakingTicker';
import AdSense from './AdSense';

export default function Layout({ children, title, description }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        <link rel="icon" href="/favicon.ico" />
        {/* Google AdSense Script */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
        />
      </Head>

      {/* Top banner ad */}
      <div className="w-full flex justify-center py-2 bg-stone-100 dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800">
        <AdSense type="leaderboard" />
      </div>

      <Navbar />
      <BreakingTicker />

      <main className="min-h-screen">{children}</main>

      <Footer />
    </>
  );
}
