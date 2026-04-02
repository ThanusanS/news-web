import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import AdSense from '../components/AdSense';
import Newsletter from '../components/Newsletter';
import Link from 'next/link';
import Image from 'next/image';
import { getArticles, getTrendingArticles } from '../lib/appwrite';

// Fallback demo articles for when Appwrite is not yet configured
const DEMO_ARTICLES = [
  { $id: '1', slug: 'sri-lanka-digital-economy-2026', title: "Sri Lanka's Digital Economy Reaches Record $8.5B — Government Targets $25B by 2030", category: 'sri-lanka', author: 'Nimal Perera', publishedAt: new Date().toISOString(), views: 24830, excerpt: "Strong performance in tourism, exports and digital services drives Sri Lanka's digital transformation.", content: 'Lorem ipsum '.repeat(200) },
  { $id: '2', slug: 'chatgpt-guide-2026', title: 'How to Use ChatGPT for Content Creation — Complete 2026 Guide', category: 'ai-tutorials', author: 'Kasun Silva', publishedAt: new Date().toISOString(), views: 18400, excerpt: 'Master ChatGPT with proven prompting techniques for writing, coding, research and business tasks.', content: 'Lorem ipsum '.repeat(200) },
  { $id: '3', slug: 'apple-wwdc-2026', title: 'Apple WWDC 2026: M5 Chip, iOS 20 & AI-Native Siri Unveiled', category: 'tech-news', author: 'Ravi De Silva', publishedAt: new Date().toISOString(), views: 12200, excerpt: "Apple's biggest developer conference brought major AI upgrades across all platforms.", content: 'Lorem ipsum '.repeat(200) },
  { $id: '4', slug: 'react-19-guide', title: 'React 19 Complete Guide: Server Components, Actions & New Hooks', category: 'programming', author: 'Janaka Fernando', publishedAt: new Date().toISOString(), views: 9800, excerpt: 'Everything changed in React 19. Here is your complete guide with real project examples.', content: 'Lorem ipsum '.repeat(200) },
  { $id: '5', slug: 'prompt-engineering-2026', title: 'Master Prompt Engineering: 20 Techniques That Actually Work in 2026', category: 'ai-tutorials', author: 'Sunil Dias', publishedAt: new Date().toISOString(), views: 15600, excerpt: 'From chain-of-thought to meta-prompts, these battle-tested techniques will transform how you use AI.', content: 'Lorem ipsum '.repeat(200) },
  { $id: '6', slug: 'sri-lanka-tourism-record', title: 'Record 2.1 Million Tourists Visit Sri Lanka in Q1 2026 — Europe Leads', category: 'sri-lanka', author: 'Amila Perera', publishedAt: new Date().toISOString(), views: 8300, excerpt: "Sri Lanka's tourism sector continues its remarkable post-pandemic recovery with record-breaking figures.", content: 'Lorem ipsum '.repeat(200) },
];

export default function HomePage({ latestArticles, trendingArticles, heroArticle, sideArticles }) {
  return (
    <>
      <NextSeo
        title="CeylonUpdates.com — Latest Sri Lanka News, AI Tutorials & Tech"
        description="Latest Sri Lanka news, AI tutorials, tech updates and programming guides. Your #1 source for fast, reliable news and in-depth tech content. Updated 5× daily."
        canonical="https://ceylonupdates.com"
        openGraph={{
          type: 'website',
          url: 'https://ceylonupdates.com',
          title: 'CeylonUpdates.com — Latest Sri Lanka News, AI & Tech',
          description: 'Latest Sri Lanka news, AI tutorials, tech updates and programming guides.',
          images: [{ url: 'https://ceylonupdates.com/og-default.jpg', width: 1200, height: 630 }],
          site_name: 'CeylonUpdates.com',
        }}
        twitter={{ cardType: 'summary_large_image', site: '@CeylonUpdates' }}
      />

      <Layout>
        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main hero */}
            <Link href={`/${heroArticle?.slug || '#'}`} className="lg:col-span-2 relative rounded-xl overflow-hidden group cursor-pointer block min-h-[360px] bg-gradient-to-br from-navy to-accent">
              {heroArticle?.featuredImage && (
                <Image src={heroArticle.featuredImage} alt={heroArticle.title} fill className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" priority />
              )}
              <div className="absolute inset-0 hero-overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block bg-accent text-white text-[10px] font-black tracking-widest px-2 py-1 rounded mb-3 uppercase">
                  {heroArticle?.category?.replace(/-/g, ' ') || 'Sri Lanka'}
                </span>
                <h1 className="font-head text-white text-2xl md:text-3xl font-black leading-snug mb-2">
                  {heroArticle?.title || 'Welcome to CeylonUpdates — Your Daily News & Tech Source'}
                </h1>
                <p className="text-white/70 text-sm">
                  By {heroArticle?.author || 'Staff Writer'} &nbsp;·&nbsp; {heroArticle?.views?.toLocaleString() || '0'} views &nbsp;·&nbsp; 5 min read
                </p>
              </div>
            </Link>

            {/* Side cards */}
            <div className="flex flex-col gap-3">
              {sideArticles.slice(0, 4).map((a) => (
                <Link key={a.$id} href={`/${a.slug}`} className="flex gap-3 p-3 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg hover:border-accent group transition-all">
                  <div className="w-20 h-16 shrink-0 rounded bg-gradient-to-br from-navy to-accent flex items-center justify-center text-xl overflow-hidden">
                    {a.featuredImage ? <Image src={a.featuredImage} alt={a.title} width={80} height={64} className="object-cover w-full h-full" /> : '📰'}
                  </div>
                  <div>
                    <div className="text-[9px] font-black tracking-widest text-accent uppercase mb-1">
                      {a.category?.replace(/-/g, ' ')}
                    </div>
                    <h3 className="font-head font-bold text-sm leading-snug text-stone-900 dark:text-neutral-100 group-hover:text-accent transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-[11px] text-stone-400 dark:text-neutral-600 mt-1">
                      {a.views?.toLocaleString()} views · {Math.ceil((a.content?.split(' ')?.length || 400) / 200)} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEADERBOARD AD ── */}
        <div className="max-w-7xl mx-auto px-4 mb-6 flex justify-center">
          <AdSense type="leaderboard" />
        </div>

        {/* ── MAIN CONTENT + SIDEBAR ── */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div>
              {/* Latest News */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-stone-200 dark:border-neutral-800">
                  <h2 className="section-title">Latest News</h2>
                  <Link href="/category/sri-lanka" className="text-xs font-bold text-accent hover:underline">All News →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {latestArticles.slice(0, 3).map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* In-article ad */}
              <div className="mb-8 flex justify-center">
                <AdSense type="inArticle" />
              </div>

              {/* AI Tutorials */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-stone-200 dark:border-neutral-800">
                  <h2 className="section-title">🤖 AI Tutorials</h2>
                  <Link href="/category/ai-tutorials" className="text-xs font-bold text-accent hover:underline">All Tutorials →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {latestArticles.filter((a) => a.category === 'ai-tutorials').slice(0, 3).map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* Programming Guides */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-stone-200 dark:border-neutral-800">
                  <h2 className="section-title">🐍 Programming Guides</h2>
                  <Link href="/category/programming" className="text-xs font-bold text-accent hover:underline">All Guides →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {latestArticles.filter((a) => a.category === 'programming').slice(0, 3).map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <Sidebar trendingArticles={trendingArticles} />
          </div>
        </div>

        {/* ── NEWSLETTER SECTION ── */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <Newsletter />
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  try {
    const [latestRes, trendingRes] = await Promise.allSettled([
      getArticles({ limit: 12 }),
      getTrendingArticles(6),
    ]);

    const latestArticles = latestRes.status === 'fulfilled' ? latestRes.value.documents : [];
    const trendingArticles = trendingRes.status === 'fulfilled' ? trendingRes.value.documents : [];
    const safeLatest = latestArticles.length ? latestArticles : DEMO_ARTICLES;
    const safeTrending = trendingArticles.length ? trendingArticles : safeLatest.slice(0, 5);

    return {
      props: {
        latestArticles: safeLatest,
        trendingArticles: safeTrending,
        heroArticle: safeLatest[0] || null,
        sideArticles: safeLatest.slice(1, 5),
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        latestArticles: DEMO_ARTICLES,
        trendingArticles: DEMO_ARTICLES.slice(0, 5),
        heroArticle: DEMO_ARTICLES[0],
        sideArticles: DEMO_ARTICLES.slice(1, 5),
      },
      revalidate: 60,
    };
  }
}
